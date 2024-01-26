import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertexShader from "../static/shaders/vertex.glsl";
import fragmentShader from "../static/shaders/fragment.glsl";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass";

///////////////////////////////////////////////////////////////////
//********************** Constants **********************************//
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const orbitRadius = 1;
const orbitSpeed1 = 1;
const orbitSpeed2 = -1.0;

const inclinationAngle1 = Math.PI / 2;
const inclinationAngle2 = -Math.PI / 6;

const particlesCount = 15000;

const posArray = new Float32Array(particlesCount);

for (let i = 0; i < particlesCount; i++) {
  posArray[i] = (Math.random() - 0.5) * 85;
}

///////////////////////////////////////////////////////////////////
//********************** Canvas **********************************//
const canvas = document.querySelector(".webgl");

///////////////////////////////////////////////////////////////////
//********************** Scene **********************************//
const scene = new THREE.Scene();

///////////////////////////////////////////////////////////////////
//********************** Camera **********************************//
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 5;
scene.add(camera);

///////////////////////////////////////////////////////////////////
//********************** Controls **********************************//
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

///////////////////////////////////////////////////////////////////
//********************** Renderer **********************************//
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

///////////////////////////////////////////////////////////////////
//********************** Composer **********************************//
const composer = new EffectComposer(renderer);

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass();
composer.addPass(bloomPass);

bloomPass.strength = 2.3;
bloomPass.radius = 0.9;
bloomPass.threshold = 0.1;

///////////////////////////////////////////////////////////////////
//********************** Textures **********************************//
const textureLoader = new THREE.TextureLoader();
const normalMapTexture = textureLoader.load("textures/NormalMap.png");

///////////////////////////////////////////////////////////////////
//********************** Geometry **********************************//
const largeGeometry = new THREE.SphereGeometry(0.7, 64, 64);

const smallGeometry = new THREE.SphereGeometry(0.1, 32, 32);
const innerSmallGeometry = new THREE.SphereGeometry(0.098, 32, 32);

const particlesGeometry = new THREE.BufferGeometry();

particlesGeometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));

///////////////////////////////////////////////////////////////////
//********************** Materials **********************************//
const largeMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  metalness: 1,
  roughness: 0.5,
  normalMap: normalMapTexture,
});

const mediumMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  metalness: 1,
  roughness: 0.5,
});

const innerSmallMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  metalness: 1,
  roughness: 0.5,
  normalMap: normalMapTexture,
});

const shaderMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: { value: 0 },
    resolution: { value: new THREE.Vector2() },
  },
  transparent: true,
  opacity: 0.5,
});

const particlesMaterial = new THREE.PointsMaterial({
  size: 0.005,
  color: "blue",
});

///////////////////////////////////////////////////////////////////
//********************** Meshes **********************************//
const largeSphere = new THREE.Mesh(largeGeometry, largeMaterial);

const smallSphere1 = new THREE.Mesh(smallGeometry, shaderMaterial);
const smallSphere2 = new THREE.Mesh(smallGeometry, shaderMaterial);

const innerSmallSphere1 = new THREE.Mesh(innerSmallGeometry, innerSmallMaterial);
const innerSmallSphere2 = new THREE.Mesh(innerSmallGeometry, innerSmallMaterial);

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);

///////////////////////////////////////////////////////////////////
//********************** Added Meshes **********************************//
scene.add(largeSphere);

smallSphere1.add(innerSmallSphere1);
smallSphere2.add(innerSmallSphere2);

scene.add(smallSphere1);
scene.add(smallSphere2);
scene.add(particlesMesh);

///////////////////////////////////////////////////////////////////
//********************** Lights **********************************//
const pointLight = new THREE.PointLight(0xffffff, 1.3);
pointLight.position.set(2, 3, 4);
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0xff0000, 2);
pointLight2.position.set(0, 0, 0);
scene.add(pointLight2);

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener("mousemove", (e) => {});

///////////////////////////////////////////////////////////////////
//********************** Animate **********************************//
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  shaderMaterial.uniforms.uTime.value = elapsedTime;

  largeSphere.rotation.y = 0.1 * elapsedTime;

  smallSphere1.position.x = Math.cos(orbitSpeed1 * elapsedTime) * orbitRadius;
  smallSphere1.position.z = Math.sin(orbitSpeed1 * elapsedTime) * orbitRadius;
  smallSphere1.position.y = Math.sin(inclinationAngle1) * orbitRadius;

  smallSphere2.position.x = Math.cos(orbitSpeed2 * elapsedTime) * orbitRadius;
  smallSphere2.position.z = Math.sin(orbitSpeed2 * elapsedTime) * orbitRadius;
  smallSphere2.position.y = Math.sin(inclinationAngle2) * orbitRadius;

  camera.position.x = Math.cos(0.1 * elapsedTime) * 5;
  camera.position.z = Math.sin(0.1 * elapsedTime) * 5;

  controls.update();

  // renderer.render(scene, camera);
  composer.render();

  window.requestAnimationFrame(tick);
};

tick();
