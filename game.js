
import * as THREE from "three";

// =====================================
// ORVEX CITY - 3D GAME ENGINE
// ORVEX TECHNOLOGIES
// =====================================

const game = document.getElementById("game");
const loadingScreen = document.getElementById("loadingScreen");
const loadingProgress = document.getElementById("loadingProgress");
const loadingText = document.getElementById("loadingText");
const errorMessage = document.getElementById("errorMessage");

try {

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x91b9d5);
scene.fog = new THREE.Fog(0x91b9d5, 100, 360);

// CAMERA
const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  700
);

camera.position.set(0, 5, 10);

// RENDERER
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

game.prepend(renderer.domElement);

// LIGHTING
const ambient = new THREE.HemisphereLight(
  0xc5e0ff,
  0x65523c,
  2
);
scene.add(ambient);

const sunlight = new THREE.DirectionalLight(
  0xffe2b5,
  3
);

sunlight.position.set(70, 100, 40);
sunlight.castShadow = true;
sunlight.shadow.mapSize.set(1024, 1024);
sunlight.shadow.camera.left = -100;
sunlight.shadow.camera.right = 100;
sunlight.shadow.camera.top = 100;
sunlight.shadow.camera.bottom = -100;

scene.add(sunlight);

// MATERIALS
const materials = {
  road: new THREE.MeshStandardMaterial({ color: 0x34383c, roughness: 0.95 }),
  pavement: new THREE.MeshStandardMaterial({ color: 0x9b9b91 }),
  grass: new THREE.MeshStandardMaterial({ color: 0x477443 }),
  white: new THREE.MeshStandardMaterial({ color: 0xe8e5d8 }),
  glass: new THREE.MeshStandardMaterial({
    color: 0x557c91,
    metalness: 0.35,
    roughness: 0.25
  }),
  dark: new THREE.MeshStandardMaterial({ color: 0x202b35 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xd6a64d, metalness: 0.5 }),
  skin: new THREE.MeshStandardMaterial({ color: 0x8b5434 }),
  shirt: new THREE.MeshStandardMaterial({ color: 0x243c5b }),
  trousers: new THREE.MeshStandardMaterial({ color: 0x252a32 }),
  shoes: new THREE.MeshStandardMaterial({ color: 0x111111 })
};

// BASIC OBJECT CREATOR
function box(parent, x, y, z, w, h, d, material) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    material
  );

  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);

  return mesh;
}

// GROUND
box(
  scene,
  0,
  -0.25,
  0,
  420,
  0.5,
  420,
  materials.grass
);

// ROADS
function createRoad(x, z, width, depth) {
  box(
    scene,
    x,
    0.015,
    z,
    width,
    0.08,
    depth,
    materials.road
  );

  const horizontal = width > depth;

  const length = horizontal ? width : depth;

  for (let i = -length / 2 + 4; i < length / 2; i += 9) {
    if (horizontal) {
      box(scene, x + i, 0.07, z, 4, 0.015, 0.16, materials.white);
    } else {
      box(scene, x, 0.07, z + i, 0.16, 0.015, 4, materials.white);
    }
  }
}

// CITY STREET GRID
for (let i = -180; i <= 180; i += 60) {
  createRoad(i, 0, 13, 420);
  createRoad(0, i, 420, 13);
}

// PAVEMENTS
for (let i = -180; i <= 180; i += 60) {
  box(scene, i + 9, 0.08, 0, 4, 0.15, 420, materials.pavement);
  box(scene, i - 9, 0.08, 0, 4, 0.15, 420, materials.pavement);

  box(scene, 0, 0.08, i + 9, 420, 0.15, 4, materials.pavement);
  box(scene, 0, 0.08, i - 9, 420, 0.15, 4, materials.pavement);
}

// BUILDINGS
const buildingColors = [
  0xd8c9a9,
  0xb9c4ca,
  0xd9d8ce,
  0xc18d69,
  0xa8b8ae,
  0xd5c4b5,
  0x929fae
];

