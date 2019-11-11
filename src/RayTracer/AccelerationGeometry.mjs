import { ASSERT_VK_RESULT } from "../utils.mjs";

import Buffer from "../Buffer.mjs";

import {
  validateTransformSettings
} from "../validate.mjs";

class GeometryInstance {
  constructor(geometry, data) {
    let {transform, material} = data;
    this.geometry = geometry;
    this.transform = transform;
    this.material = material;
    this.modelMatrix = mat4.create();
    this.normalMatrix = mat4.create();
    // the last row is skipped as RTX expects an 3x4 matrix
    this.transformMatrix = mat4.create().subarray(0, 12);
    this.updateTransform();
  }
};

class EmitterInstance extends GeometryInstance {
  constructor(...args) {
    super(...args);
    this.isEmitter = true;
    this.relativeLightObject = null;
  }
};

GeometryInstance.prototype.updateTransform = function() {
  let {scale, rotation, translation} = this.transform;

  let mModel = this.modelMatrix;
  let mNormal = this.normalMatrix;
  let mTransform = this.transformMatrix;

  mat4.identity(mModel);
  // translation
  mat4.translate(mModel, mModel, vec3.fromValues(translation.x, translation.y, translation.z));
  // rotation
  mat4.rotateX(mModel, mModel, rotation.x * (Math.PI / 180));
  mat4.rotateY(mModel, mModel, rotation.y * (Math.PI / 180));
  mat4.rotateZ(mModel, mModel, rotation.z * (Math.PI / 180));
  // scaling
  mat4.scale(mModel, mModel, vec3.fromValues(scale.x, scale.y, scale.z));

  // build normal matrix
  mat3.normalFromMat4(mNormal, mModel);

  // build transform matrix
  mTransform.set(mModel.subarray(0x0, 12), 0x0);
  mTransform[3] = mModel[12];
  mTransform[7] = mModel[13];
  mTransform[11] = mModel[14];
};

export default class AccelerationGeometry {
  constructor(opts = {}) {
    this.mesh = null;
    this.geometry = null;
    this.buffers = {
      vertex: null,
      index: null
    };
    this.instances = [];
    this.parent = opts.parent;
    this.logicalDevice = opts.logicalDevice;
    this.physicalDevice = opts.physicalDevice;
  }
};

AccelerationGeometry.prototype.create = function(mesh) {
  let {vertices, indices} = mesh;

  let buffers = this.allocate(mesh);

  let vertexStride = 3;
  let vertexFormat = VK_FORMAT_R32G32B32_SFLOAT;
  let indexType = indices.constructor === Uint32Array ? VK_INDEX_TYPE_UINT32 : VK_INDEX_TYPE_UINT16;

  let geometry = new VkGeometryNV();
  geometry.geometryType = VK_GEOMETRY_TYPE_TRIANGLES_NV;
  geometry.geometry.triangles.vertexData = buffers.vertex.instance;
  geometry.geometry.triangles.vertexOffset = 0;
  geometry.geometry.triangles.vertexCount = vertices.length;
  geometry.geometry.triangles.vertexStride = vertexStride * vertices.constructor.BYTES_PER_ELEMENT;
  geometry.geometry.triangles.vertexFormat = VK_FORMAT_R32G32B32_SFLOAT;
  geometry.geometry.triangles.indexData = buffers.index.instance;
  geometry.geometry.triangles.indexOffset = 0;
  geometry.geometry.triangles.indexCount = indices.length;
  geometry.geometry.triangles.indexType = VK_INDEX_TYPE_UINT32;
  geometry.geometry.triangles.transformData = null;
  geometry.geometry.triangles.transformOffset = 0;
  geometry.flags = VK_GEOMETRY_OPAQUE_BIT_NV;

  this.mesh = mesh;
  this.geometry = geometry;

  return this;
};

AccelerationGeometry.prototype.destroy = function() {
  let {buffers} = this;
  this.mesh = null;
  this.geometry = null;
  if (buffers.vertex) buffers.vertex.destroy();
  if (buffers.index) buffers.index.destroy();
};

AccelerationGeometry.prototype.allocate = function(mesh) {
  let {logicalDevice, physicalDevice} = this;
  let {buffers} = this;
  let {vertices, indices} = mesh;
  // allocate vertices
  let vertexBuffer = new Buffer({ logicalDevice, physicalDevice });
  vertexBuffer.allocate(
    vertices,
    VK_BUFFER_USAGE_VERTEX_BUFFER_BIT,
    VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT
  );
  vertexBuffer.unmap();
  // allocate indices
  let indexBuffer = new Buffer({ logicalDevice, physicalDevice });
  indexBuffer.allocate(
    indices,
    VK_BUFFER_USAGE_INDEX_BUFFER_BIT,
    VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT
  );
  indexBuffer.unmap();
  buffers.vertex = vertexBuffer;
  buffers.index = indexBuffer;
  return buffers;
};

AccelerationGeometry.prototype.addMeshInstance = function(data) {
  // validate input
  if (!data.hasOwnProperty("material")) {
    throw new ReferenceError(`Geometry Instance is missing a 'material' property`);
  }
  if (!data.hasOwnProperty("transform")) {
    throw new ReferenceError(`Geometry Instance is missing a 'transform' property`);
  }
  validateTransformSettings(data.transform);
  let instance = new AccelerationGeometry.GeometryInstance(this, data);
  this.instances.push(instance);
};

AccelerationGeometry.prototype.addEmitterInstance = function(data) {
  let {parent} = this;
  // validate input
  if (!data.hasOwnProperty("material")) {
    throw new ReferenceError(`Emitter Instance is missing a 'material' property`);
  }
  if (!data.hasOwnProperty("transform")) {
    throw new ReferenceError(`Emitter Instance is missing a 'transform' property`);
  }
  validateTransformSettings(data.transform);
  // create a relative light object
  let light = parent.addLight(data);
  // create the geometry for the emitter
  let instance = new AccelerationGeometry.EmitterInstance(this, data);
  // assign the light object to the emitter
  instance.relativeLightObject = light;
  light.relativeGeometryInstance = instance;
  this.instances.push(instance);
};

AccelerationGeometry.GeometryInstance = GeometryInstance;
AccelerationGeometry.EmitterInstance = EmitterInstance;
