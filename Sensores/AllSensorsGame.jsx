import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Accelerometer,
  Barometer,
  DeviceMotion,
  Gyroscope,
  LightSensor,
  Magnetometer,
  MagnetometerUncalibrated,
  Pedometer,
} from 'expo-sensors';

function wrap360(deg) {
  return ((deg % 360) + 360) % 360;
}

function angleDiff(a, b) {
  return Math.abs(((a - b + 540) % 360) - 180);
}

function magHeading(x, y) {
  return wrap360((Math.atan2(-x, y) * 180) / Math.PI);
}

function hypot3(x, y, z) {
  return Math.hypot(x || 0, y || 0, z || 0);
}

const MISSIONS = [
  {
    id: 'motion',
    sensor: 'DeviceMotion',
    title: 'Inclina el celular',
    how: 'Inclínalo a la derecha para llevar la bola al círculo verde.',
  },
  {
    id: 'accel',
    sensor: 'Acelerómetro',
    title: 'Agita el celular',
    how: 'Agítalo fuerte 3 veces para romper la caja.',
  },
  {
    id: 'gyro',
    sensor: 'Giroscopio',
    title: 'Gíralo como un volante',
    how: 'Tuerce el celular a los lados hasta llenar la barra.',
  },
  {
    id: 'pedo',
    sensor: 'Podómetro',
    title: 'Camina en tu lugar',
    how: 'Da 6 pasos sin soltar el celular.',
  },
  {
    id: 'mag',
    sensor: 'Magnetómetro',
    title: 'Apunta a la estrella',
    how: 'Gira sobre tus pies hasta que la aguja toque la estrella.',
  },
  {
    id: 'uncal',
    sensor: 'Magnetómetro raw',
    title: 'Acerca un imán',
    how: 'Pon el celular junto a un imán, bocinas o la tapa de una laptop.',
  },
  {
    id: 'baro',
    sensor: 'Barómetro',
    title: 'Levanta el celular',
    how: 'Súbelo hacia el techo (o sube un escalón) para cambiar de altura.',
  },
  {
    id: 'light',
    sensor: 'Sensor de luz',
    title: 'Tapa la luz',
    how: 'Cubre la parte de arriba del celular o apaga la luz del cuarto.',
  },
];

