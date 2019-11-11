import { ASSERT_VK_RESULT } from "../utils.mjs";

import { clamp, getAbsoluteTextureDimension } from "../utils.mjs";

import Buffer from "../Buffer.mjs";

/**
 * Stores all scene's geometry into flatten buffers
 */
export default class SceneGeometryBuffer {
  constructor(opts = {}) {
    this.buffers = {
      attributes: [],
      faces: [],
      materials: []
    };
    this.logicalDevice = opts.logicalDevice;
    this.physicalDevice = opts.physicalDevice;
  }
};

SceneGeometryBuffer.prototype.create = function(geometries, materials, textures) {
  let {logicalDevice, physicalDevice} = this;
  let {buffers} = this;

  // for each individual geometry we create a separate geometry buffer,
  // which gets later indexed in the shader using 'gl_InstanceCustomIndexNV'
  // this way we can use instancing for attributes such as normals etc.
  for (let ii = 0; ii < geometries.length; ++ii) {
    // create host visible geometry buffer
    let {attributeBuffer, faceBuffer} = this.createGeometryBuffer(geometries[ii]);

    // stage the buffers over to the device
    let stagedAttributeBuffer = new Buffer({ logicalDevice, physicalDevice });
    stagedAttributeBuffer.allocate(
      attributeBuffer.byteLength,
      // aka: staged SSBO for RT
      VK_BUFFER_USAGE_TRANSFER_DST_BIT |
      VK_BUFFER_USAGE_STORAGE_BUFFER_BIT |
      VK_BUFFER_USAGE_RAY_TRACING_BIT_NV,
      VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT
    );

    let stagedFaceBuffer = new Buffer({ logicalDevice, physicalDevice });
    stagedFaceBuffer.allocate(
      faceBuffer.byteLength,
      // aka: SSBO for RT
      VK_BUFFER_USAGE_TRANSFER_DST_BIT |
      VK_BUFFER_USAGE_STORAGE_BUFFER_BIT |
      VK_BUFFER_USAGE_RAY_TRACING_BIT_NV,
      VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT
    );
    // we no longer have to write to them

    attributeBuffer.copyToBuffer(stagedAttributeBuffer, 0x0, 0x0, attributeBuffer.byteLength);
    faceBuffer.copyToBuffer(stagedFaceBuffer, 0x0, 0x0, faceBuffer.byteLength);

    buffers.attributes.push(stagedAttributeBuffer);
    buffers.faces.push(stagedFaceBuffer);

    // and finally free the host visible buffers
    attributeBuffer.destroy();
    faceBuffer.destroy();
  };

  // just like we process the geometry buffers
  // for each individual material we create a storage buffer
  // which gets later indexed in the shader using 'gl_InstanceCustomIndexNV'
  for (let ii = 0; ii < materials.length; ++ii) {
    // create host visible geometry buffer
    let {materialBuffer} = this.createMaterialBuffer(materials[ii], textures);

    // stage the buffers over to the device
    let stagedMaterialBuffer = new Buffer({ logicalDevice, physicalDevice });
    stagedMaterialBuffer.allocate(
      materialBuffer.byteLength,
      // aka: staged SSBO for RT
      VK_BUFFER_USAGE_TRANSFER_DST_BIT |
      VK_BUFFER_USAGE_STORAGE_BUFFER_BIT |
      VK_BUFFER_USAGE_RAY_TRACING_BIT_NV,
      VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT
    );

    materialBuffer.copyToBuffer(stagedMaterialBuffer, 0x0, 0x0, materialBuffer.byteLength);

    buffers.materials.push(stagedMaterialBuffer);

    // and finally free the host visible buffers
    materialBuffer.destroy();
  };

};

SceneGeometryBuffer.prototype.createGeometryBuffer = function(geometry) {
  let {logicalDevice, physicalDevice} = this;
  let {uvs, normals, tangents, vertices, indices} = geometry.mesh;

  // allocate
  let attributeBuffer = new Buffer({ logicalDevice, physicalDevice });
  attributeBuffer.allocate(
    new Float32Array(indices.length * 16),
    VK_BUFFER_USAGE_TRANSFER_SRC_BIT,
    VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT
  );
  let faceBuffer = new Buffer({ logicalDevice, physicalDevice });
  faceBuffer.allocate(
    new Uint32Array(indices.length / 3 * 4),
    VK_BUFFER_USAGE_TRANSFER_SRC_BIT,
    VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT
  );

  // write attributes directly into the mapped buffer
  let attributes = new Float32Array(attributeBuffer.mapped);
  for (let ii = 0; ii < indices.length; ++ii) {
    let index = indices[ii];
    let offset = ii * 16;
    attributes[offset++] = vertices[index * 3 + 0];
    attributes[offset++] = vertices[index * 3 + 1];
    attributes[offset++] = vertices[index * 3 + 2];
    attributes[offset++] = 0; // padding
    attributes[offset++] = normals[index * 3 + 0];
    attributes[offset++] = normals[index * 3 + 1];
    attributes[offset++] = normals[index * 3 + 2];
    attributes[offset++] = 0; // padding
    attributes[offset++] = tangents[index * 3 + 0];
    attributes[offset++] = tangents[index * 3 + 1];
    attributes[offset++] = tangents[index * 3 + 2];
    attributes[offset++] = 0; // padding
    attributes[offset++] = uvs[index * 2 + 0];
    attributes[offset++] = 1.0 - uvs[index * 2 + 1];
    attributes[offset++] = 0; // padding
    attributes[offset++] = 0; // padding
  };

  // write faces directly into the mapped buffer
  let faces = new Uint32Array(faceBuffer.mapped);
  for (let ii = 0; ii < indices.length / 3; ++ii) {
    let index = ii * 3;
    let offset = ii * 4;
    faces[offset++] = index + 0;
    faces[offset++] = index + 1;
    faces[offset++] = index + 2;
  };

  attributeBuffer.unmap();
  faceBuffer.unmap();

  return { attributeBuffer, faceBuffer };
};