function createBuilding(x, z, width, depth, floors) {
  const group = new THREE.Group();

  const height = floors * 3.5;

  const wall = new THREE.MeshStandardMaterial({
    color: buildingColors[
      Math.floor(Math.random() * buildingColors.length)
    ],
    roughness: 0.85
  });

  box(
    group,
    0,
    height / 2,
    0,
    width,
    height,
    depth,
    wall
  );

  // ROOF
  box(
    group,
    0,
    height + 0.2,
    0,
    width + 0.6,
    0.4,
    depth + 0.6,
    materials.dark
  );

  // WINDOWS
  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0x304e62,
    metalness: 0.3,
    roughness: 0.2
  });

  for (let floor = 0; floor < floors; floor++) {
    for (let j = -Math.floor(width / 3); j <= Math.floor(width / 3); j++) {
      const wx = j * 2.6;

      box(
        group,
        wx,
        1.8 + floor * 3.5,
        depth / 2 + 0.025,
        1.1,
        1.6,
        0.08,
        windowMaterial
      );
    }
  }

  // ENTRANCE
  box(
    group,
    0,
    1.25,
    depth / 2 + 0.06,
    1.5,
    2.5,
    0.15,
    materials.dark
  );

  group.position.set(x, 0, z);
  scene.add(group);
}

// GENERATE CITY BLOCKS
for (let x = -180; x < 180; x += 60) {
  for (let z = -180; z < 180; z += 60) {

    const positions = [
      [-17, -17],
      [17, -17],
      [-17, 17],
      [17, 17]
    ];

    positions.forEach(([ox, oz]) => {
      if (Math.random() > 0.12) {
        const width = 13 + Math.random() * 5;
        const depth = 13 + Math.random() * 5;
        const floors = 2 + Math.floor(Math.random() * 7);

        createBuilding(
          x + ox,
          z + oz,
          width,
          depth,
          floors
        );
      }
    });
  }
}

// TREES
function createTree(x, z) {
  const group = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.5, 3.5, 7),
    new THREE.MeshStandardMaterial({ color: 0x654027 })
  );

  trunk.position.y = 1.75;
  trunk.castShadow = true;
  group.add(trunk);

  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(2.4, 8, 7),
    new THREE.MeshStandardMaterial({ color: 0x28683a })
  );

  leaves.position.y = 4.5;
  leaves.castShadow = true;
  group.add(leaves);

  group.position.set(x, 0, z);
  scene.add(group);
}

for (let i = -180; i <= 180; i += 30) {
  createTree(i, 17);
  createTree(i, -17);
  createTree(17, i);
  createTree(-17, i);
}

// STREET LIGHTS
function createStreetLight(x, z) {
  const group = new THREE.Group();

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.13, 6, 8),
    materials.dark
  );

  pole.position.y = 3;
  group.add(pole);

  const arm = box(group, 0.7, 5.8, 0, 1.4, 0.12, 0.12, materials.dark);

  const lamp = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.18, 0.5),
    new THREE.MeshStandardMaterial({
      color: 0xffe8b0,
      emissive: 0xffc56c,
      emissiveIntensity: 1
    })
  );

  lamp.position.set(1.3, 5.7, 0);
  group.add(lamp);

  group.position.set(x, 0, z);
  scene.add(group);
}

for (let i = -180; i <= 180; i += 60) {
  createStreetLight(i, 13);
  createStreetLight(i, -13);
}


 // =====================================
 // ORVEX CITY - HUMAN PLAYER CHARACTER
 // =====================================

const player = new THREE.Group();

const skinMaterial = new THREE.MeshStandardMaterial({
  color: 0x713f29,
  roughness: 0.72
});

const shirtMaterial = new THREE.MeshStandardMaterial({
  color: 0x171b24,
  roughness: 0.85
});

const pantsMaterial = new THREE.MeshStandardMaterial({
  color: 0x252b35,
  roughness: 0.9
});

const shoeMaterial = new THREE.MeshStandardMaterial({
  color: 0x090909,
  roughness: 0.8
});

const hairMaterial = new THREE.MeshStandardMaterial({
  color: 0x100d0b,
  roughness: 0.95
});

const detailMaterial = new THREE.MeshStandardMaterial({
  color: 0xb5b5b5,
  metalness: 0.5
});

function humanMesh(geometry, material, x, y, z) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  player.add(mesh);
  return mesh;
}

// BODY
const torso = humanMesh(
  new THREE.CapsuleGeometry(0.43, 0.65, 6, 12),
  shirtMaterial,
  0, 1.85, 0
);

torso.scale.set(1, 1, 0.72);

// NECK
humanMesh(
  new THREE.CylinderGeometry(0.13, 0.16, 0.24, 12),
  skinMaterial,
  0, 2.43, 0
);

// HEAD
const headGroup = new THREE.Group();
player.add(headGroup);

const face = new THREE.Mesh(
  new THREE.SphereGeometry(0.3, 24, 20),
  skinMaterial
);

face.scale.set(0.88, 1.12, 0.9);
face.position.y = 2.77;
face.castShadow = true;
headGroup.add(face);