export default function AllSensorsGame() {
  const data = useRef({
    accel: { x: 0, y: 0, z: 0 },
    gyro: { x: 0, y: 0, z: 0 },
    mag: { x: 0, y: 0, z: 0 },
    magRaw: { x: 0, y: 0, z: 0 },
    gamma: 0,
    beta: 0,
    pressure: null,
    lux: null,
    steps: 0,
  });
  const rest = useRef({ gamma: 0, beta: 0, pressure: null, lux: null, mag: 0 });
  const lastAccel = useRef({ x: 0, y: 0, z: 0 });
  const lastSteps = useRef(0);
  const progress = useRef({
    ball: 40,
    shakes: 0,
    spin: 0,
    steps: 0,
    heading: 0,
    target: 90,
    magField: 0,
    lift: 0,
    dark: 0,
  });
  const avail = useRef({ baro: true, light: true, pedo: true });
  const indexRef = useRef(0);
  const doneRef = useRef(false);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [fill, setFill] = useState(0);
  const [hint, setHint] = useState('');
  const [ui, setUi] = useState({ ball: 40, heading: 0, shakes: 0, steps: 0 });

  const skipUnavailable = (id) => {
    if (id === 'pedo' && !avail.current.pedo) return true;
    if (id === 'light' && !avail.current.light) return true;
    if (id === 'baro' && !avail.current.baro) return false;
    return false;
  };

  const complete = () => {
    const i = indexRef.current;
    const next = i + 1;
    if (next >= MISSIONS.length) {
      doneRef.current = true;
      setDone(true);
      return;
    }
    progress.current.shakes = 0;
    progress.current.spin = 0;
    progress.current.steps = 0;
    progress.current.ball = 40;
    progress.current.lift = 0;
    progress.current.target = wrap360(progress.current.heading + 90);
    data.current.steps = 0;
    rest.current.gamma = data.current.gamma;
    rest.current.beta = data.current.beta;
    rest.current.pressure = data.current.pressure;
    rest.current.lux = data.current.lux;
    rest.current.mag = hypot3(data.current.mag.x, data.current.mag.y, data.current.mag.z);
    indexRef.current = next;
    setIndex(next);
    setFill(0);
  };

  const restart = () => {
    doneRef.current = false;
    indexRef.current = 0;
    data.current.steps = 0;
    setDone(false);
    setIndex(0);
    setFill(0);
    progress.current = {
      ball: 40,
      shakes: 0,
      spin: 0,
      steps: 0,
      heading: 0,
      target: 90,
      magField: 0,
      lift: 0,
      dark: 0,
    };
  };

  useEffect(() => {
    const subs = [];
    let raf;
    let last = Date.now();
    let cancelled = false;
    let cooldown = 0;

    const start = async () => {
      await Promise.allSettled([
        Accelerometer.requestPermissionsAsync(),
        Gyroscope.requestPermissionsAsync(),
        Magnetometer.requestPermissionsAsync(),
        DeviceMotion.requestPermissionsAsync(),
        Pedometer.requestPermissionsAsync(),
      ]);

      Accelerometer.setUpdateInterval(40);
      Gyroscope.setUpdateInterval(40);
      Magnetometer.setUpdateInterval(80);
      MagnetometerUncalibrated.setUpdateInterval(80);
      DeviceMotion.setUpdateInterval(32);

      subs.push(Accelerometer.addListener((v) => { data.current.accel = v; }));
      subs.push(Gyroscope.addListener((v) => { data.current.gyro = v; }));
      subs.push(Magnetometer.addListener((v) => { data.current.mag = v; }));
      subs.push(MagnetometerUncalibrated.addListener((v) => { data.current.magRaw = v; }));
      subs.push(
        DeviceMotion.addListener((m) => {
          const rot = m.rotation || {};
          data.current.gamma = rot.gamma || 0;
          data.current.beta = rot.beta || 0;
        }),
      );

      avail.current.baro = await Barometer.isAvailableAsync();
      if (avail.current.baro) {
        Barometer.setUpdateInterval(350);
        subs.push(Barometer.addListener(({ pressure }) => { data.current.pressure = pressure; }));
      }
      avail.current.light = await LightSensor.isAvailableAsync();
      if (avail.current.light) {
        LightSensor.setUpdateInterval(250);
        subs.push(LightSensor.addListener(({ illuminance }) => { data.current.lux = illuminance; }));
      }
      avail.current.pedo = await Pedometer.isAvailableAsync();
      if (avail.current.pedo) {
        subs.push(
          Pedometer.watchStepCount(({ steps }) => {
            const delta = steps - lastSteps.current;
            lastSteps.current = steps;
            if (delta > 0 && delta < 6) data.current.steps += delta;
          }),
        );
      }

      const loop = () => {
        if (cancelled) return;
        raf = requestAnimationFrame(loop);
        if (doneRef.current) return;
        const now = Date.now();
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        const mission = MISSIONS[indexRef.current];
        if (!mission) return;
        if (now < cooldown) return;

        if (skipUnavailable(mission.id)) {
          setHint('Este sensor no viene en tu celular, pasamos al siguiente.');
          cooldown = now + 900;
          complete();
          return;
        }

        const d = data.current;
        const p = progress.current;
        let nextFill = 0;
        let nextHint = '';

        if (mission.id === 'motion') {
          const tilt = (d.gamma - rest.current.gamma) * 1.6;
          p.ball = Math.max(20, Math.min(86, p.ball + tilt * 18 * dt * 60));
          nextFill = Math.min(1, (p.ball - 40) / 42);
          nextHint = tilt > 0.05 ? 'Bien, sigue inclinando →' : 'Inclina el lado derecho hacia abajo';
          if (p.ball > 82) {
            cooldown = now + 500;
            complete();
          }
        }

        if (mission.id === 'accel') {
          const jerk = Math.hypot(
            d.accel.x - lastAccel.current.x,
            d.accel.y - lastAccel.current.y,
            d.accel.z - lastAccel.current.z,
          );
          lastAccel.current = { ...d.accel };
          if (jerk > 1.15) p.shakes = Math.min(3, p.shakes + 1);
          nextFill = p.shakes / 3;
          nextHint = `Agitadas: ${p.shakes}/3`;
          if (p.shakes >= 3) {
            cooldown = now + 500;
            complete();
          }
        }

        if (mission.id === 'gyro') {
          p.spin += hypot3(d.gyro.x, d.gyro.y, d.gyro.z) * dt;
          nextFill = Math.min(1, p.spin / 6);
          nextHint = 'Tuerce el celular a la izquierda y derecha';
          if (p.spin >= 6) {
            cooldown = now + 500;
            complete();
          }
        }

        if (mission.id === 'pedo') {
          p.steps = d.steps;
          nextFill = Math.min(1, p.steps / 6);
          nextHint = `Pasos: ${Math.min(6, p.steps)}/6`;
          if (p.steps >= 6) {
            cooldown = now + 500;
            complete();
          }
        }

        if (mission.id === 'mag') {
          p.heading = magHeading(d.mag.x, d.mag.y);
          const diff = angleDiff(p.heading, p.target);
          nextFill = Math.max(0, 1 - diff / 90);
          nextHint = diff < 18 ? '¡Ahí! Mantén la aguja' : `Gira ${Math.round(diff)}° hacia la estrella`;
          if (diff < 14) p.spin += dt;
          else p.spin = 0;
          if (p.spin > 0.55) {
            cooldown = now + 500;
            complete();
          }
        }

        if (mission.id === 'uncal') {
          const cal = hypot3(d.mag.x, d.mag.y, d.mag.z);
          const raw = hypot3(d.magRaw.x, d.magRaw.y, d.magRaw.z);
          const field = Math.max(cal, raw);
          if (!rest.current.mag) rest.current.mag = field;
          p.magField = field;
          nextFill = Math.min(1, Math.abs(field - rest.current.mag) / 35);
          nextHint = `Campo: ${field.toFixed(0)} µT  ·  acerca un imán`;
          if (Math.abs(field - rest.current.mag) > 28) {
            cooldown = now + 500;
            complete();
          }
        }

        if (mission.id === 'baro') {
          const lift = (rest.current.beta || 0) - d.beta;
          const pressureUp =
            rest.current.pressure != null && d.pressure != null
              ? rest.current.pressure - d.pressure
              : 0;
          p.lift = Math.max(lift, pressureUp * 2);
          nextFill = Math.min(1, p.lift / 0.55);
          nextHint = 'Levanta el celular como si volara';
          if (p.lift > 0.55 || pressureUp > 0.25) {
            cooldown = now + 500;
            complete();
          }
        }

        if (mission.id === 'light') {
          if (rest.current.lux == null && d.lux != null) rest.current.lux = d.lux;
          const base = rest.current.lux || 40;
          nextFill = Math.min(1, Math.max(0, (base - (d.lux || base)) / Math.max(12, base * 0.6)));
          nextHint = `Luz: ${Math.round(d.lux || 0)} lux  ·  tápala`;
          if ((d.lux != null && d.lux < Math.min(12, base * 0.35)) || nextFill >= 1) {
            cooldown = now + 500;
            complete();
          }
        }

        setFill(nextFill);
        setHint(nextHint);
        setUi({
          ball: p.ball,
          heading: p.heading,
          shakes: p.shakes,
          steps: p.steps,
          target: p.target,
        });
      };

      loop();
    };

    start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      subs.forEach((s) => s?.remove?.());
    };
  }, []);

  const mission = MISSIONS[index];

  if (done) {
    return (
      <View style={styles.root}>
        <Text style={styles.kicker}>Misión sensores</Text>
        <Text style={styles.win}>¡Los usaste todos!</Text>
        <Text style={styles.how}>
          Acelerómetro, giroscopio, magnetómetro, movimiento, barómetro, luz y pasos.
        </Text>
        <Pressable style={styles.btn} onPress={restart}>
          <Text style={styles.btnText}>Jugar otra vez</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.kicker}>
        Misión {index + 1} de {MISSIONS.length}
      </Text>
      <Text style={styles.sensor}>{mission.sensor}</Text>
      <Text style={styles.title}>{mission.title}</Text>
      <Text style={styles.how}>{mission.how}</Text>

      <View style={styles.stage}>
        {mission.id === 'motion' ? (
          <View style={styles.track}>
            <View style={[styles.ball, { left: `${ui.ball}%` }]} />
            <View style={styles.goal} />
          </View>
        ) : null}

        {mission.id === 'accel' ? (
          <View style={styles.centerBox}>
            <Text style={styles.big}>{ui.shakes < 3 ? '📦' : '💥'}</Text>
            <Text style={styles.how}>{ui.shakes}/3 agitadas</Text>
          </View>
        ) : null}

        {mission.id === 'gyro' ? (
          <View style={styles.centerBox}>
            <Text style={styles.big}>🎡</Text>
          </View>
        ) : null}

        {mission.id === 'pedo' ? (
          <View style={styles.centerBox}>
            <Text style={styles.big}>👟</Text>
            <Text style={styles.how}>{Math.min(6, ui.steps)}/6 pasos</Text>
          </View>
        ) : null}

        {mission.id === 'mag' ? (
          <View style={styles.compass}>
            <View style={[styles.spin, { transform: [{ rotate: `${ui.target || 90}deg` }] }]}>
              <Text style={styles.star}>★</Text>
            </View>
            <View style={[styles.spin, { transform: [{ rotate: `${ui.heading}deg` }] }]}>
              <View style={styles.needle} />
            </View>
          </View>
        ) : null}

        {mission.id === 'uncal' ? (
          <View style={styles.centerBox}>
            <Text style={styles.big}>🧲</Text>
          </View>
        ) : null}

        {mission.id === 'baro' ? (
          <View style={styles.centerBox}>
            <Text style={styles.big}>🛫</Text>
          </View>
        ) : null}

        {mission.id === 'light' ? (
          <View style={styles.centerBox}>
            <Text style={styles.big}>💡</Text>
          </View>
        ) : null}

        <View style={styles.bar}>
          <View style={[styles.barFill, { width: `${Math.round(fill * 100)}%` }]} />
        </View>
        <Text style={styles.hint}>{hint}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1b1030',
    paddingTop: 54,
    paddingHorizontal: 18,
  },
  kicker: {
    color: '#c9a8ff',
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  sensor: {
    color: '#ffe66d',
    marginTop: 10,
    fontWeight: '800',
    fontSize: 14,
  },
  title: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 4,
  },
  how: {
    color: '#d7c7f3',
    fontSize: 16,
    marginTop: 8,
    lineHeight: 22,
  },
  stage: {
    flex: 1,
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    width: '100%',
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2a1b45',
    justifyContent: 'center',
  },
  ball: {
    position: 'absolute',
    width: 38,
    height: 38,
    marginLeft: -19,
    borderRadius: 19,
    backgroundColor: '#7bed9f',
  },
  goal: {
    position: 'absolute',
    right: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 4,
    borderColor: '#7bed9f',
  },
  centerBox: {
    alignItems: 'center',
  },
  big: {
    fontSize: 72,
  },
  compass: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#2a1b45',
    borderWidth: 6,
    borderColor: '#c9a15b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spin: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  star: {
    marginTop: 14,
    fontSize: 32,
    color: '#ffd32a',
  },
  needle: {
    width: 8,
    height: '40%',
    marginTop: '12%',
    backgroundColor: '#ff6b6b',
    borderRadius: 4,
  },
  bar: {
    marginTop: 28,
    width: '100%',
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2a1b45',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#7bed9f',
  },
  hint: {
    marginTop: 12,
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  win: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
    marginTop: 16,
  },
  btn: {
    marginTop: 28,
    alignSelf: 'flex-start',
    backgroundColor: '#7bed9f',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnText: {
    color: '#1b1030',
    fontWeight: '800',
  },
});
