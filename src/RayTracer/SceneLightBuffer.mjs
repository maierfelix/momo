import { ASSERT_VK_RESULT } from "../utils.mjs";

import { WARN } from "../utils.mjs";

import Buffer from "../Buffer.mjs";

/**
 * This buffer contains the data for dynamic lights in a scene
 */
export default class SceneLightBuffer {
  constructor(opts = {}) {
    this.lights = [];
    this.logicalDevice = opts.logicalDevice;
    this.physicalDevice = opts.physicalDevice;
  }
};

SceneLightBuffer.prototype.create = function(lights, instances) {
  let {logicalDevice, physicalDevice} = this;
  for (let ii = 0; ii < lights.length; ++ii) {
    let light = lights[ii];
    let geometryInstance = light.relativeGeometryInstance;
    let geometryInstanceIndex = instances.indexOf(geometryInstance);
    // in case we couldn't find the geometry
    if (geometryInstanceIndex < 0) {
      WARN(`Cannot resolve relative Geometry Instance Buffer (Index: '${geometryInstanceIndex}')`);
    }
    let buffer = this.createLightBuffer(light, geometryInstanceIndex);
    this.lights.push(buffer);
  };
};

SceneLightBuffer.prototype.createLightBuffer = function(light, geometryInstanceIndex) {
  let {logicalDevice, physicalDevice} = this;

  let lightBuffer = new Buffer({ logicalDevice, physicalDevice });
  lightBuffer.allocate(
    new Uint8Array(
      1 * Uint32Array.BYTES_PER_ELEMENT + // geometryInstanceIndex
      3 * Float32Array.BYTES_PER_ELEMENT  // emission
    ),
    VK_BUFFER_USAGE_TRANSFER_SRC_BIT,
    VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT
  );

  // write light data
  let offset = 0x0;
  let uint32View = new Uint32Array(lightBuffer.mapped);
  let float32View = new Float32Array(lightBuffer.mapped);
  // light type
  uint32View[offset++] = geometryInstanceIndex;
  // padding
  float32View[offset++] = 0;
  float32View[offset++] = 0;
  float32View[offset++] = 0;

  let stagedLightBuffer = new Buffer({ logicalDevice, physicalDevice });
  stagedLightBuffer.allocate(
    lightBuffer.byteLength,
    VK_BUFFER_USAGE_TRANSFER_DST_BIT |
    VK_BUFFER_USAGE_STORAGE_BUFFER_BIT |
    VK_BUFFER_USAGE_RAY_TRACING_BIT_NV,
    VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT
  );

  lightBuffer.copyToBuffer(stagedLightBuffer, 0x0, 0x0, lightBuffer.byteLength);

  // and finally free the host visible buffer
  lightBuffer.destroy();

  return stagedLightBuffer;
};
