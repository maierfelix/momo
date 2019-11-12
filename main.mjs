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
  let Suzanne = momo.loadGeometryFile(ASSET_PATH + MODEL_PATH + "suzanne.obj");

  /* Generate cornell box */
  let MaterialCornellBox = momo.addMaterial({
    color: [64],
    metalness: 0.005,
    roughness: 0.008,
    specular: 0.45
  });
  let CornellBoxScale = 128;
  generateCornellBox(Plane, MaterialCornellBox, CornellBoxScale);

  /* Add Suzanne model */
  Suzanne.addMeshInstance({
    transform: {
      scale: { x: 16, y: 16, z: 16 },
      rotation: { x: 0, y: 0, z: 0 },
      translation: { x: 0, y: 18, z: 0}
    },
    material: momo.addMaterial({
      color: [248,122,122],
      metalness: 0.175,
      roughness: 0.1,
      specular: 0.75,
      sheen: 0.35,
      sheenTint: 0.78
    })
  })

  /* Add a simple quad emitter */
  Plane.addEmitterInstance({
    transform: {
      scale: { x: CornellBoxScale * 0.5, y: CornellBoxScale * 0.5, z: CornellBoxScale * 0.5 },
      rotation: { x: 0, y: 0, z: 0 },
      translation: { x: 0, y: CornellBoxScale - 1, z: 0 }
    },
    material: momo.addMaterial({
      color: [1600]
    })
  });

  /* Add a simple quad emitter */
  Plane.addEmitterInstance({
    transform: {
      scale: { x: CornellBoxScale * 0.125, y: CornellBoxScale * 0.125, z: CornellBoxScale * 0.125 },
      rotation: { x: 140, y: 90, z: 0 },
      translation: { x: -CornellBoxScale * 0.75, y: CornellBoxScale * 0.5, z: 0 }
    },
    material: momo.addMaterial({
      color: [1400]
    })
  });

  /* Run the ray tracer */
  momo.execute();

})();
