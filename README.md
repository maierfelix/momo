# momo

A Physically based RTX Path Tracer using JavaScript and Vulkan. It uses Disney's Principled BSDF Model for Shading.

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

// TODO
