import nvk from "nvk";
import tolw from "tolw";
import glMatrix from "gl-matrix";

import { performance } from "perf_hooks";

import { WARN, LOG } from "./utils.mjs";
import { dirname } from "./utils.mjs";
import { isPNGFile, isJPEGFile, isHDRFile } from "./utils.mjs";

import { readPNGFile, readJPEGFile, readHDRFile } from "./utils.mjs";
import { readBinaryFile, readObjectFile } from "./utils.mjs";

import RayTracer from "./RayTracer/index.mjs";
import VulkanApplication from "./VulkanApplication.mjs";

Object.assign(global, nvk);
Object.assign(global, glMatrix);

// input flags
global.VERBOSE = !!(
  process.env.npm_config_verbose_log ||
  process.argv.filter(v => v.match("--verbose-log"))[0]
);

// prefer to use diescrete gpu over integrated gpu
global.PREFER_DISCRETE_GPU = !!(
  process.env.npm_config_prefer_discrete_gpu ||
  process.argv.filter(v => v.match("--prefer-discrete-gpu"))[0]
);

let desiredSurfaceFormat = VK_FORMAT_B8G8R8A8_SRGB;

let requiredExtensions = [
  VK_KHR_SWAPCHAIN_EXTENSION_NAME,
  VK_NV_RAY_TRACING_EXTENSION_NAME,
  VK_KHR_GET_MEMORY_REQUIREMENTS_2_EXTENSION_NAME,
  VK_EXT_DESCRIPTOR_INDEXING_EXTENSION_NAME,
  VK_KHR_MAINTENANCE3_EXTENSION_NAME
];

let validationLayers = [
  "VK_LAYER_LUNARG_core_validation",
  "VK_LAYER_LUNARG_standard_validation"
];

class RayTracingDemo extends VulkanApplication {
  constructor() {
    super({ validationLayers, requiredExtensions, desiredSurfaceFormat });
    this.deviceName = "";
    this.rayTracer = null;
  }
};

RayTracingDemo.prototype.create = async function() {
  LOG("Initializing TinyObjLoader (WebAssembly)");
  await tolw.init();
  LOG("Creating window");
  this.window = this.createWindow();
  LOG("Creating Instance");
  this.instance = this.createInstance();
  LOG("Creating Physical Device");
  this.physicalDevice = this.createPhysicalDevice();
  {
    let deviceProperties = this.physicalDevice.getDeviceProperties();
    let {type, properties} = deviceProperties;
    this.deviceName = `${properties.deviceName} (${type})`;
    LOG(`Using Device: ${this.deviceName}`);
  }
  LOG("Creating Logical Device");
  this.logicalDevice = this.createLogicalDevice();
  LOG("Creating Surface");
  this.surface = this.createSurface();
  LOG("Creating Swapchain");
  this.swapchain = this.createSwapchain();
  LOG("Instantiating RayTracer");
  this.rayTracer = this.createRayTracer();
};

RayTracingDemo.prototype.execute = function() {
  let drag = false;
  let {window, rayTracer} = this;
  LOG("Executing RayTracer");
  rayTracer.create();
  let {camera} = rayTracer;
  // add window event listeners
  {
    let isShiftPressed = false;
    window.onkeydown = e => {
      if (e.keyCode === 340) isShiftPressed = true;
    };
    window.onkeyup = e => {
      if (e.keyCode === 340) isShiftPressed = false;
    };
    window.onmousedown = e => (drag = true);
    window.onmouseup = e => (drag = false);
    window.onmousemove = e => {
      if (!drag) return;
      camera.rotation.vx += -e.movementX * 0.325;
      camera.rotation.vy += -e.movementY * 0.325;
      camera.resetSampleCount();
    };
    window.onmousewheel = e => {
      let {deltaY} = e;
      if (isShiftPressed) deltaY = deltaY * 0.25;
      camera.distance.vz += deltaY;
      camera.resetSampleCount();
    };
  }
  // draw loop
  let app = this;
  let then = 0;
  let frames = 0;
  (function drawLoop() {
    if (!window.shouldClose()) setTimeout(drawLoop, 0);
    let now = performance.now();
    let delta = (now - then);
    if (delta > 1.0 || frames === 0) {
      let fps = Math.floor((frames / delta) * 1e3);
      window.title = `Vulkan RTX - ${app.deviceName} - FPS: ${fps} - Samples: ${camera.totalSampleCount} (${camera.sampleCount} SPP)`;
      frames = 0;
    }
    frames++;
    app.drawFrame();
    camera.update();
    then = now;
    window.pollEvents();
  })();
};

