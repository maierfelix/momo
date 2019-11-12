import { LOG, WARN, ASSERT_VK_RESULT } from "../utils.mjs";

import { dirname } from "../utils.mjs";

import {
  validateTextureSettings,
  validateGeometrySettings
} from "../validate.mjs";

import Camera from "./Camera.mjs";
import Pipeline from "./Pipeline.mjs";

import Buffer from "../Buffer.mjs";
import ShaderModule from "../ShaderModule.mjs";
import CommandBuffer from "../CommandBuffer.mjs";

import ScratchBuffer from "./ScratchBuffer.mjs";
import ShaderBindingTable from "./ShaderBindingTable.mjs";

import OffscreenBuffer from "./OffscreenBuffer.mjs";
import AccumulationBuffer from "./AccumulationBuffer.mjs";
import SceneTextureBuffer from "./SceneTextureBuffer.mjs";
import SceneEnvironmentBuffer from "./SceneEnvironmentBuffer.mjs";
import SceneGeometryBuffer from "./SceneGeometryBuffer.mjs";
import SceneGeometryInstanceBuffer from "./SceneGeometryInstanceBuffer.mjs";
import SceneLightBuffer from "./SceneLightBuffer.mjs";
import SceneInstanceBuffer from "./SceneInstanceBuffer.mjs";

import AccelerationGeometry from "./AccelerationGeometry.mjs";
import AccelerationStructure from "./AccelerationStructure.mjs";

export default class RayTracer {
  constructor(opts = {}) {
    this.application = opts.application;
    this.logicalDevice = opts.logicalDevice;
    this.physicalDevice = opts.physicalDevice;
    this.window = opts.window;
    this.surface = opts.surface;
    this.swapchain = opts.swapchain;
    this.shaders = [];
    this.environments = [];
    this.camera = null;
    this.offscreenBuffer = null;
    this.accumulationBuffer = null;
    this.shaderBindingTable = null;
    this.sceneTextureBuffer = null;
    this.sceneEnvironmentBuffer = null;
    this.sceneGeometryBuffer = null;
    this.sceneInstanceBuffer = null;
    this.sceneLightBuffer = null;
    this.pipeline = null;
    this.geometries = [];
    this.materials = [];
    this.textures = [];
    this.lights = [];
    this.accelerationStructures = {
      top: [],
      bottom: []
    };
  }

  get instances() {
    let {geometries} = this;
    let instances = [];
    for (let ii = 0; ii < geometries.length; ++ii) {
      let geometry = geometries[ii];
      for (let jj = 0; jj < geometry.instances.length; ++jj) {
        instances.push(geometry.instances[jj]);
      };
    };
    return instances;
  }

};

RayTracer.prototype.create = function() {
  LOG("Creating Scene Texture Buffer");
  this.sceneTextureBuffer = this.createSceneTextureBuffer();
  LOG("Creating Scene Environment Buffer");
  this.sceneEnvironmentBuffer = this.createSceneEnvironmentBuffer();
  LOG("Creating Scene Geometry Buffer");
  this.sceneGeometryBuffer = this.createSceneGeometryBuffer();
  LOG("Creating Scene Light Buffer");
  this.sceneLightBuffer = this.createSceneLightBuffer();
  LOG("Creating Scene Instance Buffer");
  this.sceneInstanceBuffer = this.createSceneInstanceBuffer();
  LOG("Creating Bottom-Level Acceleration Structures");
  this.createBottomLevelAccelerationStructures();
  LOG("Creating Top-Level Acceleration Structures");
  this.createTopLevelAccelerationStructure();
  LOG("Creating Camera");
  this.camera = this.createCamera();
  LOG("Creating Shaders");
  this.shaders = this.createShaders();
  LOG("Creating Shader Binding Table");
  this.shaderBindingTable = this.createShaderBindingTable();
  LOG("Creating Offscreen Buffer");
  this.offscreenBuffer = this.createOffscreenBuffer();
  LOG("Creating Accumulation Buffer");
  this.accumulationBuffer = this.createAccumulationBuffer();
  LOG("Building Acceleration Structures");
  this.buildAccelerationStructures();
  LOG("Creating Pipeline");
  this.pipeline = this.createPipeline();
  LOG("Linking Shader Binding Table with Pipeline");
  this.shaderBindingTable.create(this.pipeline.instance);
  LOG("Creating Pipeline Descriptorsets");
  this.pipeline.createDescriptorSets(this.accelerationStructures.top);
  LOG("Recording Draw Commands");
  this.recordDrawCommands();
  LOG("Done");
};

