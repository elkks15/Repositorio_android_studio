import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GLView } from 'expo-gl';
import { Accelerometer } from 'expo-sensors';
import { startDiceScene } from './createDiceScene';

const SHAKE_COOLDOWN_MS = 1200;

export default function Dice3D() {
  const sceneRef = useRef(null);
  const accelRef = useRef({ x: 0, y: 0, z: -1 });
  const lastShakeRef = useRef(0);
  const lastAccelRef = useRef({ x: 0, y: 0, z: -1 });
  const [rolling, setRolling] = useState(true);
  const [values, setValues] = useState([null, null]);
  const [accelLabel, setAccelLabel] = useState('x: 0.00  y: 0.00  z: 0.00');
  const [error, setError] = useState(null);

  const roll = (shake) => {
    sceneRef.current?.roll(shake);
  };

  useEffect(() => {
    Accelerometer.setUpdateInterval(32);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      accelRef.current = { x, y, z };
      setAccelLabel(`x: ${x.toFixed(2)}  y: ${y.toFixed(2)}  z: ${z.toFixed(2)}`);

      const prev = lastAccelRef.current;
      lastAccelRef.current = { x, y, z };
      const dx = x - prev.x;
      const dy = y - prev.y;
      const dz = z - prev.z;
      const jerk = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const now = Date.now();
      if (jerk > 0.85 && now - lastShakeRef.current > SHAKE_COOLDOWN_MS) {
        lastShakeRef.current = now;
        roll({ x: dx, y: dy, z: dz });
      }
    });
    return () => {
      sub.remove();
      sceneRef.current?.dispose();
    };
  }, []);

  const total = values[0] != null && values[1] != null ? values[0] + values[1] : null;

  return (
    <View style={styles.root}>
      <GLView
        style={styles.gl}
        onContextCreate={(gl) => {
          try {
            sceneRef.current?.dispose();
            sceneRef.current = startDiceScene(gl, {
              accelRef,
              onRolling: () => {
                setRolling(true);
                setValues([null, null]);
              },
              onSettled: (next) => {
                setValues(next);
                setRolling(false);
              },
              onError: (e) => setError(e?.message || String(e)),
            });
            setError(null);
          } catch (e) {
            setError(e?.message || String(e));
          }
        }}
      />

      <Pressable style={styles.touch} onPress={() => roll()} />

      <View pointerEvents="none" style={styles.hud}>
        <Text style={styles.kicker}>Dados 3D</Text>
        <Text style={styles.title}>Agita hacia un lado</Text>
        <Text style={styles.hint}>o toca para lanzar</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <View pointerEvents="none" style={styles.footer}>
        <View style={styles.resultBox}>
          {rolling || total == null ? (
            <Text style={styles.result}>Lanzando...</Text>
          ) : (
            <Text style={styles.result}>
              {values[0]} + {values[1]} = {total}
            </Text>
          )}
        </View>
        <Text style={styles.accel}>{accelLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#08140d',
  },
  gl: {
    flex: 1,
  },
  touch: {
    ...StyleSheet.absoluteFillObject,
  },
  hud: {
    position: 'absolute',
    top: 52,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  kicker: {
    color: '#8ee0a8',
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
  hint: {
    color: '#c5e6cf',
    marginTop: 4,
    fontSize: 14,
  },
  resultBox: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 14,
  },
  result: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
  },
  accel: {
    marginTop: 10,
    color: '#9db8a6',
    fontSize: 12,
  },
  error: {
    marginTop: 12,
    color: '#ff8a80',
    textAlign: 'center',
    fontSize: 13,
  },
});
