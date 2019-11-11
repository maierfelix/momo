#version 460
#extension GL_NV_ray_tracing : require
#extension GL_EXT_nonuniform_qualifier : enable
#extension GL_GOOGLE_include_directive : enable

#include "utils.glsl"

ShadingData shading;

#include "disney.glsl"

layout(location = 0) rayPayloadInNV RayPayload Ray;
layout(location = 1) rayPayloadNV ShadowRayPayload ShadowRay;

layout(binding = 0, set = 0) uniform accelerationStructureNV topLevelAS;

layout(binding = 3, set = 0) uniform CameraData {
  mat4 mViewInverse;
  mat4 mProjectionInverse;
  float aperture;
  float focusDistance;
  uint numberOfSamples;
  uint totalSampleCount;
  uint numberOfBounces;
  uint lightCount;
} uCamera;

layout(binding = 4, set = 0, std430) readonly buffer GeometryBuffer {
  Vertex GeometryAttributes[];
} GeometryAttributesArray[];

layout(binding = 5, set = 0, std430) readonly buffer FacesBuffer {
  uvec4 Faces[];
} FaceArray[];

layout(binding = 6, set = 0, std430) readonly buffer MaterialBuffer {
  Material material;
} MaterialArray[];

layout(binding = 7, set = 0, std430, row_major) readonly buffer InstanceBuffer {
  Instance instance;
} InstanceArray[];

layout(binding = 8, set = 0, std430) readonly buffer LightBuffer {
  Light light;
} LightBufferArray[];

layout (binding = 9, set = 0) uniform sampler2DArray textureArray;

layout (binding = 10, set = 0) uniform sampler2DArray environmentArray;

hitAttributeNV vec2 attribs;

vec3 DirectLight(const uint instanceId, in vec3 normal) {
  vec3 Lo = vec3(0.0);

  const LightSource lightSource = Ray.lightSource;

  const vec4 directionAndPdf = lightSource.directionAndPdf;
  const vec4 emissionAndGeometryId = lightSource.emissionAndGeometryId;

  const vec3 lightEmission = emissionAndGeometryId.xyz;
  const uint lightGeometryInstanceId = uint(emissionAndGeometryId.w);

  // if we hit a light source, then just returns its emission directly
  if (instanceId == lightGeometryInstanceId) return lightEmission;

  // abort if we are occluded
  if (Ray.shadowed) return Lo;

  const vec3 lightDir = directionAndPdf.xyz;
  const float lightPdf = directionAndPdf.w;
  const vec3 powerPdf = lightEmission * uCamera.lightCount;

  const vec3 N = normal;
  const vec3 V = -gl_WorldRayDirectionNV;
  const vec3 L = lightDir;
  const vec3 H = normalize(V + L);

  const float NdotH = max(0.0, dot(N, H));
  const float NdotL = max(0.0, dot(L, N));
  const float HdotL = max(0.0, dot(H, L));
  const float NdotV = max(0.0, dot(N, V));

  const float bsdfPdf = DisneyPdf(NdotH, NdotL, HdotL);

  const vec3 f = DisneyEval(NdotL, NdotV, NdotH, HdotL);

  Lo += powerHeuristic(lightPdf, bsdfPdf) * f * powerPdf / max(0.001, lightPdf);

  return max(vec3(0), Lo);
}

