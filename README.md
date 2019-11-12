# momo

This project allows to render photorealistic images. The rendering process is accelerated using NVIDIA's new [RTX technology](https://developer.nvidia.com/rtx), which drastically reduces the necessary time to render high-quality images.

The entire project was written in JavaScript and Vulkan and uses the Disney Principled BSDF material model (e.g. used in Blender Cycles).

## Screenshots:

Scenes are downloaded from [here](https://benedikt-bitterli.me/resources/)

| Bedroom |
:-------------------------:|
<a><img src="https://i.imgur.com/Sr7mL1W.png" height="228"></a>

| Suzanne |
:-------------------------:|
<a><img src="https://i.imgur.com/RgKfrbV.png" height="228"></a>

## TODO:

 - Transmissive Material support
 - Glass shader
 - HDR environment probes
 - Optix AI Denoiser (recently got Vulkan interopability)
 - HTML5 based GUI using [*azula*](https://github.com/maierfelix/azula)
 - Validate Clearcoat Parameter

## WebAssembly:

This project uses the following WebAssembly ports of popular C/C++ libraries:

 - [*jpeg-turbo*](https://www.npmjs.com/package/@cwasm/jpeg-turbo) - For reading JPEG files
 - [*lodepng*](https://www.npmjs.com/package/@cwasm/lodepng) - For reading PNG files
 - [*tolw*](https://www.npmjs.com/package/tolw) - For reading OBJ files

Note that when reading large Object or Texture files, the memory usage gets quite high. That's because of a WebAssembly limitation where it's not possible to actually free/shrink WebAssembly memory, you can only grow it. This can be bypassed by e.g. destroying the entire WebAssembly module after each operation.

## API:

See [this](https://github.com/maierfelix/momo/blob/master/main.mjs) file for an example on how to use the API.

To create a new instance of momo, use:

````js
let momo = new Momo();
await momo.create();
````

To start the path tracing process:

````js
momo.execute();
````

### Loading Resources:

#### Momo.prototype.loadGeometryFile

This method allows to read a geometry file from a path. Currently there is only support for Wavefront *OBJ* files.

| Name | Type | Description |
| :--- | :--- | :--- |
| path | *String* | Path to the geometry file to load |

````js
let Quad = momo.loadGeometryFile("assets/models/quad.obj");
````

#### Momo.prototype.loadTextureFile

This method allows to read a texture file from a path. There is support for *JPG* and *PNG* files.

| Name | Type | Description |
| :--- | :--- | :--- |
| path | *String* | Path to the texture file to load |

````js
let Texture = momo.loadTextureFile("assets/textures/white.png");
let Texture = momo.loadTextureFile("assets/textures/white.jpg");
````

### Scene Description:

There are multiple methods to describe a scene. Note that Momo has an instancing oriented style, meaning that it recommended to re-use geometry and materials.

#### Transforms

A transform has the following layout:

| Name | Type | Description |
| :--- | :--- | :--- |
| scale | *Object* | The scaling of an Object |
| rotation | *Object* | The rotation of an Object (in degree) |
| translation | *Object* | The translation of an Object |

```js
let transform = {
  scale: { x: 0.0, y: 0.0, z: 0.0 },
  rotation: { x: 0.0, y: 0.0, z: 0.0 },
  translation: { x: 0.0, y: 0.0, z: 0.0 }
};
```

Transforms are used across multiple locations in the API.

#### Materials

| Name | Type | Description |
| :--- | :--- | :--- |
| albedo | *Object* | In *SRGB* space |
| normal | *Object* | In *SRGB* space |
| metalRoughness | *Object* | In *SRGB* space, *R-Channel* metalness, *G-Channel* roughness |
| color | *Array* | |
| metalness | *Number* |  |
| specular | *Number* |  |
| roughness | *Number* |  |
| specularTint | *Number* |  |
| sheenTint | *Number* |  |
| sheen | *Number* |  |
| clearcoatGloss | *Number* |  |
| clearcoat | *Number* |  |
| subsurface | *Number* |  |

```js
// Material without using textures
let Material0 = Demo.addMaterial({
  color: [248, 122, 122],
  metalness: 0.175,
  roughness: 0.1,
  specular: 0.75,
  sheen: 0.35,
  sheenTint: 0.78
});

// Material with textures
let albedo = Demo.loadTextureFile("assets/textures/albedo.jpg");
let normal = Demo.loadTextureFile("assets/textures/normal.jpg");
let metalRoughness = Demo.loadTextureFile("assets/textures/metal_roughness.jpg");
let Material1 = Demo.addMaterial({
  albedo,
  normal,
  metalRoughness,
  specular: 0.5,
  sheen: 0.25,
  sheenTint: 0.38
});
```

Materials are used across multiple locations in the API.

#### Mesh Instancing:

After loading a geometry file using *loadGeometryFile*, you can now start adding mesh instances of that geometry to your scene.

| Name | Type | Description |
| :--- | :--- | :--- |
| transform | *Object* | An Object describing the transformation of the instance |
| material | *Object* | Object reference to a material |

```js
Quad.addMeshInstance({
  transform,
  material
});
```

#### Emitter Instancing:

Similar to mesh instancing, you can also add an emitter instance of the geometry which is then interpreted as a light source.

| Name | Type | Description |
| :--- | :--- | :--- |
| transform | *Object* | An Object describing the transformation of the instance |
| material | *Object* | Object reference to a material with only a color property |

```js
Quad.addEmitterInstance({
  transform,
  material
});
```

Note that the only valid property of an Emitter's material is a `color` property, which describes the color and the energy of the light (The color isn't clamped to 0-255 range).

```js
Quad.addEmitterInstance({
  transform,
  material: Demo.addMaterial({ color: [800, 600, 400] })
});
```
