import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";
import { OrbitControls } from "three/addons/controls/OrbitControls";

let rng;

function random(min, max) {
  return rng() * (max - min) + min;
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const worldGroup = new THREE.Group();
scene.add(worldGroup);

const controls = new OrbitControls(camera, renderer.domElement);

const loader = new GLTFLoader();
let gltfObjects;
loader.load("dreamworld_atoms.glb", function (gltf) {
  gltfObjects = gltf.scene;
  rebuildScene();
});

const ambienLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambienLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(0, 0, 1);
scene.add(dirLight);

const gridHelper = new THREE.GridHelper(100, 100);
scene.add(gridHelper);

camera.position.z = 5;

let amount = 1;

function rebuildScene() {
  if (!gltfObjects) return;

  // Remove all objects from world group
  while (worldGroup.children.length) {
    worldGroup.remove(worldGroup.children[0]);
  }

  // Initialize the random generator
  rng = new Math.seedrandom(1112233);

  const balls = gltfObjects.getObjectByName("atom_balls"); // .material.color.setHex(0x0000ff);
  balls.position.set(0, 0, 0);

  for (let i = 0; i < amount; i++) {
    const clone = balls.clone();
    clone.position.set(random(-10, 10), random(-10, 10), random(-10, 10));
    worldGroup.add(clone);
  }
  amount;
}

function animate() {
  requestAnimationFrame(animate);
  rebuildScene();

  renderer.render(scene, camera);
}
animate();
