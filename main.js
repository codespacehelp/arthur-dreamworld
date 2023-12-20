import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";
import { OrbitControls } from "three/addons/controls/OrbitControls";

let rng;

function random(min, max) {
  return rng() * (max - min) + min;
}

const config = {
  ballsAmount: 50,
  ballScale: 1,
  spikeAmount: 50,
  spikeScale: 1,
};

const controllerMapping = {
  16: { name: "ballsAmount", multiplier: 100 },
  17: { name: "ballScale", multiplier: 1 },
  20: { name: "spikeAmount", multiplier: 100 },
  21: { name: "spikeScale", multiplier: 1 },
};

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

  const spikes = gltfObjects.getObjectByName("atom_spikes");
  spikes.position.set(0, 0, 0);

  for (let i = 0; i < config.ballsAmount; i++) {
    const clone = balls.clone();
    clone.position.set(random(-10, 10), random(-10, 10), random(-10, 10));
    clone.scale.set(config.ballScale, config.ballScale, config.ballScale);
    worldGroup.add(clone);
  }

  for (let i = 0; i < config.spikeAmount; i++) {
    const clone = spikes.clone();
    clone.position.set(random(-10, 10), random(-10, 10), random(-10, 10));
    clone.scale.set(config.spikeScale, config.spikeScale, config.spikeScale);
    worldGroup.add(clone);
  }
}

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}
animate();

WebMidi.enable()
  .then(onEnabled)
  .catch((err) => alert(err));

function onEnabled() {
  console.log(WebMidi.inputs);
  // Display available MIDI input devices
  if (WebMidi.inputs.length < 1) {
    document.body.innerHTML += "No device detected.";
  } else {
    WebMidi.inputs.forEach((device, index) => {
      // document.body.innerHTML+= `${index}: ${device.name} <br>`;
      console.log(`${index}: ${device.name}`);
    });

    const midiController = WebMidi.inputs[0];
    console.log(midiController.name);
    midiController.addListener("controlchange", (e) => {
      const controllerNumber = e.controller.number;
      const controller = controllerMapping[controllerNumber];
      if (!controller) return;
      config[controller.name] = e.value * controller.multiplier;

      rebuildScene();
    });
  }
}
