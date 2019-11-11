import { WARN, ASSERT_VK_RESULT } from "../utils.mjs";

import TextureArrayBuffer from "../TextureArrayBuffer.mjs";

/**
 * Creates the scene's textures
 */
export default class SceneTextureBuffer {
  constructor(opts = {}) {
    this.buffer = null;
    this.logicalDevice = opts.logicalDevice;
    this.physicalDevice = opts.physicalDevice;
    this.surface = opts.surface;
  }
};

SceneTextureBuffer.prototype.create = function(textures) {
  let {logicalDevice, physicalDevice, surface} = this;

  let stride = 4 * Uint8Array.BYTES_PER_ELEMENT; // 8-bit rgba
  let format = (
    surface.isSRGB ?
    VK_FORMAT_R8G8B8A8_SRGB :
    VK_FORMAT_R8G8B8A8_UNORM
  );

  // create textures buffer
  let textureBuffer = new TextureArrayBuffer({ logicalDevice, physicalDevice });
  textureBuffer.create(textures, format, stride);

  this.buffer = textureBuffer;
};