RayTracer.prototype.destroy = function() {

};

RayTracer.prototype.addGeometry = function(mesh) {
  let {logicalDevice, physicalDevice} = this;
  let parent = this;
  let geometry = new AccelerationGeometry({ parent, logicalDevice, physicalDevice });
  validateGeometrySettings(mesh);
  geometry.create(mesh);
  this.geometries.push(geometry);
  return geometry;
};

RayTracer.prototype.addMaterial = function(material) {
  let out = {};
  Object.assign(out, material);
  this.materials.push(out);
  return out;
};

RayTracer.prototype.addTexture = function(texture) {
  validateTextureSettings(texture);
  // create a copy with an additional member,
  // which holds the texture's buffer index,
  // which we will calculate later (in SceneTextureBuffer)
  let out = {
    index: 0,
    byteOffset: 0x0
  };
  Object.assign(out, texture);
  this.textures.push(out);
  return out;
};

RayTracer.prototype.addEnvironmentMap = function(map) {
  validateTextureSettings(map);
  let {data} = map;
  // create a copy with an additional member,
  // which holds the texture's buffer index,
  // which we will calculate later (in SceneEnvironmentBuffer)
  let out = {
    index: 0,
    byteOffset: 0x0
  };
  Object.assign(out, map);
  // we might replaced data (e.g. in RGB->RGBA conversion)
  // so make sure we set the eventually changed data
  out.data = new Uint8Array(data.buffer);
  this.environments.push(out);
  return out;
};

RayTracer.prototype.addLight = function(light) {
  let out = {
    // the relative geometry instance of the light
    relativeGeometryInstance: null
  };
  Object.assign(out, light);
  this.lights.push(out);
  return out;
};

RayTracer.prototype.createCamera = function() {
  let {window, logicalDevice, physicalDevice} = this;
  let parent = this;
  let camera = new Camera({ parent, window, logicalDevice, physicalDevice });
  camera.create();
  return camera;
};

RayTracer.prototype.createShaders = function() {
  let {logicalDevice} = this;
  let includesPath = dirname + "/shaders/";
  // !order dependant! -> usage =^ stage flags
  let shaders = [
    new ShaderModule({
      usage: VK_SHADER_STAGE_RAYGEN_BIT_NV,
      logicalDevice
    }).fromFilePath(dirname + "/shaders/ray-gen.rgen", includesPath),
    new ShaderModule({
      usage: VK_SHADER_STAGE_CLOSEST_HIT_BIT_NV,
      logicalDevice
    }).fromFilePath(dirname + "/shaders/ray-closest-hit.rchit", includesPath),
    new ShaderModule({
      usage: VK_SHADER_STAGE_CLOSEST_HIT_BIT_NV,
      logicalDevice
    }).fromFilePath(dirname + "/shaders/shadow-ray-hit.rchit", includesPath),
    new ShaderModule({
      usage: VK_SHADER_STAGE_MISS_BIT_NV,
      logicalDevice
    }).fromFilePath(dirname + "/shaders/ray-miss.rmiss", includesPath),
    new ShaderModule({
      usage: VK_SHADER_STAGE_MISS_BIT_NV,
      logicalDevice
    }).fromFilePath(dirname + "/shaders/shadow-ray-miss.rmiss", includesPath)
  ];
  return shaders;
};

