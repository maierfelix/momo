import { WARN, ASSERT_VK_RESULT } from "../utils.mjs";

import TextureArrayBuffer from "../TextureArrayBuffer.mjs";

/**
 * Creates the scene's textures
 */
export default class SceneEnvironmentBuffer {
  constructor(opts = {}) {
    this.buffer = null;
    this.logicalDevice = opts.logicalDevice;
    this.physicalDevice = opts.physicalDevice;
  }
};

SceneEnvironmentBuffer.prototype.create = function(textures) {
  let {logicalDevice, physicalDevice} = this;

  let stride = 4 * Float32Array.BYTES_PER_ELEMENT; // 32-bit rgba
  let format = (
    VK_FORMAT_R32G32B32A32_SFLOAT
  );

  // create textures buffer
  let textureBuffer = new TextureArrayBuffer({ logicalDevice, physicalDevice });
  textureBuffer.create(textures, format, stride);

  this.buffer = textureBuffer;
};
