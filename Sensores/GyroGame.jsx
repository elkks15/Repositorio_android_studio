import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DeviceMotion, Gyroscope } from 'expo-sensors';

const BALL_R = 16;
const GOAL_HOLD_MS = 380;
const SENS = 980;
const FRICTION = 0.985;
const MAX_SPEED = 520;

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function buildLevel(level, w, h) {
  const t = 18;
  const walls = [
    { x: 0, y: 0, w, h: t },
    { x: 0, y: h - t, w, h: t },
    { x: 0, y: 0, w: t, h },
    { x: w - t, y: 0, w: t, h },
  ];
  const i = (level - 1) % 3;
  if (i === 0) {
    walls.push({ x: w * 0.32, y: h * 0.18, w: t, h: h * 0.46 });
    walls.push({ x: w * 0.6, y: h * 0.4, w: t, h: h * 0.42 });
    return {
      walls,
      start: { x: w * 0.18, y: h * 0.2 },
      goal: { x: w * 0.8, y: h * 0.8, r: 30 },
      holes: [{ x: w * 0.52, y: h * 0.52, r: 20 }],
    };
  }
  if (i === 1) {
    walls.push({ x: w * 0.18, y: h * 0.32, w: w * 0.5, h: t });
    walls.push({ x: w * 0.38, y: h * 0.58, w: w * 0.5, h: t });
    walls.push({ x: w * 0.48, y: h * 0.18, w: t, h: h * 0.22 });
    return {
      walls,
      start: { x: w * 0.2, y: h * 0.18 },
      goal: { x: w * 0.78, y: h * 0.78, r: 28 },
      holes: [
        { x: w * 0.3, y: h * 0.48, r: 18 },
        { x: w * 0.7, y: h * 0.42, r: 18 },
      ],
    };
  }
  walls.push({ x: w * 0.25, y: h * 0.16, w: t, h: h * 0.55 });
  walls.push({ x: w * 0.5, y: h * 0.32, w: t, h: h * 0.55 });
  walls.push({ x: w * 0.74, y: h * 0.16, w: t, h: h * 0.55 });
  return {
    walls,
    start: { x: w * 0.14, y: h * 0.14 },
    goal: { x: w * 0.86, y: h * 0.86, r: 26 },
    holes: [
      { x: w * 0.38, y: h * 0.78, r: 18 },
      { x: w * 0.62, y: h * 0.22, r: 18 },
    ],
  };
}

function hitWall(cx, cy, vx, vy, r, wall) {
  const nearestX = clamp(cx, wall.x, wall.x + wall.w);
  const nearestY = clamp(cy, wall.y, wall.y + wall.h);
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  const dist = Math.hypot(dx, dy);
  if (dist === 0 || dist >= r) return { cx, cy, vx, vy };
  const nx = dx / dist;
  const ny = dy / dist;
  const overlap = r - dist;
  cx += nx * overlap;
  cy += ny * overlap;
  const vn = vx * nx + vy * ny;
  if (vn < 0) {
    vx -= 1.7 * vn * nx;
    vy -= 1.7 * vn * ny;
  }
  return { cx, cy, vx, vy };
}

