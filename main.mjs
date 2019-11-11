import { dirname } from "./src/utils.mjs";

import RayTracingDemo from "./src/index.mjs";

const ASSET_PATH = dirname + "/assets/";
const MODEL_PATH = "/models/";
const TEXTURE_PATH = "/textures/";

function generateCornellBox(Demo, Plane) {
  let s = 128.0;
  let color = [0.2];

  let material = Demo.addMaterial({
    color: [32],
    metalness: 0.7,
    roughness: 0.0
  });

  let bottom = Plane.addMeshInstance({
    transform: {
      scale: { x: s, y: s, z: s },
      rotation: { x: 0, y: 0, z: 0 },
      translation: { x: 0, y: 0, z: 0 }
    },
    material
  });
  let top = Plane.addMeshInstance({
    transform: {
      scale: { x: s, y: s, z: s },
      rotation: { x: 0, y: 0, z: 0 },
      translation: { x: 0, y: s + s, z: 0 }
    },
    material
  });
  let left = Plane.addMeshInstance({
    transform: {
      scale: { x: s, y: s, z: s },
      rotation: { x: 90, y: 90, z: 0 },
      translation: { x: -s, y: s, z: 0 }
    },
    material
  });
  let right = Plane.addMeshInstance({
    transform: {
      scale: { x: s, y: s, z: s },
      rotation: { x: 90, y: 90, z: 180 },
      translation: { x: s, y: s, z: 0 }
    },
    material
  });
  let back = Plane.addMeshInstance({
    transform: {
      scale: { x: s, y: s, z: s },
      rotation: { x: 90, y: 180, z: 0 },
      translation: { x: 0, y: s, z: -s }
    },
    material
  });
  let front = Plane.addMeshInstance({
    transform: {
      scale: { x: s, y: s, z: s },
      rotation: { x: 90, y: 0, z: 0 },
      translation: { x: 0, y: s, z: s }
    },
    material
  });
};

(async function main() {

  let Demo = new RayTracingDemo();

  await Demo.create();

  /* Load all required Geometries*/
  let Plane = Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "plane.obj");
  let Star = Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "star.obj");
  let Cube = Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "cube.obj");

  let MetalAlbedo = Demo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "[4K]Metal03/Metal03_col.jpg");
  let MetalNormal = Demo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "[4K]Metal03/Metal03_nrm.jpg");
  let MetalMetalRoughness = Demo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "[4K]Metal03/Metal03_met_rgh.jpg");
/*
  let WallAlbedo = Demo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "White_stucco_wall_01_2K_Base_Color.png");
  let WallNormal = Demo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "White_stucco_wall_01_2K_Normal.png");
  let WallMetalRoughness = Demo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "White_stucco_wall_01_2K_Metallic_Roughness.png");
*/
  //let WoodAlbedo = Demo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "[4K]Wood27/Wood27_col.jpg");
  //let WoodNormal = Demo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "[4K]Wood27/Wood27_nrm.jpg");
  //let WoodMetalRoughness = Demo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "[4K]Wood27/Wood27_metal_rgh.jpg");

  let Parcquet03Albedo = Demo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "Wood27_col.jpg");
  let Parcquet03Normal = Demo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "Wood27_nrm.jpg");
  let Parcquet03MetalRoughness = Demo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "Wood27_met_rgh.jpg");

  let HerringboneParcquet04Albedo = Demo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "Wood26_col.jpg");
  let HerringboneParcquet04Normal = Demo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "Wood26_nrm.jpg");
  let HerringboneParcquet04MetalRoughness = Demo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "Wood26_met_rgh.jpg");

  let RedCottonAlbedo = Demo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "Fabric13_col.jpg");
  let RedCottonNormal = Demo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "Fabric13_nrm.jpg");
  let RedCottonMetalRoughness = Demo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "Fabric13_met_rgh.jpg");

  let WhiteBrickWallAlbedo = Demo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "White_brick_wall_01_2K_Base_Color.jpg");
  let WhiteBrickWallNormal = Demo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "White_brick_wall_01_2K_Normal.jpg");
  let WhiteBrickWallMetalRoughness = Demo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "White_brick_wall_01_2K_Metallic_Roughness.jpg");

  //let BodyAlbedo = Demo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "02_Body_Base_Color.png");
  //let BodyNormal = Demo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "02_Body_Normal_DirectX.png");
  //let BodyMetalRoughness = Demo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "02_Body_MetallicRoughness.png");

  /*let HeadAlbedo = Demo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "[4K]Metal03/Metal03_col.jpg");
  let HeadNormal = Demo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "[4K]Metal03/Metal03_nrm.jpg");
  let HeadMetalRoughness = Demo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "[4K]Metal03/Metal03_met_rgh.jpg");*/