// HAIR
const hair = new THREE.Mesh(
  new THREE.SphereGeometry(0.305, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.48),
  hairMaterial
);

hair.position.set(0, 2.88, 0);
headGroup.add(hair);

// EARS
for (const side of [-1, 1]) {
  const ear = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 12, 10),
    skinMaterial
  );

  ear.position.set(side * 0.27, 2.75, 0);
  ear.scale.set(0.55, 1, 0.7);
  headGroup.add(ear);
}

// EYES
const eyeMaterial = new THREE.MeshStandardMaterial({
  color: 0x17100c
});

for (const side of [-1, 1]) {
  const eye = new THREE.Mesh(
    new THREE.SphereGeometry(0.035, 12, 10),
    eyeMaterial
  );

  eye.position.set(side * 0.105, 2.8, 0.255);
  eye.scale.set(1.2, 0.7, 0.7);
  headGroup.add(eye);
}

// NOSE
humanMesh(
  new THREE.SphereGeometry(0.065, 12, 10),
  skinMaterial,
  0, 2.73, 0.29
);

// MOUTH
humanMesh(
  new THREE.BoxGeometry(0.09, 0.018, 0.015),
  hairMaterial,
  0, 2.64, 0.274
);

// HAIRLINE / SHORT HAIRSTYLE
const topHair = new THREE.Mesh(
  new THREE.SphereGeometry(0.19, 16, 8),
  hairMaterial
);

topHair.scale.set(1.25, 0.35, 1);
topHair.position.set(0, 3.02, 0);
headGroup.add(topHair);

// SHOULDERS
for (const side of [-1, 1]) {
  humanMesh(
    new THREE.SphereGeometry(0.22, 16, 12),
    shirtMaterial,
    side * 0.42, 2.13, 0
  );
}

// ARMS
const leftArm = new THREE.Group();
const rightArm = new THREE.Group();

player.add(leftArm, rightArm);

function createArm(group, side) {
  group.position.set(side * 0.48, 2.1, 0);

  const upper = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.105, 0.42, 5, 10),
    shirtMaterial
  );

  upper.position.y = -0.3;
  upper.rotation.z = side * -0.08;
  upper.castShadow = true;
  group.add(upper);

  const forearm = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.085, 0.35, 5, 10),
    skinMaterial
  );

  forearm.position.y = -0.72;
  forearm.castShadow = true;
  group.add(forearm);

  const hand = new THREE.Mesh(
    new THREE.SphereGeometry(0.105, 12, 10),
    skinMaterial
  );

  hand.position.y = -0.96;
  group.add(hand);
}

createArm(leftArm, -1);
createArm(rightArm, 1);

// LEGS
const leftLeg = new THREE.Group();
const rightLeg = new THREE.Group();

player.add(leftLeg, rightLeg);

function createLeg(group, side) {
  group.position.set(side * 0.2, 1.05, 0);

  const thigh = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.14, 0.45, 5, 12),
    pantsMaterial
  );

  thigh.position.y = -0.3;
  thigh.castShadow = true;
  group.add(thigh);

  const lower = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.105, 0.4, 5, 12),
    pantsMaterial
  );

  lower.position.y = -0.76;
  lower.castShadow = true;
  group.add(lower);

  const shoe = new THREE.Mesh(
    new THREE.BoxGeometry(0.27, 0.15, 0.43),
    shoeMaterial
  );

  shoe.position.set(0, -1.02, 0.09);
  shoe.castShadow = true;
  group.add(shoe);

  const sole = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.035, 0.44),
    detailMaterial
  );

  sole.position.set(0, -1.105, 0.09);
  group.add(sole);
}

createLeg(leftLeg, -1);
createLeg(rightLeg, 1);

// CHARACTER POSITION
player.position.set(0, 0, 0);
scene.add(player);

// ANIMATION REFERENCES
const leftArmMesh = leftArm;
const rightArmMesh = rightArm;
  

// PLAYER MOVEMENT
const keys = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  run: false
};

let verticalVelocity = 0;
let grounded = true;
let moving = false;

function bindButton(id, key) {
  const button = document.getElementById(id);

  button.addEventListener("pointerdown", e => {
    e.preventDefault();
    keys[key] = true;
    button.setPointerCapture(e.pointerId);
  });

  const release = e => {
    keys[key] = false;
  };

  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
}

bindButton("forward", "forward");
bindButton("backward", "backward");
bindButton("left", "left");
bindButton("right", "right");
bindButton("run", "run");

