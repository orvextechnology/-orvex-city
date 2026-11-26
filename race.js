
import * as THREE from "three";

const game = document.getElementById("game");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87b9dc);
scene.fog = new THREE.Fog(0x87b9dc, 80, 350);

const camera = new THREE.PerspectiveCamera(
  65, window.innerWidth / window.innerHeight, 0.1, 500
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
game.prepend(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x555566, 2));

const sun = new THREE.DirectionalLight(0xffffff, 2.5);
sun.position.set(30, 60, 20);
sun.castShadow = true;
scene.add(sun);

function material(color, roughness = 0.8) {
  return new THREE.MeshStandardMaterial({ color, roughness });
}

const asphalt = material(0x292d32);
const grass = material(0x397b42);
const white = material(0xffffff);
const black = material(0x111111);
const red = material(0xd90020);
const metal = new THREE.MeshStandardMaterial({
  color: 0x777e88, metalness: 0.8, roughness: 0.25
});

// GROUND
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(500, 500),
  grass
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.15;
scene.add(ground);

// RACE TRACK
const track = new THREE.Mesh(
  new THREE.PlaneGeometry(24, 400),
  asphalt
);
track.rotation.x = -Math.PI / 2;
track.position.y = 0;
scene.add(track);

// ROAD MARKINGS
for (let z = -190; z < 200; z += 12) {
  const line = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.025, 6),
    white
  );
  line.position.set(0, 0.03, z);
  scene.add(line);
}

// TRACK EDGES
for (const x of [-12, 12]) {
  const edge = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.3, 400),
    red
  );
  edge.position.set(x, 0.12, 0);
  scene.add(edge);
}

// CREATE MOTORCYCLE
function createBike(color) {
  const bike = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.55, 1.5),
    material(color, 0.3)
  );
  body.position.y = 0.95;
  bike.add(body);

  const tank = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 16, 12),
    material(color, 0.3)
  );
  tank.scale.set(0.8, 0.7, 1.2);
  tank.position.set(0, 1.3, 0.05);
  bike.add(tank);

  function wheel(z) {
    const tire = new THREE.Mesh(
      new THREE.TorusGeometry(0.43, 0.12, 12, 24),
      black
    );
    tire.rotation.y = Math.PI / 2;
    tire.position.set(0, 0.48, z);
    bike.add(tire);

    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.13, 0.2, 16),
      metal
    );
    hub.rotation.z = Math.PI / 2;
    hub.position.copy(tire.position);
    bike.add(hub);
  }

  wheel(-0.85);
  wheel(0.85);

  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(0.48, 0.18, 0.65),
    black
  );
  seat.position.set(0, 1.35, -0.45);
  bike.add(seat);

  const handle = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.09, 0.09),
    metal
  );
  handle.position.set(0, 1.55, 0.65);
  bike.add(handle);

  const rider = new THREE.Group();

  const torso = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.85, 0.4),
    black
  );
  torso.position.set(0, 1.95, -0.25);
  torso.rotation.x = -0.3;
  rider.add(torso);

  const helmet = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 20, 16),
    material(0xff2020, 0.2)
  );
  helmet.position.set(0, 2.48, 0.05);
  rider.add(helmet);

  bike.add(rider);

  bike.traverse(object => {
    if (object.isMesh) object.castShadow = true;
  });

  return bike;
}

// PLAYER BIKE
const player = createBike(0x0066ff);
player.position.set(0, 0, 8);
scene.add(player);

// RACING OPPONENTS
const opponents = [];
const opponentColors = [0xff2222, 0xffcc00, 0xeeeeee];

opponentColors.forEach((color, i) => {
  const bike = createBike(color);
  bike.position.set((i - 1) * 4, 0, -15 - i * 8);
  scene.add(bike);

  opponents.push({
    bike,
    speed: 17 + Math.random() * 5
  });
});

// CONTROLS
const keys = {
  left: false,
  right: false,
  accelerate: false,
  brake: false,
  nitro: false
};

function bind(id, key) {
  const button = document.getElementById(id);
  if (!button) return;

  button.addEventListener("pointerdown", event => {
    event.preventDefault();
    keys[key] = true;
    button.setPointerCapture(event.pointerId);
  });

  const release = () => keys[key] = false;
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
}

bind("left", "left");
bind("right", "right");
bind("accelerate", "accelerate");
bind("brake", "brake");
bind("nitro", "nitro");

window.addEventListener("keydown", event => {
  if (["ArrowLeft", "KeyA"].includes(event.code)) keys.left = true;
  if (["ArrowRight", "KeyD"].includes(event.code)) keys.right = true;
  if (["ArrowUp", "KeyW"].includes(event.code)) keys.accelerate = true;
  if (["ArrowDown", "KeyS"].includes(event.code)) keys.brake = true;
  if (event.code === "ShiftLeft") keys.nitro = true;
});

window.addEventListener("keyup", event => {
  if (["ArrowLeft", "KeyA"].includes(event.code)) keys.left = false;
  if (["ArrowRight", "KeyD"].includes(event.code)) keys.right = false;
  if (["ArrowUp", "KeyW"].includes(event.code)) keys.accelerate = false;
  if (["ArrowDown", "KeyS"].includes(event.code)) keys.brake = false;
  if (event.code === "ShiftLeft") keys.nitro = false;
});

// RACE STATE
let speed = 0;
let distance = 0;
let raceTime = 0;
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.04);
  raceTime += dt;

  if (keys.accelerate) speed += 25 * dt;
  else speed -= 9 * dt;

  if (keys.brake) speed -= 35 * dt;
  if (keys.nitro) speed += 35 * dt;

  speed = THREE.MathUtils.clamp(speed, 0, 65);

  const steering = Number(keys.right) - Number(keys.left);
  player.position.x += steering * (3 + speed * 0.08) * dt;
  player.position.x = THREE.MathUtils.clamp(player.position.x, -9, 9);

  player.position.z -= speed * dt;
  distance += speed * dt;

  player.rotation.z = THREE.MathUtils.lerp(
    player.rotation.z, -steering * 0.22, 0.12
  );

  // Opponents
  opponents.forEach(opponent => {
    opponent.bike.position.z += opponent.speed * dt;
    if (opponent.bike.position.z > player.position.z + 20) {
      opponent.bike.position.z = player.position.z - 180;
    }
  });

  // FOLLOW CAMERA
  const targetCamera = new THREE.Vector3(
    player.position.x,
    player.position.y + 5,
    player.position.z + 10
  );

  camera.position.lerp(targetCamera, 1 - Math.exp(-5 * dt));
  camera.lookAt(
    player.position.x,
    player.position.y + 1.5,
    player.position.z - 4
  );

  const speedDisplay = document.getElementById("speedValue");
  const distanceDisplay = document.getElementById("distanceValue");

  if (speedDisplay) speedDisplay.textContent = Math.round(speed * 3.6);
  if (distanceDisplay) distanceDisplay.textContent =
    (distance / 1000).toFixed(2) + " km";

  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