/*
  let ss = 8;
  for (let xx = 0; xx < ss; ++xx) {
    for (let zz = 0; zz < ss; ++zz) {
      Head.addMeshInstance({
        transform: {
          scale: { x: 128.0, y: 128.0, z: 128.0 },
          rotation: { x: 0, y: 0, z: 0 },
          translation: { x: -(ss * 6) + zz*12, y: -1.35, z: -(ss * 6) + xx*12 }
        },
        material: Demo.addMaterial({
          albedo: HeadAlbedo,
          normal: HeadNormal,
          metalRoughness: HeadMetalRoughness
        })
      });
      Body.addMeshInstance({
        transform: {
          scale: { x: 128.0, y: 128.0, z: 128.0 },
          rotation: { x: 0, y: 0, z: 0 },
          translation: { x: -(ss * 6) + zz*12, y: -1.35, z: -(ss * 6) + xx*12 }
        },
        material: Demo.addMaterial({
          albedo: HeadAlbedo,
          normal: HeadNormal,
          metalRoughness: HeadMetalRoughness
        })
      });
    };
  };
*/

  //generateCornellBox(Demo, Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "plane.obj"));

  Plane.addEmitterInstance({
    transform: {
      scale: { x: 512, y: 512, z: 512 },
      rotation: { x: 90, y: 0, z: 90 },
      translation: { x: 0, y: 32, z: -256 }
    },
    material: Demo.addMaterial({
      color: [2200]
    })
  });
  let LampEmitter = Demo.addMaterial({
    color: [222],
  });

  let sceneTransform = {
    scale: { x: 128, y: 128, z: 128 },
    rotation: { x: 0, y: 0, z: 0 },
    translation: { x: 0, y: 0, z: 0 }
  };

  let Boxes = Demo.addMaterial({
    color: [123.17621999999999, 98.08932, 76.898055],
  });
  let PlasticCable = Demo.addMaterial({
    color: [142.42846500000002, 142.42846500000002, 142.42846500000002],
  });
  let Blankets = Demo.addMaterial({
    color: [123.785925, 116.34706499999999, 109.15912499999999],
  });
  let Bedsheets = Demo.addMaterial({
    albedo: RedCottonAlbedo,
    normal: RedCottonNormal,
    metalRoughness: RedCottonMetalRoughness
  });
  let Window = Demo.addMaterial({
    color: [122.84115, 122.84115, 122.84115],
  });
  let PictureBacking = Demo.addMaterial({
    color: [28.449585, 9.45234, 4.33908],
  });
  let Picture = Demo.addMaterial({
    color: [32,8,8],
  });
  let Rocks1 = Demo.addMaterial({
    color: [89.460885, 61.96143, 45.60165],
  });
  let Rocks2 = Demo.addMaterial({
    color: [25.23582, 25.23582, 25.23582],
  });
  let Rocks3 = Demo.addMaterial({
    color: [142.42872, 142.42872, 142.42872],
  });
  let DecoPlant = Demo.addMaterial({
    color: [10.65186, 2.88303, 1.931625],
  });
  let Painting1 = Demo.addMaterial({
    color: [32,8,8],
    color: [3.92598, 3.92598, 3.92598],
  });
  let Painting2 = Demo.addMaterial({
    color: [32,8,8],
    color: [3.92598, 3.92598, 3.92598],
  });
  let Painting3 = Demo.addMaterial({
    color: [32,8,8],
    color: [3.92598, 3.92598, 3.92598],
  });
  let Carpet = Demo.addMaterial({
    color: [3,3,3],
    roughness: 0.8,
    sheen: 0.5,
    sheenTint: 0.2
  });
  let Matress = Demo.addMaterial({
    color: [122],
    roughness: 0.8,
    sheen: 0.5,
    sheenTint: 0.2
  });
  let WoodFloor = Demo.addMaterial({
    albedo: Parcquet03Albedo,
    normal: Parcquet03Normal,
    metalRoughness: Parcquet03MetalRoughness,
    specular: 0.25,
    clearCoat: 0.75,
    clearcoatGloss: 0.2,
    sheen: 0.6,
    sheenTint: 0.3
  });
  let Walls = Demo.addMaterial({
    albedo: WhiteBrickWallAlbedo,
    normal: WhiteBrickWallNormal,
    metalRoughness: WhiteBrickWallMetalRoughness
  });
  let Walls2 = Demo.addMaterial({
    albedo: WhiteBrickWallAlbedo,
    normal: WhiteBrickWallNormal,
    metalRoughness: WhiteBrickWallMetalRoughness
  });
  let WoodFurniture = Demo.addMaterial({
    albedo: HerringboneParcquet04Albedo,
    normal: HerringboneParcquet04Normal,
    metalRoughness: HerringboneParcquet04MetalRoughness,
    specular: 0.43
  });
  let Mirror = Demo.addMaterial({
    color: [255, 255, 255],
    roughness:  0.0,
    metalness:  1.0,
  });
  let Aluminium = Demo.addMaterial({
    albedo: MetalAlbedo,
    normal: MetalNormal,
    roughness:  0.2,
    metalness:  1.0,
  });
  let BookCover = Demo.addMaterial({
    color: [0, 0, 0],
  });
  let BookPages = Demo.addMaterial({
    color: [144.591885, 144.591885, 144.591885],
  });
  let LampMetal = Demo.addMaterial({
    color: [255, 255, 255],
    roughness:  0.1,
  });
  let Vase = Demo.addMaterial({
    color: [255, 255, 255],
  });
  let Glass = Demo.addMaterial({
    color: [255, 255, 255],
  });
  let PictureFrame = Demo.addMaterial({
    color: [255, 255, 255],
    roughness:  0.1,
    metalness:  1.0,
  });
  let CurtainRod = Demo.addMaterial({
    color: [127.5, 127.5, 127.5],
    roughness:  0.1,
    metalness:  1.0,
  });
  let Curtains = Demo.addMaterial({
    color: [185],
    roughness: 0.085,
    metalness: 0.237,
    subsurface: 0.9
  });
  let StainlessSmooth = Demo.addMaterial({
    color: [255, 255, 255],
    roughness:  0.0,
    metalness:  1.0,
  });

  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh044.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Aluminium
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh047.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Aluminium
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh032.obj").addMeshInstance({
    transform: sceneTransform,
    material:  WoodFurniture
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh028.obj").addMeshInstance({
    transform: sceneTransform,
    material:  StainlessSmooth
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh046.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Aluminium
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh027.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Aluminium
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh022.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Aluminium
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh042.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Aluminium
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh036.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Aluminium
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh043.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Aluminium
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh040.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Aluminium
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh037.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Glass
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh0337.obj").addMeshInstance({
    transform: sceneTransform,
    material:  LampEmitter
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh0338.obj").addMeshInstance({
    transform: sceneTransform,
    material:  LampEmitter
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh026.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Glass
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh023.obj").addMeshInstance({
    transform: sceneTransform,
    material:  LampMetal
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh059.obj").addMeshInstance({
    transform: sceneTransform,
    material:  LampEmitter
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh049.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Glass
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh060.obj").addMeshInstance({
    transform: sceneTransform,
    material:  WoodFloor
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh033.obj").addMeshInstance({
    transform: sceneTransform,
    material:  DecoPlant
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh025.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Rocks1
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh055.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Rocks2
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh035.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Rocks3
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh048.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Glass
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh056.obj").addMeshInstance({
    transform: sceneTransform,
    material:  LampMetal
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh058.obj").addMeshInstance({
    transform: sceneTransform,
    material:  PlasticCable
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh061.obj").addMeshInstance({
    transform: sceneTransform,
    material:  LampEmitter
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh051.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Glass
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh066.obj").addMeshInstance({
    transform: sceneTransform,
    material:  LampMetal
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh062.obj").addMeshInstance({
    transform: sceneTransform,
    material:  PlasticCable
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh054.obj").addMeshInstance({
    transform: sceneTransform,
    material:  LampEmitter
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh063.obj").addMeshInstance({
    transform: sceneTransform,
    material:  BookCover
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh064.obj").addMeshInstance({
    transform: sceneTransform,
    material:  BookPages
  });
  /*Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh099.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Curtains
  });*/
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh041.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Bedsheets
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh052.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Glass
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh065.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Vase
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh067.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Vase
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh068.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Bedsheets
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh034.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Bedsheets
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh021.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Matress
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh020.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Carpet
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh019.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Carpet
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh018.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Painting1
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh017.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Painting2
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh069.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Painting3
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh015.obj").addMeshInstance({
    transform: sceneTransform,
    material:  CurtainRod
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh014.obj").addMeshInstance({
    transform: sceneTransform,
    material:  CurtainRod
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh012.obj").addMeshInstance({
    transform: sceneTransform,
    material:  WoodFurniture
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh011.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Mirror
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh013.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Walls
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh039.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Window
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh010.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Window
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh031.obj").addMeshInstance({
    transform: sceneTransform,
    material:  WoodFurniture
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh045.obj").addMeshInstance({
    transform: sceneTransform,
    material:  StainlessSmooth
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh038.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Mirror
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh009.obj").addMeshInstance({
    transform: sceneTransform,
    material:  WoodFurniture
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh024.obj").addMeshInstance({
    transform: sceneTransform,
    material:  StainlessSmooth
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh030.obj").addMeshInstance({
    transform: sceneTransform,
    material:  WoodFurniture
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh029.obj").addMeshInstance({
    transform: sceneTransform,
    material:  StainlessSmooth
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh008.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Walls2
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh007.obj").addMeshInstance({
    transform: sceneTransform,
    material:  WoodFurniture
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh006.obj").addMeshInstance({
    transform: sceneTransform,
    material:  WoodFurniture
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh005.obj").addMeshInstance({
    transform: sceneTransform,
    material:  StainlessSmooth
  });
  /*Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh098.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Curtains
  });*/
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh050.obj").addMeshInstance({
    transform: sceneTransform,
    material:  PictureFrame
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh053.obj").addMeshInstance({
    transform: sceneTransform,
    material:  PictureBacking
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh003.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Picture
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh002.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Boxes
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh016.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Blankets
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh001.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Blankets
  });
  Demo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "bedroom/Mesh000.obj").addMeshInstance({
    transform: sceneTransform,
    material:  Blankets
  });

  /*
  let lr = 1.0;
  let ly = 4.0 * Math.PI * lr * lr;
  Demo.addLight({
    type: 0,
    radius: { x: lr, y: ly, z: 1.0 },
    translation: { x: 0.0, y: 4.5, z: 4.5 },
    emission: [80, 81, 80]
  });
  */

  /* Run the ray tracer */
  Demo.execute();

})();
