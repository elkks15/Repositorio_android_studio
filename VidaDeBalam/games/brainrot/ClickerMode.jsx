import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import { NEON, pickCreature } from './shared';

export default function ClickerMode({ seconds = 8, onAura, onDone }) {
  const rot = pickCreature('tralalero');
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [taps, setTaps] = useState(0);
  const [burst, setBurst] = useState(0);
  const [bg, setBg] = useState(0);

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
    const c = setInterval(() => setBg((i) => i + 1), 80);
    return () => {
      clearInterval(t);
      clearInterval(c);
    };
  }, []);

  const tap = () => {
    const next = taps + 1;
    setTaps(next);
    setBurst(next);
    const bonus = next % 10 === 0 ? 1500 : 220;
    onAura?.(bonus);
    Vibration.vibrate(18);
  };

  return (
    <Pressable
      style={[styles.arena, { backgroundColor: NEON[bg % NEON.length] }]}
      onPress={tap}
    >
      <Text style={styles.title}>AURA CLICKER</Text>
      <Text style={styles.meta}>
        {timeLeft}s · TAPS {taps}
      </Text>
      <Image
        source={rot.image}
        style={[
          styles.img,
          { transform: [{ scale: 1 + (burst % 4) * 0.08 }] },
        ]}
      />
      <Text style={styles.big}>+{taps * 220}</Text>
      <Text style={styles.hint}>TOCA LA PANTALLA COMO LOCO</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  arena: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontWeight: '900', fontSize: 28 },
  meta: { color: '#111', fontWeight: '900', marginTop: 6, fontSize: 16 },
  img: { width: 260, height: 260, marginVertical: 10 },
  big: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffff00',
    textShadowColor: '#000',
    textShadowRadius: 8,
  },
  hint: { marginTop: 8, color: '#fff', fontWeight: '900', fontSize: 16 },
});
