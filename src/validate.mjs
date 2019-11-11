import { isNumeric } from "./utils.mjs";

export function validateTextureSettings(texture) {
  if (!texture.hasOwnProperty("width")) {
    throw new ReferenceError(`Texture 'width' property is missing`);
  }
  if (!texture.hasOwnProperty("height")) {
    throw new ReferenceError(`Texture 'height' property is missing`);
  }
  if (!texture.hasOwnProperty("data")) {
    throw new ReferenceError(`Texture 'data' property is missing`);
  }
  // validate input types
  if (!Number.isInteger(texture.width)) {
    throw new TypeError(`Texture 'width' property must be of type 'Integer'`);
  }
  if (!Number.isInteger(texture.height)) {
    throw new TypeError(`Texture 'height' property must be of type 'Integer'`);
  }
  if (!ArrayBuffer.isView(texture.data)) {
    throw new TypeError(`Texture 'data' property must be of type 'TypedArray'`);
  }
};

export function validateGeometrySettings(geometry) {
  if (!geometry.hasOwnProperty("vertices")) {
    throw new ReferenceError(`Geometry 'vertices' property is missing`);
  }
  if (!geometry.hasOwnProperty("normals")) {
    throw new ReferenceError(`Geometry 'normals' property is missing`);
  }
  if (!geometry.hasOwnProperty("tangents")) {
    throw new ReferenceError(`Geometry 'tangents' property is missing`);
  }
  if (!geometry.hasOwnProperty("uvs")) {
    throw new ReferenceError(`Geometry 'uvs' property is missing`);
  }
  if (!geometry.hasOwnProperty("indices")) {
    throw new ReferenceError(`Geometry 'indices' property is missing`);
  }
  // validate types
  if (!(geometry.vertices instanceof Float32Array)) {
    throw new TypeError(`Geometry 'vertices' property must be of type 'Float32Array'`);
  }
  if (!(geometry.normals instanceof Float32Array)) {
    throw new TypeError(`Geometry 'normals' property must be of type 'Float32Array'`);
  }
  if (!(geometry.tangents instanceof Float32Array)) {
    throw new TypeError(`Geometry 'tangents' property must be of type 'Float32Array'`);
  }
  if (!(geometry.uvs instanceof Float32Array)) {
    throw new TypeError(`Geometry 'uvs' property must be of type 'Float32Array'`);
  }
  if (!(geometry.indices instanceof Uint32Array)) {
    throw new TypeError(`Geometry 'indices' property must be of type 'Uint32Array'`);
  }
};

export function validateTransformSettings(transform) {
  // validate transform object
  if (typeof transform !== "object") {
    throw new TypeError(`Transform must to be of type 'Object'`);
  }
  // validate transform object members
  if (typeof transform.translation !== "object") {
    throw new TypeError(`Transform is missing a 'translation' property`);
  }
  if (typeof transform.rotation !== "object") {
    throw new TypeError(`Transform is missing a 'rotation' property`);
  }
  if (typeof transform.scale !== "object") {
    throw new TypeError(`Transform is missing a 'scale' property`);
  }
  let {
    translation,
    rotation,
    scale
  } = transform;
  // validate that the inputs are numeric
  if (!isNumeric(translation.x) || !isNumeric(translation.y) || !isNumeric(translation.z)) {
    throw new TypeError(`Translation property of Transform is invalid`);
  }
  if (!isNumeric(rotation.x) || !isNumeric(rotation.y) || !isNumeric(rotation.z)) {
    throw new TypeError(`Rotation property of Transform is invalid`);
  }
  if (!isNumeric(scale.x) || !isNumeric(scale.y) || !isNumeric(scale.z)) {
    throw new TypeError(`Scale property of Transform is invalid`);
  }
};
