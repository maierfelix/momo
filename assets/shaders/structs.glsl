#ifndef STRUCTS_H
#define STRUCTS_H

struct Vertex {
  vec4 position;
  vec4 normal;
  vec4 tangent;
  vec2 uv;
  vec2 pad_0;
};

struct Material {
  vec3 color;
  float pad_0;
  float metalness;
  float specular;
  float roughness;
  float anisotropy;
  float specularTint;
  float sheenTint;
  float sheen;
  float clearcoatGloss;
  float clearcoat;
  float subsurface;
  float pad_1;
  float pad_2;
  uint texAlbedoIndex;
  uint texNormalIndex;
  uint texMetalRoughnessIndex;
  uint texEmissiveIndex;
};

struct Instance {
  uint geometryIndex;
  uint materialIndex;
  uint lightIndex;
  uint faceCount;
  mat4x3 transformMatrix;
  mat3x3 normalMatrix;
};

struct Light {
  uint geometryInstanceIndex;
  vec3 emission;
};

struct LightSource {
  vec4 emissionAndGeometryId;
  vec4 directionAndPdf;
};

struct RayPayload {
  vec4 radianceAndDistance;
  vec4 scatterDirection;
  vec4 throughput;
  uint seed;
  LightSource lightSource;
  bool shadowed;
};

struct ShadowRayPayload {
  vec3 hit;
  bool shadowed;
};

struct ShadingData {
  vec3  base_color;
  float metallic;
  float specular;
  float anisotropy;
  float roughness;
  float specular_tint;
  float sheen_tint;
  float sheen;
  float clearcoat_gloss;
  float clearcoat;
  float subsurface;
  float csw;
};

#endif // STRUCTS_H
