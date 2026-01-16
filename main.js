import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

// ===== CONTAINER =====
const container = document.querySelector(".model-3d");

if (!container) {
  throw new Error("❌ Không tìm thấy .model-3d");
}

// LẤY SIZE CỦA DIV
const width = container.clientWidth;
const height = container.clientHeight;

// ===== RENDERER =====
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});

renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputColorSpace = THREE.SRGBColorSpace;

container.appendChild(renderer.domElement);

// ===== SCENE =====
const scene = new THREE.Scene();

// ===== CAMERA =====
const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);

// ===== CONTROLS =====
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 1;

// ===== LIGHTING =====
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2));

const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// ===== SPOTLIGHT =====
const spotLight = new THREE.SpotLight(
  0xffffff, // màu
  3, // intensity
  100, // distance
  Math.PI / 6, // góc chiếu
  0.3, // penumbra (viền mềm)
  1 // decay
);

spotLight.position.set(5, 8, 5);
spotLight.target.position.set(0, 0, 0);

scene.add(spotLight);
scene.add(spotLight.target);

// ===== LOAD MODEL =====
const loader = new GLTFLoader().setPath("/models/");

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/"); // đường dẫn tới decoder
loader.setDRACOLoader(dracoLoader);

loader.load(
  "final1.glb",
  (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    // ===== AUTO CENTER + FIT CAMERA =====
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    model.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= 1;

    camera.position.set(0, maxDim * 0.6, cameraZ);
    camera.lookAt(0, 0, 0);

    camera.near = maxDim / 100;
    camera.far = maxDim * 100;
    camera.updateProjectionMatrix();

    controls.target.set(0, 0, 0);
    controls.update();

    console.log("✅ Model loaded into .model-3d");
  },
  undefined,
  (error) => {
    console.error("❌ Load model failed", error);
  }
);

// ===== RESIZE THEO DIV =====
window.addEventListener("resize", () => {
  const w = container.clientWidth;
  const h = container.clientHeight;

  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
});

// ===== ANIMATE =====
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