RayTracer.prototype.createShaderBindingTable = function() {
  let {logicalDevice, physicalDevice} = this;
  let {shaderGroupHandleSize} = physicalDevice.getDeviceProperties().rayTracing;
  let {shaders} = this;
  let sbt = new ShaderBindingTable({ logicalDevice, physicalDevice, shaders, shaderGroupHandleSize });
  return sbt;
};

RayTracer.prototype.createOffscreenBuffer = function() {
  let {window, surface, logicalDevice, physicalDevice} = this;
  let offscreenBuffer = new OffscreenBuffer({ logicalDevice, physicalDevice });
  offscreenBuffer.create(window.width, window.height, 1, VK_FORMAT_B8G8R8A8_UNORM);
  return offscreenBuffer;
};

RayTracer.prototype.createAccumulationBuffer = function() {
  let {window, logicalDevice, physicalDevice} = this;
  let accumulationBuffer = new AccumulationBuffer({ logicalDevice, physicalDevice });
  accumulationBuffer.create(window.width, window.height);
  return accumulationBuffer;
};

RayTracer.prototype.createPipeline = function() {
  let {logicalDevice} = this;
  let {camera, shaderBindingTable} = this;
  let {
    offscreenBuffer,
    accumulationBuffer
  } = this;
  let {
    sceneGeometryBuffer,
    sceneTextureBuffer,
    sceneEnvironmentBuffer,
    sceneLightBuffer,
    sceneInstanceBuffer
  } = this;
  let pipeline = new Pipeline({
    logicalDevice,
    shaderBindingTable,
    offscreenBuffer,
    accumulationBuffer,
    sceneGeometryBuffer,
    sceneTextureBuffer,
    sceneEnvironmentBuffer,
    sceneLightBuffer,
    sceneInstanceBuffer
  });
  pipeline.create();
  pipeline.addUniformBuffer(camera);
  return pipeline;
};

RayTracer.prototype.createSceneTextureBuffer = function() {
  let {logicalDevice, physicalDevice, surface} = this;
  let {textures} = this;
  let sceneTextureBuffer = new SceneTextureBuffer({ logicalDevice, physicalDevice, surface });
  sceneTextureBuffer.create(textures);
  return sceneTextureBuffer;
};

RayTracer.prototype.createSceneEnvironmentBuffer = function() {
  let {logicalDevice, physicalDevice} = this;
  let {environments} = this;
  let sceneEnvironmentBuffer = new SceneEnvironmentBuffer({ logicalDevice, physicalDevice });
  sceneEnvironmentBuffer.create(environments);
  return sceneEnvironmentBuffer;
};

RayTracer.prototype.createSceneGeometryBuffer = function() {
  let {logicalDevice, physicalDevice} = this;
  let {geometries, materials, textures} = this;
  let sceneGeometryBuffer = new SceneGeometryBuffer({ logicalDevice, physicalDevice });
  sceneGeometryBuffer.create(geometries, materials, textures);
  return sceneGeometryBuffer;
};

RayTracer.prototype.createSceneLightBuffer = function() {
  let {logicalDevice, physicalDevice} = this;
  let {lights, instances} = this;
  let sceneLightBuffer = new SceneLightBuffer({ logicalDevice, physicalDevice });
  sceneLightBuffer.create(lights, instances);
  return sceneLightBuffer;
};

RayTracer.prototype.createSceneInstanceBuffer = function() {
  let {logicalDevice, physicalDevice} = this;
  let {geometries, materials, lights, instances} = this;
  let sceneInstanceBuffer = new SceneInstanceBuffer({ logicalDevice, physicalDevice });
  sceneInstanceBuffer.create(geometries, materials, lights, instances);
  return sceneInstanceBuffer;
};

