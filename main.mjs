import { dirname } from "./src/utils.mjs";

import Momo from "./src/index.mjs";

const ASSET_PATH = dirname + "/assets/";
const MODEL_PATH = "/models/";
const TEXTURE_PATH = "/textures/";

function generateCornellBox(Plane, material, scale) {
  let bottom = Plane.addMeshInstance({
    transform: {
      scale: { x: scale, y: scale, z: scale },
      rotation: { x: 0, y: 0, z: 0 },
      translation: { x: 0, y: 0, z: 0 }
    },
    material
  });
  let top = Plane.addMeshInstance({
    transform: {
      scale: { x: scale, y: scale, z: scale },
      rotation: { x: 0, y: 0, z: 0 },
      translation: { x: 0, y: scale + scale, z: 0 }
    },
    material
  });
  let left = Plane.addMeshInstance({
    transform: {
      scale: { x: scale, y: scale, z: scale },
      rotation: { x: 90, y: 90, z: 0 },
      translation: { x: -scale, y: scale, z: 0 }
    },
    material
  });
  let right = Plane.addMeshInstance({
    transform: {
      scale: { x: scale, y: scale, z: scale },
      rotation: { x: 90, y: 90, z: 180 },
      translation: { x: scale, y: scale, z: 0 }
    },
    material
  });
  let back = Plane.addMeshInstance({
    transform: {
      scale: { x: scale, y: scale, z: scale },
      rotation: { x: 90, y: 180, z: 0 },
      translation: { x: 0, y: scale, z: -scale }
    },
    material
  });
  let front = Plane.addMeshInstance({
    transform: {
      scale: { x: scale, y: scale, z: scale },
      rotation: { x: 90, y: 0, z: 0 },
      translation: { x: 0, y: scale, z: scale }
    },
    material
  });
};

(async function main() {

  let momo = new Momo();

  await momo.create();

  /* Load all required Geometries*/
  let Plane = momo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "plane.obj");
/*
  let MetalAlbedo = momo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "[4K]Metal03/Metal03_col.jpg");
  let MetalNormal = momo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "[4K]Metal03/Metal03_nrm.jpg");
  let MetalMetalRoughness = momo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "[4K]Metal03/Metal03_met_rgh.jpg");
*/

  let Parquet03Albedo = momo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "Parquet_flooring_03_2K_Base_Color.jpg");
  let Parquet03Normal = momo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "Parquet_flooring_03_2K_Normal.jpg");
  let Parquet03MetalRoughness = momo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "Parquet_flooring_03_2K_Metallic_Roughness.jpg");

  let Parquet04Albedo = momo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "Parquet_flooring_04_2K_Base_Color.jpg");
  let Parquet04Normal = momo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "Parquet_flooring_04_2K_Normal.jpg");
  let Parquet04MetalRoughness = momo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "Parquet_flooring_04_2K_Metallic_Roughness.jpg");

  let Fabric13Albedo = momo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "Fabric13_col.jpg");
  let Fabric13Normal = momo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "Fabric13_nrm.jpg");
  let Fabric13MetalRoughness = momo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "Fabric13_met_rgh.jpg");
/*
  let RedCottonAlbedo = momo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "Red_cotton_01_2K_Base_Color.jpg");
  let RedCottonNormal = momo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "Parquet_flooring_02_2K_Normal.jpg");
  let RedCottonMetalRoughness = momo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "Parquet_flooring_02_2K_Metallic_Roughness.jpg");

  let WhiteBrickWallAlbedo = momo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "White_brick_wall_01_2K_Base_Color.jpg");
  let WhiteBrickWallNormal = momo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "White_brick_wall_01_2K_Normal.jpg");
  let WhiteBrickWallMetalRoughness = momo.loadTextureFile(ASSET_PATH + TEXTURE_PATH + "White_brick_wall_01_2K_Metallic_Roughness.jpg");
*/
  Plane.addEmitterInstance({
    transform: {
      scale: { x: 768, y: 768, z: 768 },
      rotation: { x: 140, y: 90, z: 0 },
      translation: { x: -1024 - 256, y: 256, z: 0 }
    },
    material: momo.addMaterial({
      color: [3200, 2800, 2400]
    })
  });

  let Parquet03 = momo.addMaterial({
    albedo: Parquet03Albedo,
    normal: Parquet03Normal,
    metalRoughness: Parquet03MetalRoughness
  });

  let Parquet04 = momo.addMaterial({
    albedo: Parquet04Albedo,
    normal: Parquet04Normal,
    metalRoughness: Parquet04MetalRoughness
  });

  let sceneTransform = {
    scale: { x: 32, y: 32, z: 32 },
    rotation: { x: 0, y: 0, z: 0 },
    translation: { x: 0, y: 0, z: 0 }
  };

  momo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "indoor/carpet.obj").addMeshInstance({
    transform: sceneTransform,
    material: momo.addMaterial({
      albedo: Fabric13Albedo,
      normal: Fabric13Normal,
      metalRoughness: Fabric13MetalRoughness
    })
  });

  momo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "indoor/chairs.obj").addMeshInstance({
    transform: sceneTransform,
    material: Parquet04
  });

  momo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "indoor/commode.obj").addMeshInstance({
    transform: sceneTransform,
    material: Parquet04
  });

  momo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "indoor/floor.obj").addMeshInstance({
    transform: sceneTransform,
    material: Parquet03
  });

  momo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "indoor/heads.obj").addMeshInstance({
    transform: sceneTransform,
    material: momo.addMaterial({
      color: [255,255,255],
      specular: 0.995,
      metalness: 0.89,
      roughness: 0.0
    })
  });

  momo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "indoor/photoframe.obj").addMeshInstance({
    transform: sceneTransform,
    material: momo.addMaterial({
      color: [32],
      specular: 0.7,
      metalness: 0.39,
      roughness: 0.02
    })
  });

  momo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "indoor/roof.obj").addMeshInstance({
    transform: sceneTransform,
    material: momo.addMaterial({
      color: [222],
      specular: 0.05,
      metalness: 0.01,
      roughness: 0.4
    })
  });

  momo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "indoor/table.obj").addMeshInstance({
    transform: sceneTransform,
    material: Parquet04
  });

  momo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "indoor/wall.obj").addMeshInstance({
    transform: sceneTransform,
    material: momo.addMaterial({
      color: [222],
      specular: 0.05,
      metalness: 0.01,
      roughness: 0.4
    })
  });

  momo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "indoor/window.obj").addMeshInstance({
    transform: sceneTransform,
    material: momo.addMaterial({
      color: [244],
      specular: 0.005,
      metalness: 0.001,
      roughness: 0.3
    })
  });

  /* Run the ray tracer */
  momo.execute();

})();
