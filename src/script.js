import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertexShader from "../static/shaders/vertex.glsl";
import fragmentShader from "../static/shaders/fragment.glsl";

const textureLoader = new THREE.TextureLoader();
const normalMapTexture = textureLoader.load("textures/NormalMap.png");

// Canvas
const canvas = document.querySelector(".webgl");

// Scene
const scene = new THREE.Scene();

// Geometry
const largeGeometry = new THREE.SphereGeometry(0.7, 64, 64);

const smallGeometry = new THREE.SphereGeometry(0.1, 32, 32);
const innerSmallGeometry = new THREE.SphereGeometry(0.098, 32, 32);

const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 15000;

const posArray = new Float32Array(particlesCount);

for (let i = 0; i < particlesCount; i++) {
  posArray[i] = (Math.random() - 0.5) * 25;
}

particlesGeometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));

// Materials
const largeMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  metalness: 1,
  roughness: 0.5,
  normalMap: normalMapTexture,
});

const innerSmallMaterial1 = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  metalness: 1,
  roughness: 0.5,
  normalMap: normalMapTexture,
});

const innerSmallMaterial2 = new THREE.MeshStandardMaterial({
  color: 0xffd700,
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

// Meshes
const largeSphere = new THREE.Mesh(largeGeometry, largeMaterial);

const smallSphere1 = new THREE.Mesh(smallGeometry, shaderMaterial);
const smallSphere2 = new THREE.Mesh(smallGeometry, shaderMaterial);

const innerSmallSphere1 = new THREE.Mesh(innerSmallGeometry, innerSmallMaterial1);
const innerSmallSphere2 = new THREE.Mesh(innerSmallGeometry, innerSmallMaterial2);

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
//Added
scene.add(largeSphere);

smallSphere1.add(innerSmallSphere1);
smallSphere2.add(innerSmallSphere2);

scene.add(smallSphere1);
scene.add(smallSphere2);
scene.add(particlesMesh);

// Positioning small spheres around the large sphere
const orbitRadius = 1;
const orbitSpeed1 = 1;
const orbitSpeed2 = -1.0;

// Inclination angles in radians
const inclinationAngle1 = Math.PI / 2; // Adjust the angle as needed
const inclinationAngle2 = -Math.PI / 6; // Adjust the angle as needed

// Lights
const pointLight = new THREE.PointLight(0xffffff, 0.3);
pointLight.position.set(2, 3, 4);
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0xff0000, 2);
pointLight2.position.set(0, 0, 0);
scene.add(pointLight2);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 5;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Animate
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update shader time uniform
  shaderMaterial.uniforms.uTime.value = elapsedTime;

  // Update large sphere
  largeSphere.rotation.y = 0.1 * elapsedTime;

  // Update small spheres' positions with inclination
  smallSphere1.position.x = Math.cos(orbitSpeed1 * elapsedTime) * orbitRadius;
  smallSphere1.position.z = Math.sin(orbitSpeed1 * elapsedTime) * orbitRadius;
  smallSphere1.position.y = Math.sin(inclinationAngle1) * orbitRadius;

  smallSphere2.position.x = Math.cos(orbitSpeed2 * elapsedTime) * orbitRadius;
  smallSphere2.position.z = Math.sin(orbitSpeed2 * elapsedTime) * orbitRadius;
  smallSphere2.position.y = Math.sin(inclinationAngle2) * orbitRadius;

  // Update Orbital Controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