RayTracer.prototype.createSceneGeometryInstanceBuffer = function(instances) {
  let {logicalDevice, physicalDevice} = this;
  let {geometries, materials} = this;
  let sceneGeometryInstanceBuffer = new SceneGeometryInstanceBuffer({ logicalDevice, physicalDevice });
  sceneGeometryInstanceBuffer.create(geometries, materials, instances);
  return sceneGeometryInstanceBuffer;
};

RayTracer.prototype.recordDrawCommands = function() {
  let {window, swapchain, logicalDevice} = this;
  let {drawCommandBuffers} = swapchain;
  let {offscreenBuffer, accumulationBuffer} = this;

  let swapchainImages = swapchain.images;

  let copyRegion = new VkImageCopy();
  copyRegion.srcSubresource.aspectMask = VK_IMAGE_ASPECT_COLOR_BIT;
  copyRegion.srcSubresource.mipLevel = 0;
  copyRegion.srcSubresource.baseArrayLayer = 0;
  copyRegion.srcSubresource.layerCount = 1;
  copyRegion.dstSubresource.aspectMask = VK_IMAGE_ASPECT_COLOR_BIT;
  copyRegion.dstSubresource.mipLevel = 0;
  copyRegion.dstSubresource.baseArrayLayer = 0;
  copyRegion.dstSubresource.layerCount = 1;
  copyRegion.extent.depth = 1;
  copyRegion.extent.width = window.width;
  copyRegion.extent.height = window.height;

  let subresourceRange = new VkImageSubresourceRange();
  subresourceRange.aspectMask = VK_IMAGE_ASPECT_COLOR_BIT;
  subresourceRange.baseMipLevel = 0;
  subresourceRange.levelCount = 1;
  subresourceRange.baseArrayLayer = 0;
  subresourceRange.layerCount = 1;

  let commandBufferBeginInfo = new VkCommandBufferBeginInfo();

  for (let ii = 0; ii < drawCommandBuffers.length; ++ii) {
    let commandBuffer = drawCommandBuffers[ii];
    commandBuffer.begin();
    commandBuffer.setImageBarrier(
      accumulationBuffer.image,
      subresourceRange,
      0, VK_ACCESS_SHADER_WRITE_BIT,
      VK_IMAGE_LAYOUT_UNDEFINED, VK_IMAGE_LAYOUT_GENERAL
    );
    commandBuffer.setImageBarrier(
      offscreenBuffer.image,
      subresourceRange,
      0, VK_ACCESS_SHADER_WRITE_BIT,
      VK_IMAGE_LAYOUT_UNDEFINED, VK_IMAGE_LAYOUT_GENERAL
    );
    this.onFrame(
      commandBuffer,
      window.width, window.height
    );
    commandBuffer.setImageBarrier(
      swapchainImages[ii],
      subresourceRange,
      0, VK_ACCESS_TRANSFER_WRITE_BIT,
      VK_IMAGE_LAYOUT_UNDEFINED, VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL
    );
    commandBuffer.setImageBarrier(
      offscreenBuffer.image,
      subresourceRange,
      VK_ACCESS_SHADER_WRITE_BIT, VK_ACCESS_TRANSFER_READ_BIT,
      VK_IMAGE_LAYOUT_GENERAL, VK_IMAGE_LAYOUT_TRANSFER_SRC_OPTIMAL
    );
    vkCmdCopyImage(
      commandBuffer.instance,
      offscreenBuffer.image,
      VK_IMAGE_LAYOUT_TRANSFER_SRC_OPTIMAL,
      swapchainImages[ii],
      VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL,
      1, [copyRegion]
    );
    commandBuffer.setImageBarrier(
      swapchainImages[ii],
      subresourceRange,
      VK_ACCESS_TRANSFER_WRITE_BIT, 0,
      VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL, VK_IMAGE_LAYOUT_PRESENT_SRC_KHR
    );
    commandBuffer.end();
  };
};

