#version 460
#extension GL_NV_ray_tracing : require
#extension GL_GOOGLE_include_directive : enable

#include "utils.glsl"

layout(location = 1) rayPayloadInNV ShadowRayPayload ShadowRay;

void main() {
  ShadowRay.hit = gl_WorldRayOriginNV + gl_RayTmaxNV * gl_WorldRayDirectionNV;
  ShadowRay.shadowed = true;
}