RayTracingDemo.prototype.loadGeometryFile = function(path) {
  let ext = path.substr(path.lastIndexOf("."));
  if (ext !== ".obj") WARN(`This Demo only supports Wavefront OBJ (.obj) as object files`);
  let out = this.addGeometryMesh(readObjectFile(path));
  return out;
};

RayTracingDemo.prototype.loadTextureFile = function(path) {
  let ext = path.substr(path.lastIndexOf("."));
  let out = null;
  let buffer = readBinaryFile(path);
  if (isPNGFile(buffer)) {
    LOG(`Reading PNG File from '${path}'`);
    out = this.rayTracer.addTexture(readPNGFile(buffer));
  }
  else if (isJPEGFile(buffer)) {
    LOG(`Reading JPEG File from '${path}'`);
    out = this.rayTracer.addTexture(readJPEGFile(buffer));
  }
  else if (isHDRFile(buffer)) {
    LOG(`Reading HDR File from '${path}'`);
    out = this.rayTracer.addEnvironmentMap(readHDRFile(buffer));
  }
  else {
    WARN(`This Demo only supports PNG, JPEG and HDR Textures`);
  }
  return out;
};

RayTracingDemo.prototype.createTextureFromColor = function(opts) {
  if (typeof opts !== "object") {
    throw new TypeError(`Argument 1 must be of type 'Object'`);
  }
  let {color, width, height} = opts;
  if (!color.hasOwnProperty("length")) {
    throw new TypeError(`Color must be of type 'Array'`);
  }
  if (color.length > 4) {
    throw new RangeError(`Invalid color array length: Length must be '1', '3' or '4'`);
  }
  let r = 0;
  let g = 0;
  let b = 0;
  let a = 0;
  if (color.length === 1) {
    r = g = b = a = color[0];
  }
  else if (color.length === 3) {
    r = color[0];
    g = color[1];
    b = color[2];
  }
  a = color.length === 4 ? color[3] : 255;
  let data = new Uint8ClampedArray(width * height * 4);
  for (let ii = 0; ii < width * height; ++ii) {
    data[ii * 4 + 0] = r;
    data[ii * 4 + 1] = g;
    data[ii * 4 + 2] = b;
    data[ii * 4 + 3] = a;
  };
  return this.rayTracer.addTexture({
    width: width,
    height: height,
    data: data
  });
};

RayTracingDemo.prototype.addGeometryMesh = function(geometry) {
  return this.rayTracer.addGeometry(geometry);
};

RayTracingDemo.prototype.addMaterial = function(material) {
  return this.rayTracer.addMaterial(material);
};

RayTracingDemo.prototype.addLight = function(light) {
  return this.rayTracer.addLight(light);
};

RayTracingDemo.prototype.useSkyboxTexture = function(texture) {
  this.skyboxTexture = texture;
};

RayTracingDemo.prototype.drawFrame = function() {
  this.drawDefaultFrame();
};

RayTracingDemo.prototype.createRayTracer = function() {
  let {swapchain, surface, window, logicalDevice, physicalDevice} = this;
  let application = this;
  let rayTracer = new RayTracer({
    application,
    swapchain,
    surface,
    window,
    logicalDevice,
    physicalDevice
  });
  return rayTracer;
};

export default RayTracingDemo;