RayTracer.prototype.createBottomLevelAccelerationStructures = function() {
  let {logicalDevice, physicalDevice} = this;
  let {geometries, accelerationStructures} = this;

  let memoryOffset = 0x0;
  let scratchBufferOffset = 0x0;
  for (let ii = 0; ii < geometries.length; ++ii) {
    let geometry = geometries[ii];
    let bottomLevelAS = new AccelerationStructure({ logicalDevice, physicalDevice });
    // one bottom-level AS for each geometry
    bottomLevelAS.create({ type: VK_ACCELERATION_STRUCTURE_TYPE_BOTTOM_LEVEL_NV, geometries: [geometry] });
    // write memory offsets
    {
      bottomLevelAS.memoryOffset = memoryOffset;
      bottomLevelAS.scratchBufferOffset = scratchBufferOffset;
    }
    // link with relative geometry
    {
      geometry.accelerationStructure = bottomLevelAS;
    }
    // propagate memory offsets
    {
      memoryOffset += bottomLevelAS.memoryRequirements.resultSize;
      scratchBufferOffset += bottomLevelAS.memoryRequirements.buildSize;
    }
    accelerationStructures.bottom.push(bottomLevelAS);
  };

  // reserve memory for driver
  // then bind all created bottom AS (of this geometry) to the reserved memory
  let scratchBuffer = new ScratchBuffer({ logicalDevice, physicalDevice });
  scratchBuffer.create(accelerationStructures.bottom);
};

RayTracer.prototype.createTopLevelAccelerationStructure = function() {
  let {logicalDevice, physicalDevice} = this;
  let {accelerationStructures} = this;

  // flat array of all active geometry instances
  let {instances} = this;

  let memoryOffset = 0x0;
  let scratchBufferOffset = 0x0;
  let topLevelAS = new AccelerationStructure({ logicalDevice, physicalDevice });
  topLevelAS.create({ type: VK_ACCELERATION_STRUCTURE_TYPE_TOP_LEVEL_NV, instanceCount: instances.length });
  // write memory offsets
  {
    topLevelAS.memoryOffset = memoryOffset;
    topLevelAS.scratchBufferOffset = scratchBufferOffset;
  }
  // create instance buffer which holds instanced geometry references
  {
    topLevelAS.instanceBuffer = this.createSceneGeometryInstanceBuffer(instances);
  }
  accelerationStructures.top.push(topLevelAS);

  // reserve memory for driver
  let scratchBuffer = new ScratchBuffer({ logicalDevice, physicalDevice });
  scratchBuffer.create([topLevelAS]);
};

