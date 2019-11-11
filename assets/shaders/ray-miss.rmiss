#version 460
#extension GL_NV_ray_tracing : require
#extension GL_EXT_nonuniform_qualifier : enable
#extension GL_GOOGLE_include_directive : enable

#include "utils.glsl"

layout(location = 0) rayPayloadInNV RayPayload Ray;

layout (binding = 10, set = 0) uniform sampler2DArray environmentArray;

void main() {
  // texture based env
  /*const vec3 rd = normalize(gl_WorldRayDirectionNV.xyz);
  vec2 uv = vec2((1.0 + atan(rd.x, rd.z) / PI) / 2.0, acos(rd.y) / PI);
  const uint textureIndex = 1;
  const vec3 color = texture(skyboxArray, vec3(uv, textureIndex)).rgb;*/

  // gradient based env
  const float t = 0.75 * (normalize(gl_WorldRayDirectionNV).y + 1.0);
  vec3 color = mix(vec3(0.05), vec3(0.075), t);
  color = vec3(0);

  Ray.throughput = vec4(0);
  Ray.radianceAndDistance = vec4(pow(color, vec3(2.2)), -1.0);
}
