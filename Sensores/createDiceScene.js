import * as THREE from 'three';
import * as CANNON from 'cannon-es';

const TRAY_W = 4.4;
const TRAY_D = 7.0;
const WALL_H = 4.4;
const WALL_T = 0.42;
const DIE_SIZE = 0.82;
const INNER_X = TRAY_W / 2 - DIE_SIZE / 2 - 0.1;
const INNER_Z = TRAY_D / 2 - DIE_SIZE / 2 - 0.1;
const INNER_Y = WALL_H - DIE_SIZE / 2 - 0.1;

function createRenderer(gl) {
  const width = gl.drawingBufferWidth;
  const height = gl.drawingBufferHeight;
  const canvas = {
    width,
    height,
    style: {},
    clientWidth: width,
    clientHeight: height,
    addEventListener: () => {},
    removeEventListener: () => {},
    getContext: () => gl,
    getRootNode: () => canvas,
  };
  gl.canvas = canvas;

  if (typeof gl.getContextAttributes !== 'function') {
    gl.getContextAttributes = () => ({
      alpha: false,
      depth: true,
      stencil: false,
      antialias: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      powerPreference: 'default',
    });
  }

  const renderer = new THREE.WebGLRenderer({
    canvas,
    context: gl,
    antialias: false,
    alpha: false,
  });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.setClearColor(0x08140d, 1);
  if (renderer.debug) {
    renderer.debug.checkShaderErrors = false;
  }
  if (THREE.SRGBColorSpace) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  }
  return renderer;
}

function pipMesh(geo, mat, x, y, z) {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  return mesh;
}

function createDieMesh(bodyColor, pipColor) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(DIE_SIZE, DIE_SIZE, DIE_SIZE),
    new THREE.MeshStandardMaterial({
      color: bodyColor,
      roughness: 0.32,
      metalness: 0.08,
    }),
  );
  group.add(body);
  group.add(
    new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(DIE_SIZE, DIE_SIZE, DIE_SIZE)),
      new THREE.LineBasicMaterial({ color: 0x1a1a1a }),
    ),
  );

  const h = DIE_SIZE / 2 + 0.02;
  const d = DIE_SIZE * 0.22;
  const geo = new THREE.SphereGeometry(DIE_SIZE * 0.08, 12, 12);
  const mat = new THREE.MeshStandardMaterial({ color: pipColor, roughness: 0.45 });
  const add = (x, y, z) => group.add(pipMesh(geo, mat, x, y, z));

  add(0, h, 0);
  [-d, 0, d].forEach((z) => {
    add(-d, -h, z);
    add(d, -h, z);
  });
  add(-d, d, h);
  add(d, -d, h);
  add(-d, d, -h);
  add(d, d, -h);
  add(0, 0, -h);
  add(-d, -d, -h);
  add(d, -d, -h);
  add(h, d, d);
  add(h, 0, 0);
  add(h, -d, -d);
  add(-h, d, d);
  add(-h, d, -d);
  add(-h, -d, d);
  add(-h, -d, -d);

  return group;
}

function dieValue(body) {
  const localUp = body.quaternion.conjugate().vmult(new CANNON.Vec3(0, 1, 0));
  const ax = Math.abs(localUp.x);
  const ay = Math.abs(localUp.y);
  const az = Math.abs(localUp.z);
  if (ay >= ax && ay >= az) return localUp.y >= 0 ? 1 : 6;
  if (ax >= ay && ax >= az) return localUp.x >= 0 ? 3 : 4;
  return localUp.z >= 0 ? 2 : 5;
}

function addStaticBox(world, scene, material, { pos, size, color, opacity = 1, visible = true }) {
  const body = new CANNON.Body({
    mass: 0,
    material,
    shape: new CANNON.Box(new CANNON.Vec3(size[0] / 2, size[1] / 2, size[2] / 2)),
    position: new CANNON.Vec3(pos[0], pos[1], pos[2]),
  });
  world.addBody(body);

  if (!visible) return;
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(size[0], size[1], size[2]),
    new THREE.MeshStandardMaterial({
      color,
      transparent: opacity < 1,
      opacity,
      roughness: opacity < 1 ? 0.15 : 0.7,
      metalness: opacity < 1 ? 0.05 : 0.1,
    }),
  );
  mesh.position.set(pos[0], pos[1], pos[2]);
  scene.add(mesh);
}