SceneGeometryBuffer.prototype.createMaterialBuffer = function(material, textures) {
  let {logicalDevice, physicalDevice} = this;

  let texAlbedoIndex = 0;
  let texNormalIndex = 0;
  let texMetalRoughnessIndex = 0;
  let texEmissiveIndex = 0;

  let absTextureDimension = getAbsoluteTextureDimension(textures);

  if (material.hasOwnProperty("albedo")) {
    texAlbedoIndex = textures.indexOf(material.albedo);
  }
  if (material.hasOwnProperty("normal")) {
    texNormalIndex = textures.indexOf(material.normal);
  }
  if (material.hasOwnProperty("metalRoughness")) {
    texMetalRoughnessIndex = textures.indexOf(material.metalRoughness);
  }
  if (material.hasOwnProperty("emissive")) {
    texEmissiveIndex = textures.indexOf(material.emissive);
  }

  // if the user's material doesn't define a texture then we
  // just refer to texture index 0 as it represents an empty texture
  if (texAlbedoIndex <= -1) texAlbedoIndex = 0;
  if (texNormalIndex <= -1) texNormalIndex = 0;
  if (texMetalRoughnessIndex <= -1) texMetalRoughnessIndex = 0;
  if (texEmissiveIndex <= -1) texEmissiveIndex = 0;

  // allocate
  let materialBuffer = new Buffer({ logicalDevice, physicalDevice });
  materialBuffer.allocate(
    new Uint8Array(
      // one material takes:
      // 4 floats and 4 uints
      (16 * Float32Array.BYTES_PER_ELEMENT) +
      (4 * Uint32Array.BYTES_PER_ELEMENT)
    ),
    VK_BUFFER_USAGE_TRANSFER_SRC_BIT,
    VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT
  );

  // write material
  let offset = 0x0;
  let uint32View = new Uint32Array(materialBuffer.mapped);
  let float32View = new Float32Array(materialBuffer.mapped);
  // 16 floats
  {
    let color = null;
    if (material.hasOwnProperty("color")) {
      if (material.color.length === 1) {
        color = [
          material.color[0],
          material.color[0],
          material.color[0]
        ];
      } else {
        color = material.color;
      }
    } else {
      color = [0, 0, 0];
    }
    let metalness = material.hasOwnProperty("metalness") ? material.metalness : 0;
    let specular = material.hasOwnProperty("specular") ? material.specular : 0;
    let roughness = material.hasOwnProperty("roughness") ? material.roughness : 0;
    let anisotropy = material.hasOwnProperty("anisotropy") ? material.anisotropy : 0;
    let specularTint = material.hasOwnProperty("specularTint") ? material.specularTint : 0;
    let sheenTint = material.hasOwnProperty("sheenTint") ? material.sheenTint : 0;
    let sheen = material.hasOwnProperty("sheen") ? material.sheen : 0;
    let clearcoatGloss = material.hasOwnProperty("clearcoatGloss") ? material.clearcoatGloss : 0;
    let clearcoat = material.hasOwnProperty("clearcoat") ? material.clearcoat : 0;
    let subsurface = material.hasOwnProperty("subsurface") ? material.subsurface : 0;
    float32View[offset++] = color[0] / 255.0;
    float32View[offset++] = color[1] / 255.0;
    float32View[offset++] = color[2] / 255.0;
    float32View[offset++] = 0; // padding
    float32View[offset++] = clamp(metalness, 0.001, 0.999);
    float32View[offset++] = clamp(specular, 0.001, 0.999);
    float32View[offset++] = clamp(roughness, 0.001, 0.999);
    float32View[offset++] = clamp(anisotropy, 0.001, 0.999);
    float32View[offset++] = clamp(specularTint, 0.001, 0.999);
    float32View[offset++] = clamp(sheenTint, 0.001, 0.999);
    float32View[offset++] = clamp(sheen, 0.001, 0.999);
    float32View[offset++] = clamp(clearcoatGloss, 0.001, 0.999);
    float32View[offset++] = clamp(clearcoat, 0.001, 0.999);
    float32View[offset++] = clamp(subsurface, 0.001, 0.999);
    float32View[offset++] = 0; // padding
    float32View[offset++] = 0; // padding
  }
  // 4 uints
  // the material's texture indices
  {
    uint32View[offset++] = texAlbedoIndex;
    uint32View[offset++] = texNormalIndex;
    uint32View[offset++] = texMetalRoughnessIndex;
    uint32View[offset++] = texEmissiveIndex;
  }

  materialBuffer.unmap();

  return { materialBuffer };
};