// KEYBOARD CONTROLS
window.addEventListener("keydown", e => {
  if (e.code === "KeyW" || e.code === "ArrowUp") keys.forward = true;
  if (e.code === "KeyS" || e.code === "ArrowDown") keys.backward = true;
  if (e.code === "KeyA" || e.code === "ArrowLeft") keys.left = true;
  if (e.code === "KeyD" || e.code === "ArrowRight") keys.right = true;
  if (e.code === "ShiftLeft") keys.run = true;

  if (e.code === "Space" && grounded) {
    verticalVelocity = 7;
    grounded = false;
  }
});

window.addEventListener("keyup", e => {
  if (e.code === "KeyW" || e.code === "ArrowUp") keys.forward = false;
  if (e.code === "KeyS" || e.code === "ArrowDown") keys.backward = false;
  if (e.code === "KeyA" || e.code === "ArrowLeft") keys.left = false;
  if (e.code === "KeyD" || e.code === "ArrowRight") keys.right = false;
  if (e.code === "ShiftLeft") keys.run = false;
});

// MOBILE JUMP
document.getElementById("jump").addEventListener("pointerdown", e => {
  e.preventDefault();

  if (grounded) {
    verticalVelocity = 7;
    grounded = false;
  }
});

// CAMERA
const cameraOffset = new THREE.Vector3(0, 5.5, 9);
const lookOffset = new THREE.Vector3(0, 2, 0);

const clock = new THREE.Clock();

let walkTime = 0;

// GAME LOOP
function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);

  moving = false;

  let moveX = 0;
  let moveZ = 0;

  if (keys.forward) moveZ -= 1;
  if (keys.backward) moveZ += 1;
  if (keys.left) moveX -= 1;
  if (keys.right) moveX += 1;

  const length = Math.sqrt(moveX * moveX + moveZ * moveZ);

  if (length > 0) {
    moveX /= length;
    moveZ /= length;

    const speed = keys.run ? 12 : 6;

    player.position.x += moveX * speed * delta;
    player.position.z += moveZ * speed * delta;

    player.rotation.y = Math.atan2(moveX, moveZ);

    moving = true;
    walkTime += delta * (keys.run ? 12 : 8);

    leftLeg.rotation.x = Math.sin(walkTime) * 0.55;
    rightLeg.rotation.x = -Math.sin(walkTime) * 0.55;
    leftArm.rotation.x = -Math.sin(walkTime) * 0.4;
    rightArm.rotation.x = Math.sin(walkTime) * 0.4;
  } else {
    leftLeg.rotation.x = THREE.MathUtils.damp(leftLeg.rotation.x, 0, 10, delta);
    rightLeg.rotation.x = THREE.MathUtils.damp(rightLeg.rotation.x, 0, 10, delta);
    leftArm.rotation.x = THREE.MathUtils.damp(leftArm.rotation.x, 0, 10, delta);
    rightArm.rotation.x = THREE.MathUtils.damp(rightArm.rotation.x, 0, 10, delta);
  }

  // CITY BOUNDARIES
  player.position.x = THREE.MathUtils.clamp(player.position.x, -195, 195);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -195, 195);

  // JUMP PHYSICS
  verticalVelocity -= 18 * delta;
  player.position.y += verticalVelocity * delta;

  if (player.position.y <= 0) {
    player.position.y = 0;
    verticalVelocity = 0;
    grounded = true;
  }

  // THIRD PERSON CAMERA
  const desiredCamera = cameraOffset.clone()
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y)
    .add(player.position);

  camera.position.lerp(desiredCamera, 1 - Math.exp(-5 * delta));

  const target = player.position.clone().add(lookOffset);

  camera.lookAt(target);

  // HUD LOCATION
  const district = Math.floor(
    (Math.abs(player.position.x) + Math.abs(player.position.z)) / 60
  );

  document.getElementById("locationName").textContent =
    district < 2 ? "CENTRAL DISTRICT" :
    district < 5 ? "ORVEX DISTRICT" :
    "CITY OUTSKIRTS";

  renderer.render(scene, camera);
}

// RESIZE
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
});

// LOADING
loadingProgress.style.width = "100%";
loadingText.textContent = "Entering ORVEX CITY...";

setTimeout(() => {
  loadingScreen.style.display = "none";
  animate();
}, 1200);

} catch (error) {
  console.error("ORVEX CITY ERROR:", error);
  errorMessage.hidden = false;
  errorMessage.textContent =
    "ORVEX CITY could not start: " + error.message +
    ". Check your internet connection and reload.";
}
