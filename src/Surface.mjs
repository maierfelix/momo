import { ASSERT_VK_RESULT } from "./utils.mjs";

export default class Surface {
  constructor(opts) {
    this.instance = new VkSurfaceKHR();
    this.window = opts.window;
    this.instanceHandle = opts.instance;
    this.physicalDevice = opts.physicalDevice;
    this.surfaceFormat = null;
  }
  get isSRGB() {
    let {surfaceFormat} = this;
    if (!surfaceFormat) return false;
    switch (surfaceFormat.format) {
      case VK_FORMAT_R8_SRGB:
      case VK_FORMAT_R8G8_SRGB:
      case VK_FORMAT_R8G8B8_SRGB:
      case VK_FORMAT_B8G8R8_SRGB:
      case VK_FORMAT_R8G8B8A8_SRGB:
      case VK_FORMAT_B8G8R8A8_SRGB:
        return true;
    };
    return false;
  }
};

Surface.prototype.create = function(desiredFormat) {
  let {instance, window, instanceHandle, physicalDevice} = this;

  result = window.createSurface(instanceHandle, null, instance);
  ASSERT_VK_RESULT(result);

  let supported = { $: false };
  vkGetPhysicalDeviceSurfaceSupportKHR(physicalDevice.instance, 0, instance, supported);
  if (!supported.$) return false;

  // get surface capabilities
  let surfaceFormats = this.getSurfaceFormats();

  // validate surface capabilities
  let supportedFormat = surfaceFormats.filter(sf => desiredFormat === sf.format)[0] || null;
  if (supportedFormat) this.surfaceFormat = supportedFormat;

  return !!supportedFormat;
};

Surface.prototype.destroy = function() {
  
};

Surface.prototype.getSurfaceFormats = function() {
  let {instance, physicalDevice} = this;
  let surfaceFormatCount = { $: 0 };
  vkGetPhysicalDeviceSurfaceFormatsKHR(physicalDevice.instance, instance, surfaceFormatCount, null);
  let surfaceFormats = [...Array(surfaceFormatCount.$)].map(() => new VkSurfaceFormatKHR());
  vkGetPhysicalDeviceSurfaceFormatsKHR(physicalDevice.instance, instance, surfaceFormatCount, surfaceFormats);
  return surfaceFormats;
};

Surface.prototype.getCapabilities = function() {
  let {instance, physicalDevice} = this;
  let surfaceCapabilities = new VkSurfaceCapabilitiesKHR();
  result = vkGetPhysicalDeviceSurfaceCapabilitiesKHR(physicalDevice.instance, instance, surfaceCapabilities);
  ASSERT_VK_RESULT(result);

  return surfaceCapabilities;
};