export default function GyroGame() {
  const ballRef = useRef(null);
  const gyroRef = useRef({ x: 0, y: 0, z: 0 });
  const tiltRef = useRef({ x: 0, y: 0 });
  const restRef = useRef(null);
  const stateRef = useRef({
    x: 40,
    y: 40,
    vx: 0,
    vy: 0,
    w: 0,
    h: 0,
    goalUntil: 0,
  });
  const levelRef = useRef(null);
  const livesRef = useRef(3);
  const freezeRef = useRef(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [gyroLabel, setGyroLabel] = useState('x: 0.00  y: 0.00  z: 0.00');
  const [message, setMessage] = useState('Inclina el celular');
  const [ready, setReady] = useState(false);

  const resetBall = (start) => {
    const s = stateRef.current;
    s.x = start.x;
    s.y = start.y;
    s.vx = 0;
    s.vy = 0;
    s.goalUntil = 0;
    ballRef.current?.setNativeProps({
      style: { left: start.x - BALL_R, top: start.y - BALL_R },
    });
  };

  const loadLevel = (n, w, h) => {
    const layout = buildLevel(n, w, h);
    levelRef.current = layout;
    resetBall(layout.start);
    return layout;
  };

  useEffect(() => {
    let motionSub;
    let gyroSub;
    let raf;
    let last = Date.now();
    let cancelled = false;

    const start = async () => {
      await Gyroscope.requestPermissionsAsync();
      await DeviceMotion.requestPermissionsAsync();
      Gyroscope.setUpdateInterval(16);
      DeviceMotion.setUpdateInterval(16);

      gyroSub = Gyroscope.addListener(({ x, y, z }) => {
        gyroRef.current = { x, y, z };
        setGyroLabel(`x: ${x.toFixed(2)}  y: ${y.toFixed(2)}  z: ${z.toFixed(2)}`);
      });

      motionSub = DeviceMotion.addListener((data) => {
        const rot = data.rotation || { beta: 0, gamma: 0 };
        if (!restRef.current) {
          restRef.current = { beta: rot.beta || 0, gamma: rot.gamma || 0 };
        }
        const rest = restRef.current;
        tiltRef.current = {
          x: (rot.gamma || 0) - rest.gamma,
          y: (rot.beta || 0) - rest.beta,
        };
      });

      const loop = () => {
        if (cancelled) return;
        raf = requestAnimationFrame(loop);
        const layout = levelRef.current;
        const s = stateRef.current;
        const now = Date.now();
        if (!layout || s.w < 10 || livesRef.current <= 0) return;
        if (now < freezeRef.current) {
          last = now;
          ballRef.current?.setNativeProps({
            style: { left: s.x - BALL_R, top: s.y - BALL_R },
          });
          return;
        }

        const dt = Math.min((now - last) / 1000, 0.04);
        last = now;

        const tilt = tiltRef.current;
        const gyro = gyroRef.current;
        s.vx += (tilt.x * SENS + gyro.y * 90) * dt;
        s.vy += (tilt.y * SENS + gyro.x * 90) * dt;
        s.vx = clamp(s.vx * FRICTION, -MAX_SPEED, MAX_SPEED);
        s.vy = clamp(s.vy * FRICTION, -MAX_SPEED, MAX_SPEED);
        s.x += s.vx * dt;
        s.y += s.vy * dt;

        for (const wall of layout.walls) {
          const next = hitWall(s.x, s.y, s.vx, s.vy, BALL_R, wall);
          s.x = next.cx;
          s.y = next.cy;
          s.vx = next.vx;
          s.vy = next.vy;
        }

        s.x = clamp(s.x, BALL_R, s.w - BALL_R);
        s.y = clamp(s.y, BALL_R, s.h - BALL_R);

        ballRef.current?.setNativeProps({
          style: { left: s.x - BALL_R, top: s.y - BALL_R },
        });

        for (const hole of layout.holes) {
          if (Math.hypot(s.x - hole.x, s.y - hole.y) < hole.r - 4) {
            freezeRef.current = now + 700;
            livesRef.current = Math.max(0, livesRef.current - 1);
            setLives(livesRef.current);
            setMessage(livesRef.current === 0 ? 'Se acabaron las vidas' : 'Caíste');
            resetBall(layout.start);
            return;
          }
        }

        const distGoal = Math.hypot(s.x - layout.goal.x, s.y - layout.goal.y);
        if (distGoal < layout.goal.r - 6) {
          if (!s.goalUntil) s.goalUntil = now;
          if (now - s.goalUntil > GOAL_HOLD_MS) {
            s.goalUntil = 0;
            freezeRef.current = now + 450;
            setScore((prev) => {
              const nextScore = prev + 1;
              const nextLevel = Math.floor(nextScore / 2) + 1;
              setLevel(nextLevel);
              setMessage('¡Gol!');
              loadLevel(nextLevel, s.w, s.h);
              return nextScore;
            });
          }
        } else {
          s.goalUntil = 0;
        }
      };

      loop();
    };

    start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      gyroSub?.remove();
      motionSub?.remove();
    };
  }, []);

  return (
    <View style={styles.root}>
      <View style={styles.hud}>
        <Text style={styles.kicker}>Giroscopio</Text>
        <Text style={styles.title}>{message}</Text>
        <Text style={styles.stats}>
          Puntos {score}   Vidas {lives}   Nivel {level}
        </Text>
        <Text style={styles.gyro}>{gyroLabel}</Text>
      </View>

      <View
        style={styles.boardWrap}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          stateRef.current.w = width;
          stateRef.current.h = height;
          loadLevel(level, width, height);
          setReady(true);
        }}
      >
        {ready && levelRef.current ? (
          <>
            {levelRef.current.holes.map((hole, i) => (
              <View
                key={`h-${i}`}
                style={[
                  styles.hole,
                  {
                    width: hole.r * 2,
                    height: hole.r * 2,
                    left: hole.x - hole.r,
                    top: hole.y - hole.r,
                    borderRadius: hole.r,
                  },
                ]}
              />
            ))}
            <View
              style={[
                styles.goal,
                {
                  width: levelRef.current.goal.r * 2,
                  height: levelRef.current.goal.r * 2,
                  left: levelRef.current.goal.x - levelRef.current.goal.r,
                  top: levelRef.current.goal.y - levelRef.current.goal.r,
                  borderRadius: levelRef.current.goal.r,
                },
              ]}
            />
            {levelRef.current.walls.map((wall, i) => (
              <View
                key={`w-${i}`}
                style={[
                  styles.wall,
                  { left: wall.x, top: wall.y, width: wall.w, height: wall.h },
                ]}
              />
            ))}
            <View ref={ballRef} style={styles.ball}>
              <View style={styles.ballShine} />
            </View>
          </>
        ) : null}
      </View>

      <Pressable
        style={styles.calibrate}
        onPress={() => {
          restRef.current = null;
          livesRef.current = 3;
          freezeRef.current = 0;
          setLives(3);
          setScore(0);
          setLevel(1);
          if (stateRef.current.w > 10) {
            loadLevel(1, stateRef.current.w, stateRef.current.h);
          }
          setMessage('Calibrado, inclina ahora');
        }}
      >
        <Text style={styles.calibrateText}>Calibrar / Reiniciar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#120c08',
    paddingTop: 48,
  },
  hud: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  kicker: {
    color: '#e7c27d',
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  stats: {
    color: '#f3e2bf',
    marginTop: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  gyro: {
    color: '#b89b72',
    marginTop: 4,
    fontSize: 12,
  },
  boardWrap: {
    flex: 1,
    marginHorizontal: 14,
    marginBottom: 10,
    backgroundColor: '#1f6b3a',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#6b3a1f',
  },
  wall: {
    position: 'absolute',
    backgroundColor: '#8a5228',
    borderColor: '#d7b07a',
    borderWidth: 1,
  },
  hole: {
    position: 'absolute',
    backgroundColor: '#0a0705',
    borderWidth: 3,
    borderColor: '#3a2216',
  },
  goal: {
    position: 'absolute',
    backgroundColor: '#d4a017',
    borderWidth: 4,
    borderColor: '#ffe38a',
  },
  ball: {
    position: 'absolute',
    width: BALL_R * 2,
    height: BALL_R * 2,
    borderRadius: BALL_R,
    backgroundColor: '#e8eef4',
    borderWidth: 1,
    borderColor: '#8ea0b0',
  },
  ballShine: {
    position: 'absolute',
    top: 4,
    left: 6,
    width: 10,
    height: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  calibrate: {
    alignSelf: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(215,176,122,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  calibrateText: {
    color: '#f3e2bf',
    fontWeight: '700',
  },
});
