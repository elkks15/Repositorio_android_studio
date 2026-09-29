import { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import { NEON } from './shared';

export default function SixtySevenMode({ seconds = 12, onAura, onDone }) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [target, setTarget] = useState(Math.random() < 0.5 ? '6' : '7');
  const [streak, setStreak] = useState(0);
  const [bg, setBg] = useState(0);
  const [pulse, setPulse] = useState(false);

  const nextTarget = () => setTarget(Math.random() < 0.5 ? '6' : '7');

  useEffect(() => {
    let finished = false;
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          if (!finished) {
            finished = true;
            onDone?.();
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    const swap = setInterval(nextTarget, 900);
    const c = setInterval(() => {
      setBg((i) => i + 1);
      setPulse((p) => !p);
    }, 110);
    return () => {
      clearInterval(t);
      clearInterval(swap);
      clearInterval(c);
    };
  }, []);

  const tap = (n) => {
    if (n === target) {
      const gain = 700 + streak * 180;
      setStreak((s) => s + 1);
      onAura?.(gain);
      Vibration.vibrate(35);
      nextTarget();
    } else {
      setStreak(0);
      onAura?.(-600);
      Vibration.vibrate(90);
    }
  };

  return (
    <View style={[styles.arena, { backgroundColor: NEON[bg % NEON.length] }]}>
      <Text style={styles.title}>TAPEA EL {target}</Text>
      <Text style={styles.meta}>
        {timeLeft}s · STREAK {streak}
      </Text>
      <Text style={[styles.ghost, { opacity: pulse ? 1 : 0.3 }]}>{target}</Text>
      <View style={styles.row}>
        <Pressable style={[styles.btn, styles.six]} onPress={() => tap('6')}>
          <Text style={styles.num}>6</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.seven]} onPress={() => tap('7')}>
          <Text style={styles.num}>7</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  arena: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontWeight: '900', fontSize: 28 },
  meta: { color: '#111', fontWeight: '900', marginTop: 6, fontSize: 16 },
  ghost: {
    fontSize: 140,
    fontWeight: '900',
    color: '#ffffff88',
    marginVertical: 8,
  },
  row: { flexDirection: 'row', gap: 18 },
  btn: {
    width: 140,
    height: 180,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: '#fff',
  },
  six: { backgroundColor: '#7c5cff' },
  seven: { backgroundColor: '#ff003c' },
  num: { fontSize: 88, fontWeight: '900', color: '#fff' },
});