RayTracer.prototype.buildAccelerationStructures = function() {
  let {logicalDevice, physicalDevice} = this;
  let {accelerationStructures} = this;

  let commandBuffer = new CommandBuffer({ logicalDevice });
  commandBuffer.create(VK_COMMAND_BUFFER_LEVEL_PRIMARY);
  commandBuffer.begin();

  let memoryBarrier = new VkMemoryBarrier();
  memoryBarrier.srcAccessMask = VK_ACCESS_ACCELERATION_STRUCTURE_WRITE_BIT_NV | VK_ACCESS_ACCELERATION_STRUCTURE_READ_BIT_NV;
  memoryBarrier.dstAccessMask = VK_ACCESS_ACCELERATION_STRUCTURE_WRITE_BIT_NV | VK_ACCESS_ACCELERATION_STRUCTURE_READ_BIT_NV;

  let {top, bottom} = accelerationStructures;

  // build bottom-level AS
  for (let ii = 0; ii < bottom.length; ++ii) {
    let accelerationStructure = bottom[ii];
    let {geometries, instanceCount} = accelerationStructure;
    let {scratchBuffer, scratchBufferOffset} = accelerationStructure;
    let asInfo = new VkAccelerationStructureInfoNV();
    asInfo.type = VK_ACCELERATION_STRUCTURE_TYPE_BOTTOM_LEVEL_NV;
    asInfo.flags = VK_BUILD_ACCELERATION_STRUCTURE_PREFER_FAST_TRACE_BIT_NV;
    asInfo.instanceCount = instanceCount;
    asInfo.geometryCount = geometries.length;
    asInfo.pGeometries = geometries.map(g => g.geometry);
    vkCmdBuildAccelerationStructureNV(commandBuffer.instance, asInfo, null, 0, false, accelerationStructure.instance, null, scratchBuffer.instance, scratchBufferOffset);
  };
  vkCmdPipelineBarrier(commandBuffer.instance, VK_PIPELINE_STAGE_ACCELERATION_STRUCTURE_BUILD_BIT_NV, VK_PIPELINE_STAGE_ACCELERATION_STRUCTURE_BUILD_BIT_NV, 0, 1, [memoryBarrier], 0, null, 0, null);

  // build top-level AS
  for (let ii = 0; ii < top.length; ++ii) {
    let accelerationStructure = top[ii];
    let {instanceCount} = accelerationStructure;
    let {scratchBuffer, scratchBufferOffset} = accelerationStructure;
    let asInfo = new VkAccelerationStructureInfoNV();
    asInfo.type = VK_ACCELERATION_STRUCTURE_TYPE_TOP_LEVEL_NV;
    asInfo.flags = VK_BUILD_ACCELERATION_STRUCTURE_PREFER_FAST_TRACE_BIT_NV;
    asInfo.instanceCount = instanceCount;
    asInfo.geometryCount = 0;
    asInfo.pGeometries = null;
    vkCmdBuildAccelerationStructureNV(commandBuffer.instance, asInfo, accelerationStructure.instanceBuffer.buffer.instance, 0, false, accelerationStructure.instance, null, scratchBuffer.instance, scratchBufferOffset);
  };
  vkCmdPipelineBarrier(commandBuffer.instance, VK_PIPELINE_STAGE_ACCELERATION_STRUCTURE_BUILD_BIT_NV, VK_PIPELINE_STAGE_ACCELERATION_STRUCTURE_BUILD_BIT_NV, 0, 1, [memoryBarrier], 0, null, 0, null);

  vkEndCommandBuffer(commandBuffer.instance);

  let submitInfo = new VkSubmitInfo();
  submitInfo.commandBufferCount = 1;
  submitInfo.pCommandBuffers = [commandBuffer.instance];

  let graphicsQueue = logicalDevice.getGraphicsQueue();
  vkQueueSubmit(graphicsQueue, 1, [submitInfo], null);
  vkQueueWaitIdle(graphicsQueue);

  commandBuffer.destroy();
};

RayTracer.prototype.onFrame = function(commandBuffer, width, height) {
  let {pipeline, shaderBindingTable} = this;
  let {shaderGroupHandleSize} = shaderBindingTable;
  vkCmdBindPipeline(commandBuffer.instance, VK_PIPELINE_BIND_POINT_RAY_TRACING_NV, pipeline.instance);
  vkCmdBindDescriptorSets(commandBuffer.instance, VK_PIPELINE_BIND_POINT_RAY_TRACING_NV, pipeline.layout, 0, 1, [pipeline.descriptorSet], 0, null);
  vkCmdTraceRaysNV(
    commandBuffer.instance,
    // ray-gen
    shaderBindingTable.instance,
    shaderBindingTable.getOffset(VK_SHADER_STAGE_RAYGEN_BIT_NV),
    // ray-miss
    shaderBindingTable.instance,
    shaderBindingTable.getOffset(VK_SHADER_STAGE_MISS_BIT_NV),
    shaderGroupHandleSize,
    // ray-hit
    shaderBindingTable.instance,
    shaderBindingTable.getOffset(VK_SHADER_STAGE_CLOSEST_HIT_BIT_NV),
    shaderGroupHandleSize,
    // callable-shader
    null,
    0,
    0,
    // dimensions
    width,
    height,
    1
  );
};
