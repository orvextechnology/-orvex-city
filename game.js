
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// ========================================
// ORVEX CITY - OPEN WORLD GAME ENGINE
// ORVEX TECHNOLOGIES
// ========================================

const game = document.getElementById("game");
const loadingScreen = document.getElementById("loadingScreen");
const loadingProgress = document.getElementById("loadingProgress");
const loadingText = document.getElementById("loadingText");
const errorMessage = document.getElementById("errorMessage");

try {
  if (!game) throw new Error("Game container not found");

  // SCENE
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9bbbd2);
  scene.fog = new THREE.Fog(0x9bbbd2, 100, 420);

  // CAMERA
  const camera = new THREE.PerspectiveCamera(
    65, window.innerWidth / window.innerHeight, 0.1, 900
  );

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
  renderer.toneMappingExposure = 1.2;
  game.prepend(renderer.domElement);

  // LIGHTING
  scene.add(new THREE.HemisphereLight(0xc8e4ff, 0x594632, 2));

  const sun = new THREE.DirectionalLight(0xffe0b4, 3);
  sun.position.set(70, 100, 50);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -100;
  sun.shadow.camera.right = 100;
  sun.shadow.camera.top = 100;
  sun.shadow.camera.bottom = -100;
  scene.add(sun);

  // MATERIALS
  const mat = (color, roughness = 0.85) =>
    new THREE.MeshStandardMaterial({ color, roughness });

  const materials = {
    grass: mat(0x477443),
    road: mat(0x30343a),
    pavement: mat(0xa5a39c),
    line: mat(0xe8e3d3),
    dark: mat(0x20232a),
    glass: new THREE.MeshStandardMaterial({
      color: 0x456a80, metalness: 0.4, roughness: 0.22
    })
  };

  // OBJECT CREATOR
  function box(parent, x, y, z, w, h, d, material) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d), material
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  // GROUND
  box(scene, 0, -0.3, 0, 420, 0.5, 420, materials.grass);

  // ROADS
  function createRoad(x, z, w, d) {
    box(scene, x, 0.01, z, w, 0.08, d, materials.road);

    if (w > d) {
      for (let i = -w / 2 + 5; i < w / 2; i += 10)
        box(scene, x + i, 0.07, z, 4, 0.02, 0.15, materials.line);
    } else {
      for (let i = -d / 2 + 5; i < d / 2; i += 10)
        box(scene, x, 0.07, z + i, 0.15, 0.02, 4, materials.line);
    }
  }

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
    0xc8b79d, 0xb5c2c8, 0xd6d2c5,
    0xb98464, 0x9daea4, 0x9da9b8
  ];

  function createBuilding(x, z) {
    const group = new THREE.Group();

    const width = 12 + Math.random() * 6;
    const depth = 12 + Math.random() * 6;
    const floors = 2 + Math.floor(Math.random() * 6);
    const height = floors * 3.5;

    const wall = mat(
      buildingColors[Math.floor(Math.random() * buildingColors.length)]
    );

    box(group, 0, height / 2, 0, width, height, depth, wall);
    box(group, 0, height + 0.2, 0, width + 0.5, 0.4, depth + 0.5, materials.dark);

    const windowMat = materials.glass;

    for (let floor = 0; floor < floors; floor++) {
      for (let j = -2; j <= 2; j++) {
        box(
          group, j * 2.4, 1.8 + floor * 3.5,
          depth / 2 + 0.04, 1.1, 1.5, 0.08, windowMat
        );
      }
    }

    box(group, 0, 1.1, depth / 2 + 0.1, 1.5, 2.2, 0.15, materials.dark);

    group.position.set(x, 0, z);
    scene.add(group);
  }

  for (let x = -180; x < 180; x += 60) {
    for (let z = -180; z < 180; z += 60) {
      for (const [ox, oz] of [
        [-17, -17], [17, -17], [-17, 17], [17, 17]
      ]) {
        if (Math.random() > 0.12)
          createBuilding(x + ox, z + oz);
      }
    }
  }

  // TREES
  function createTree(x, z) {
    const group = new THREE.Group();

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.45, 3.5, 8),
      mat(0x68432b)
    );
    trunk.position.y = 1.75;
    group.add(trunk);

    const leaves = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 10, 9),
      mat(0x28663a)
    );
    leaves.position.y = 4.3;
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

  // ========================================
  // HUMAN CHARACTER CREATOR
  // ========================================

  function createHuman(options = {}) {
    const human = new THREE.Group();

    const skin = mat(options.skin || 0x713f29);
    const shirt = mat(options.shirt || 0x202b3b);
    const trousers = mat(options.pants || 0x252a33);
    const shoes = mat(0x101010);
    const hair = mat(0x100d0b);

    function part(geometry, material, x, y, z, parent = human) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      parent.add(mesh);
      return mesh;
    }

    // TORSO
    part(new THREE.CapsuleGeometry(0.38, 0.62, 6, 12),
      shirt, 0, 1.8, 0).scale.set(1, 1, 0.75);

    // NECK
    part(new THREE.CylinderGeometry(0.12, 0.15, 0.2, 12),
      skin, 0, 2.34, 0);

    // HEAD
    const head = new THREE.Group();
    human.add(head);

    part(new THREE.SphereGeometry(0.29, 24, 20),
      skin, 0, 2.68, 0, head);

    part(new THREE.SphereGeometry(0.295, 20, 12),
      hair, 0, 2.79, 0, head);

    // EYES
    const eyes = mat(0x17100c);
    for (const side of [-1, 1]) {
      part(new THREE.SphereGeometry(0.035, 12, 10),
        eyes, side * 0.1, 2.7, 0.25, head);
    }

    // ARMS
    const arms = [];

    for (const side of [-1, 1]) {
      const arm = new THREE.Group();
      arm.position.set(side * 0.44, 2.1, 0);
      human.add(arm);
      arms.push(arm);

      part(new THREE.CapsuleGeometry(0.105, 0.4, 5, 10),
        shirt, 0, -0.28, 0, arm);

      part(new THREE.CapsuleGeometry(0.085, 0.35, 5, 10),
        skin, 0, -0.7, 0, arm);

      part(new THREE.SphereGeometry(0.09, 12, 10),
        skin, 0, -0.95, 0, arm);
    }

    // LEGS
    const legs = [];

    for (const side of [-1, 1]) {
      const leg = new THREE.Group();
      leg.position.set(side * 0.19, 1.05, 0);
      human.add(leg);
      legs.push(leg);

      part(new THREE.CapsuleGeometry(0.13, 0.42, 5, 10),
        trousers, 0, -0.28, 0, leg);

      part(new THREE.CapsuleGeometry(0.1, 0.4, 5, 10),
        trousers, 0, -0.73, 0, leg);

      part(new THREE.BoxGeometry(0.25, 0.14, 0.4),
        shoes, 0, -1, 0.1, leg);
    }

    return { group: human, arms, legs };
  }

  
  // ========================================
  // REAL GTA-STYLE PLAYER CHARACTER
  // ========================================

  const player = new THREE.Group();
  player.position.set(0, 0, 0);
  scene.add(player);

  const characterLoader = new GLTFLoader();

  let characterMixer = null;
  let characterActions = {};
  let currentCharacterAction = null;
  let characterReady = false;

  characterLoader.load(
    "./The_Gangster.glb",

    function (gltf) {
      const character = gltf.scene;

      character.traverse(object => {
        if (object.isMesh) {
          object.castShadow = true;
          object.receiveShadow = true;
        }
      });

      // Fit character to game world
      const bounds = new THREE.Box3().setFromObject(character);
      const size = bounds.getSize(new THREE.Vector3());

      const targetHeight = 1.8;
      const scale = targetHeight / size.y;

      character.scale.setScalar(scale);

      // Position feet on ground
      const scaledBounds = new THREE.Box3().setFromObject(character);
      const center = scaledBounds.getCenter(new THREE.Vector3());

      character.position.x -= center.x;
      character.position.y -= scaledBounds.min.y;
      character.position.z -= center.z;

      player.add(character);

      // Load real animations
      characterMixer = new THREE.AnimationMixer(character);

      gltf.animations.forEach(clip => {
        const name = clip.name.toLowerCase();

        if (name.includes("idle")) {
          characterActions.idle =
            characterMixer.clipAction(clip);
        }

        if (name.includes("walk")) {
          characterActions.walk =
            characterMixer.clipAction(clip);
        }

        if (name.includes("run")) {
          characterActions.run =
            characterMixer.clipAction(clip);
        }
      });

      // Start idle animation
      if (characterActions.idle) {
        currentCharacterAction = characterActions.idle;
        currentCharacterAction.play();
      }

      characterReady = true;

      console.log("ORVEX: Real character loaded!");
      console.log("Animations:", Object.keys(characterActions));
    },

    undefined,

    function (error) {
      console.error("Character loading failed:", error);
    }
  );

  // Switch character animation
  function playCharacterAnimation(name) {
    if (!characterReady) return;

    const nextAction = characterActions[name];

    if (!nextAction || nextAction === currentCharacterAction) return;

    nextAction.reset();
    nextAction.play();

    if (currentCharacterAction) {
      currentCharacterAction.crossFadeTo(nextAction, 0.2, false);
    }

    currentCharacterAction = nextAction;
}


  // PEDESTRIANS
  const pedestrians = [];
  const shirtColors = [
    0x293d60, 0x803e32, 0x376044,
    0x343434, 0x8a754d, 0x5c3d72
  ];

  for (let i = 0; i < 16; i++) {
    const npc = createHuman({
      skin: [0x713f29, 0x8b5434, 0x9b6947][i % 3],
      shirt: shirtColors[i % shirtColors.length],
      pants: [0x242832, 0x353535, 0x3c4148][i % 3]
    });

    const angle = Math.random() * Math.PI * 2;
    const radius = 22 + Math.random() * 65;

    npc.group.position.set(
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    );

    npc.group.scale.setScalar(0.9 + Math.random() * 0.15);
    scene.add(npc.group);

    pedestrians.push({
      ...npc,
      direction: Math.random() * Math.PI * 2,
      speed: 1 + Math.random() * 1.1,
      phase: Math.random() * 10
    });
  }

  // PLAYER CONTROLS
  const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false
  };

  function bindButton(id, key) {
    const button = document.getElementById(id);
    if (!button) return;

    button.addEventListener("pointerdown", e => {
      e.preventDefault();
      keys[key] = true;
      button.setPointerCapture(e.pointerId);
    });

    const release = () => keys[key] = false;

    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
  }

  bindButton("forward", "forward");
  bindButton("backward", "backward");
  bindButton("left", "left");
  bindButton("right", "right");
  bindButton("run", "run");

  window.addEventListener("keydown", e => {
    if (["KeyW", "ArrowUp"].includes(e.code)) keys.forward = true;
    if (["KeyS", "ArrowDown"].includes(e.code)) keys.backward = true;
    if (["KeyA", "ArrowLeft"].includes(e.code)) keys.left = true;
    if (["KeyD", "ArrowRight"].includes(e.code)) keys.right = true;
    if (e.code === "ShiftLeft") keys.run = true;

    if (e.code === "Space" && grounded) {
      verticalVelocity = 7;
      grounded = false;
    }
  });

  window.addEventListener("keyup", e => {
    if (["KeyW", "ArrowUp"].includes(e.code)) keys.forward = false;
    if (["KeyS", "ArrowDown"].includes(e.code)) keys.backward = false;
    if (["KeyA", "ArrowLeft"].includes(e.code)) keys.left = false;
    if (["KeyD", "ArrowRight"].includes(e.code)) keys.right = false;
    if (e.code === "ShiftLeft") keys.run = false;
  });

  let verticalVelocity = 0;
  let grounded = true;

  const jumpButton = document.getElementById("jump");
  if (jumpButton) {
    jumpButton.addEventListener("pointerdown", e => {
      e.preventDefault();
      if (grounded) {
        verticalVelocity = 7;
        grounded = false;
      }
    });
  }

  // CAMERA
  const cameraOffset = new THREE.Vector3(0, 5.5, 9);
  const lookOffset = new THREE.Vector3(0, 2, 0);

  const clock = new THREE.Clock();
  let walkTime = 0;

  // GAME LOOP
  function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.05);

    let moveX = 0;
    let moveZ = 0;

    if (keys.forward) moveZ -= 1;
    if (keys.backward) moveZ += 1;
    if (keys.left) moveX -= 1;
    if (keys.right) moveX += 1;

    const moving = Math.hypot(moveX, moveZ) > 0;

    if (moving) {
      const length = Math.hypot(moveX, moveZ);
      moveX /= length;
      moveZ /= length;

      const speed = keys.run ? 11 : 5.5;

      player.position.x += moveX * speed * delta;
      player.position.z += moveZ * speed * delta;

      player.rotation.y = Math.atan2(moveX, moveZ);

      walkTime += delta * (keys.run ? 12 : 8);
    }

    
    // REAL CHARACTER ANIMATIONS
    if (characterMixer) {
      characterMixer.update(delta);

      if (!moving) {
        playCharacterAnimation("idle");
      } else if (keys.run) {
        playCharacterAnimation("run");
      } else {
        playCharacterAnimation("walk");
      }
    }
    
    // JUMP
    verticalVelocity -= 18 * delta;
    player.position.y += verticalVelocity * delta;

    if (player.position.y <= 0) {
      player.position.y = 0;
      verticalVelocity = 0;
      grounded = true;
    }

    // PEDESTRIAN MOVEMENT
    pedestrians.forEach(npc => {
      npc.phase += delta * 7;

      npc.group.position.x +=
        Math.sin(npc.direction) * npc.speed * delta;

      npc.group.position.z +=
        Math.cos(npc.direction) * npc.speed * delta;

      if (Math.abs(npc.group.position.x) > 90 ||
          Math.abs(npc.group.position.z) > 90) {
        npc.direction += Math.PI;
      }

      npc.group.rotation.y = npc.direction;

      npc.legs[0].rotation.x = Math.sin(npc.phase) * 0.4;
      npc.legs[1].rotation.x = -Math.sin(npc.phase) * 0.4;
      npc.arms[0].rotation.x = -Math.sin(npc.phase) * 0.3;
      npc.arms[1].rotation.x = Math.sin(npc.phase) * 0.3;
    });

    // CITY BOUNDARIES
    player.position.x = THREE.MathUtils.clamp(player.position.x, -195, 195);
    player.position.z = THREE.MathUtils.clamp(player.position.z, -195, 195);

    // CAMERA FOLLOW
    const desiredCamera = cameraOffset.clone()
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y)
      .add(player.position);

    camera.position.lerp(
      desiredCamera,
      1 - Math.exp(-5 * delta)
    );

    camera.lookAt(player.position.clone().add(lookOffset));

    // LOCATION HUD
    const location = document.getElementById("locationName");
    if (location) {
      const district = Math.floor(
        (Math.abs(player.position.x) +
         Math.abs(player.position.z)) / 60
      );

      location.textContent = district < 2
        ? "CENTRAL DISTRICT"
        : district < 5
        ? "ORVEX DISTRICT"
        : "CITY OUTSKIRTS";
    }

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
  if (loadingProgress) loadingProgress.style.width = "100%";
  if (loadingText) loadingText.textContent = "Entering ORVEX CITY...";

  setTimeout(() => {
    if (loadingScreen) loadingScreen.style.display = "none";
    animate();
  }, 1000);

} catch (error) {
  console.error("ORVEX CITY ERROR:", error);

  if (errorMessage) {
    errorMessage.hidden = false;
    errorMessage.textContent =
      "ORVEX CITY could not start: " + error.message;
  }
}
           
