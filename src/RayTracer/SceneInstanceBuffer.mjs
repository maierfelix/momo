import { ASSERT_VK_RESULT } from "../utils.mjs";

import { WARN } from "../utils.mjs";

import Buffer from "../Buffer.mjs";

/**
 * This buffer contains indices to index the geometry, material and geometry-instance buffers
 * It gets indexed using the 'instanceID' attribute in the 'GeometryInstance' layout
 * It also contains the transform matrices of an instance
 */
export default class SceneInstanceBuffer {
  constructor(opts = {}) {
    this.instances = [];
    this.logicalDevice = opts.logicalDevice;
    this.physicalDevice = opts.physicalDevice;
  }
};

SceneInstanceBuffer.prototype.create = function(geometries, materials, lights, instances_) {
  let {logicalDevice, physicalDevice} = this;
  let {instances} = this;
  for (let ii = 0; ii < instances_.length; ++ii) {
    let instance = instances_[ii];
    let {geometry, material} = instance;
    // resolve buffer indices
    let geometryIndex = geometries.indexOf(geometry);
    let materialIndex = materials.indexOf(material);
    let lightIndex = 0;
    if (instance.isEmitter) {
      lightIndex = lights.indexOf(instance.relativeLightObject);
      // in case we couldn't find the light
      if (lightIndex < 0) {
        WARN(`Cannot resolve relative Light Buffer Object (Index: '${lightIndex}')`);
      }
    }
    let instanceBuffer = this.createBuffer(instance, geometryIndex, materialIndex, lightIndex);
    instances.push(instanceBuffer);
  };
};

SceneInstanceBuffer.prototype.createBuffer = function(instance, geometryIndex, materialIndex, lightIndex) {
  let {logicalDevice, physicalDevice} = this;

  let {geometry} = instance;
  let {normalMatrix, transformMatrix} = instance;

  let instanceBuffer = new Buffer({ logicalDevice, physicalDevice });
  instanceBuffer.allocate(
    new Uint8Array(
      4 * Uint32Array.BYTES_PER_ELEMENT + // indices
      transformMatrix.byteLength +        // transform matrix
      normalMatrix.byteLength             // normal matrix
    ),
    VK_BUFFER_USAGE_TRANSFER_SRC_BIT,
    VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT
  );

  let faceCount = geometry.mesh.indices.length / 3;

  // write indices
  let offset = 0x0;
  let viewU32 = new Uint32Array(instanceBuffer.mapped);
  let viewF32 = new Float32Array(instanceBuffer.mapped);
  viewU32[offset++] = geometryIndex;
  viewU32[offset++] = materialIndex;
  viewU32[offset++] = lightIndex;
  viewU32[offset++] = faceCount;
  // write transform matrix
  for (let ii = 0; ii < transformMatrix.length; ++ii) {
    viewF32[offset++] = transformMatrix[ii];
  };
  // write normal matrix
  for (let ii = 0; ii < normalMatrix.length; ++ii) {
    viewF32[offset++] = normalMatrix[ii];
  };

  let stagedInstanceBuffer = new Buffer({ logicalDevice, physicalDevice });
  stagedInstanceBuffer.allocate(
    instanceBuffer.byteLength,
    VK_BUFFER_USAGE_TRANSFER_DST_BIT |
    VK_BUFFER_USAGE_STORAGE_BUFFER_BIT |
    VK_BUFFER_USAGE_RAY_TRACING_BIT_NV,
    VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT
  );

  instanceBuffer.copyToBuffer(stagedInstanceBuffer, 0x0, 0x0, instanceBuffer.byteLength);

  // and finally free the host visible buffers
  instanceBuffer.destroy();

  return stagedInstanceBuffer;
};