function contain(body) {
  if (body.position.x > INNER_X) {
    body.position.x = INNER_X;
    body.velocity.x = -Math.abs(body.velocity.x) * 0.42;
  } else if (body.position.x < -INNER_X) {
    body.position.x = -INNER_X;
    body.velocity.x = Math.abs(body.velocity.x) * 0.42;
  }
  if (body.position.z > INNER_Z) {
    body.position.z = INNER_Z;
    body.velocity.z = -Math.abs(body.velocity.z) * 0.42;
  } else if (body.position.z < -INNER_Z) {
    body.position.z = -INNER_Z;
    body.velocity.z = Math.abs(body.velocity.z) * 0.42;
  }
  if (body.position.y > INNER_Y) {
    body.position.y = INNER_Y;
    body.velocity.y = -Math.abs(body.velocity.y) * 0.25;
  } else if (body.position.y < DIE_SIZE / 2) {
    body.position.y = DIE_SIZE / 2;
    if (body.velocity.y < 0) body.velocity.y *= -0.22;
  }
}

function shakeToImpulse(shake) {
  const sx = shake?.x ?? 0;
  const sy = shake?.y ?? 0;
  const sz = shake?.z ?? 0;
  let x = sx;
  let z = -sy;
  const len = Math.hypot(x, z);
  if (len < 0.2) {
    const angle = Math.random() * Math.PI * 2;
    return {
      x: Math.cos(angle),
      z: Math.sin(angle),
      power: 8,
      hop: 3.8,
    };
  }
  return {
    x: x / len,
    z: z / len,
    power: Math.min(13.5, 7.5 + len * 4.5),
    hop: 3.2 + Math.min(2.4, Math.abs(sz) * 1.4),
  };
}