void main() {

  const uint instanceId = (gl_InstanceCustomIndexNV >> 0) & 0xFFFFFF;

  const Instance instance = InstanceArray[nonuniformEXT(instanceId)].instance;

  const uint geometryId = instance.geometryIndex;
  const uint materialId = instance.materialIndex;

  const uvec4 face = FaceArray[nonuniformEXT(geometryId)].Faces[gl_PrimitiveID];

  const Vertex v0 = GeometryAttributesArray[nonuniformEXT(geometryId)].GeometryAttributes[int(face.x)];
  const Vertex v1 = GeometryAttributesArray[nonuniformEXT(geometryId)].GeometryAttributes[int(face.y)];
  const Vertex v2 = GeometryAttributesArray[nonuniformEXT(geometryId)].GeometryAttributes[int(face.z)];

  const vec2 u0 = v0.uv.xy, u1 = v1.uv.xy, u2 = v2.uv.xy;
  const vec3 n0 = v0.normal.xyz, n1 = v1.normal.xyz, n2 = v2.normal.xyz;
  const vec3 t0 = v0.tangent.xyz, t1 = v1.tangent.xyz, t2 = v2.tangent.xyz;

  const Material material = MaterialArray[materialId].material;

  const vec2 uv = blerp(attribs, u0.xy, u1.xy, u2.xy);
  const vec3 no = blerp(attribs, n0.xyz, n1.xyz, n2.xyz);
  const vec3 ta = blerp(attribs, t0.xyz, t1.xyz, t2.xyz);

  const vec3 nw = normalize(instance.transformMatrix * vec4(no, 0));
  const vec3 tw = normalize(instance.transformMatrix * vec4(ta, 0));
  const vec3 bw = cross(nw, tw);

  const vec3 tex0 = texture(textureArray, vec3(uv, material.texAlbedoIndex)).rgb;
  const vec3 tex1 = texture(textureArray, vec3(uv, material.texNormalIndex)).rgb;
  const vec3 tex2 = texture(textureArray, vec3(uv, material.texMetalRoughnessIndex)).rgb;
  const vec3 tex3 = texture(textureArray, vec3(uv, material.texEmissiveIndex)).rgb;

  // material color
  const vec3 color = tex0 + pow(material.color, vec3(INV_GAMMA));
  // material normal
  const vec3 normal = normalize(
    material.texNormalIndex > 0 ?
    mat3(tw, bw, nw) * normalize((pow(tex1, vec3(INV_GAMMA))) * 2.0 - 1.0).xyz :
    nw
  );
  // material metalness/roughness
  const vec2 metalRoughness = vec2(tex2.r, tex2.g);
  // material emission
  const vec3 emission = tex3;

  const float metalness = metalRoughness.r + material.metalness;
  const float specular = material.specular;
  const float roughness = metalRoughness.g + material.roughness;
  const float anisotropy = material.anisotropy;
  const float specularTint = material.specularTint;
  const float sheenTint = material.sheenTint;
  const float sheen = material.sheen;
  const float clearcoatGloss = material.clearcoatGloss;
  const float clearcoat = material.clearcoat;
  const float subsurface = material.subsurface;

  uint seed = Ray.seed;
  float t = gl_HitTNV;

  vec3 radiance = vec3(0);
  vec3 throughput = Ray.throughput.rgb;

  radiance += emission * throughput;

  shading.base_color = color;
  shading.metallic = clamp(metalness, 0.001, 0.999);
  shading.specular = clamp(specular, 0.001, 0.999);
  shading.roughness = clamp(roughness, 0.001, 0.999);
  shading.anisotropy = clamp(anisotropy, 0.001, 0.999);
  shading.specular_tint = clamp(specularTint, 0.001, 0.999);
  shading.sheen_tint = clamp(sheenTint, 0.001, 0.999);
  shading.sheen = clamp(sheen, 0.001, 0.999);
  shading.clearcoat_gloss = clamp(clearcoatGloss, 0.001, 0.999);
  shading.clearcoat = clamp(clearcoat, 0.001, 0.999);
  shading.subsurface = clamp(subsurface, 0.001, 0.999);

  {
    const vec3 cd_lin = shading.base_color;
    const float cd_lum = dot(cd_lin, vec3(0.3, 0.6, 0.1));
    const vec3 c_tint = cd_lum > 0.0 ? (cd_lin / cd_lum) : vec3(1);
    const vec3 c_spec0 = mix((1.0 - shading.specular * 0.3) * mix(vec3(1), c_tint, shading.specular_tint), cd_lin, shading.metallic);
    const float cs_lum = dot(c_spec0, vec3(0.3, 0.6, 0.1));
    const float cs_w = cs_lum / (cs_lum + (1.0 - shading.metallic) * cd_lum);
    shading.csw = cs_w;
  }

  vec3 Lo = DirectLight(instanceId, normal);
  radiance += Lo * throughput;

  vec3 bsdfDir = DisneySample(seed, -gl_WorldRayDirectionNV, normal);

  const vec3 N = normal;
  const vec3 V = -gl_WorldRayDirectionNV;
  const vec3 L = bsdfDir;
  const vec3 H = normalize(V + L);

  const float NdotH = abs(dot(N, H));
  const float NdotL = abs(dot(L, N));
  const float HdotL = abs(dot(H, L));
  const float NdotV = abs(dot(N, V));

  float pdf = DisneyPdf(NdotH, NdotL, HdotL);
  if (pdf > 0.0) {
    throughput *= DisneyEval(NdotL, NdotV, NdotH, HdotL) / pdf;
  } else {
    t = -1.0;
  }

  Ray.radianceAndDistance = vec4(radiance, t);
  Ray.scatterDirection = vec4(bsdfDir, t);
  Ray.throughput = vec4(throughput, 1);
  Ray.seed = seed;
}