export function startDiceScene(gl, { accelRef, onSettled, onRolling, onError }) {
  const renderer = createRenderer(gl);
  const scene = new THREE.Scene();

  const aspect = gl.drawingBufferWidth / Math.max(gl.drawingBufferHeight, 1);
  const camera = new THREE.PerspectiveCamera(aspect < 0.7 ? 46 : 40, aspect, 0.1, 80);
  camera.position.set(0, 11.4, 5.2);
  camera.lookAt(0, 0.15, 0.45);

  scene.add(new THREE.AmbientLight(0xffffff, 0.62));
  const key = new THREE.DirectionalLight(0xfff4e0, 1.15);
  key.position.set(4, 12, 6);
  scene.add(key);
  const fill = new THREE.PointLight(0x7dffb0, 0.5);
  fill.position.set(-4, 4, -3);
  scene.add(fill);

  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -24, 0) });
  world.allowSleep = true;
  world.broadphase = new CANNON.NaiveBroadphase();
  world.solver.iterations = 14;

  const wallMat = new CANNON.Material('wall');
  const diceMat = new CANNON.Material('dice');
  world.addContactMaterial(
    new CANNON.ContactMaterial(diceMat, wallMat, { restitution: 0.38, friction: 0.32 }),
  );
  world.addContactMaterial(
    new CANNON.ContactMaterial(diceMat, diceMat, { restitution: 0.28, friction: 0.42 }),
  );

  addStaticBox(world, scene, wallMat, {
    pos: [0, -0.22, 0],
    size: [TRAY_W + 1.15, 0.44, TRAY_D + 1.15],
    color: 0x3d2412,
  });
  const felt = new THREE.Mesh(
    new THREE.PlaneGeometry(TRAY_W - 0.06, TRAY_D - 0.06),
    new THREE.MeshStandardMaterial({ color: 0x1b7a3c, roughness: 0.92 }),
  );
  felt.rotation.x = -Math.PI / 2;
  felt.position.y = 0.01;
  scene.add(felt);

  addStaticBox(world, scene, wallMat, {
    pos: [-TRAY_W / 2 - WALL_T / 2, WALL_H / 2, 0],
    size: [WALL_T, WALL_H, TRAY_D + WALL_T * 2],
    color: 0x8ecfff,
    opacity: 0.28,
  });
  addStaticBox(world, scene, wallMat, {
    pos: [TRAY_W / 2 + WALL_T / 2, WALL_H / 2, 0],
    size: [WALL_T, WALL_H, TRAY_D + WALL_T * 2],
    color: 0x8ecfff,
    opacity: 0.28,
  });
  addStaticBox(world, scene, wallMat, {
    pos: [0, WALL_H / 2, -TRAY_D / 2 - WALL_T / 2],
    size: [TRAY_W, WALL_H, WALL_T],
    color: 0x8ecfff,
    opacity: 0.28,
  });
  addStaticBox(world, scene, wallMat, {
    pos: [0, WALL_H / 2, TRAY_D / 2 + WALL_T / 2],
    size: [TRAY_W, WALL_H, WALL_T],
    color: 0x8ecfff,
    opacity: 0.28,
  });
  addStaticBox(world, scene, wallMat, {
    pos: [0, WALL_H + 0.14, 0],
    size: [TRAY_W + 1.2, 0.28, TRAY_D + 1.2],
    color: 0x000000,
    visible: false,
  });

  const specs = [
    { color: 0xf6f1e6, pip: 0x161616, x: -0.7 },
    { color: 0xc62828, pip: 0xfff8f0, x: 0.7 },
  ];
  const dice = specs.map((spec) => {
    const mesh = createDieMesh(spec.color, spec.pip);
    scene.add(mesh);
    const body = new CANNON.Body({
      mass: 1.2,
      material: diceMat,
      shape: new CANNON.Box(new CANNON.Vec3(DIE_SIZE / 2, DIE_SIZE / 2, DIE_SIZE / 2)),
      position: new CANNON.Vec3(spec.x, 1.6, 0),
      angularDamping: 0.32,
      linearDamping: 0.16,
      allowSleep: true,
      sleepSpeedLimit: 0.22,
      sleepTimeLimit: 0.4,
    });
    world.addBody(body);
    return { mesh, body };
  });

  let rolling = false;
  let throwAt = 0;
  let lastSettle = '';
  let lastTime = Date.now();
  let raf = 0;
  let alive = true;
  let pushDir = { x: 0, z: 0 };
  let pushUntil = 0;

  const throwDice = (shake) => {
    rolling = true;
    throwAt = Date.now();
    lastSettle = '';
    onRolling?.();
    const impulse = shakeToImpulse(shake || accelRef?.current);
    pushDir = { x: impulse.x, z: impulse.z };
    pushUntil = throwAt + 380;
    dice.forEach(({ body }, i) => {
      body.wakeUp();
      contain(body);
      body.position.y = Math.min(Math.max(body.position.y, 0.85), 1.7);
      body.position.x = Math.max(-INNER_X, Math.min(INNER_X, body.position.x + (i === 0 ? -0.12 : 0.12)));
      body.velocity.set(
        impulse.x * impulse.power,
        impulse.hop,
        impulse.z * impulse.power,
      );
      body.angularVelocity.set(
        -impulse.z * 12 + (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 7,
        impulse.x * 12 + (Math.random() - 0.5) * 3,
      );
    });
  };

  throwDice({ x: 0.15, y: -0.35, z: 0 });

  const loop = () => {
    if (!alive) return;
    raf = requestAnimationFrame(loop);
    try {
      const now = Date.now();
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      world.gravity.set(0, -24, 0);
      world.step(1 / 90, delta, 6);

      if (now < pushUntil) {
        dice.forEach(({ body }) => {
          body.velocity.x += pushDir.x * 28 * delta;
          body.velocity.z += pushDir.z * 28 * delta;
        });
      }

      dice.forEach(({ mesh, body }) => {
        contain(body);
        mesh.position.set(body.position.x, body.position.y, body.position.z);
        mesh.quaternion.set(
          body.quaternion.x,
          body.quaternion.y,
          body.quaternion.z,
          body.quaternion.w,
        );
      });

      if (rolling && now - throwAt > 650) {
        const stopped = dice.every(
          ({ body }) =>
            body.velocity.lengthSquared() < 0.05 && body.angularVelocity.lengthSquared() < 0.05,
        );
        if (stopped) {
          const values = dice.map(({ body }) => dieValue(body));
          const key = values.join('-');
          if (key !== lastSettle) {
            lastSettle = key;
            rolling = false;
            onSettled?.(values);
          }
        }
      }

      renderer.render(scene, camera);
      gl.endFrameEXP();
    } catch (e) {
      alive = false;
      onError?.(e);
    }
  };

  loop();

  return {
    roll: throwDice,
    dispose: () => {
      alive = false;
      cancelAnimationFrame(raf);
      renderer.dispose();
    },
  };
}
