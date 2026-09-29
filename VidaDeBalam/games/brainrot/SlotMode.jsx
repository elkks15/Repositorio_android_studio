import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import { CREATURES, NEON, rand } from './shared';

function spinReel() {
  return CREATURES[Math.floor(Math.random() * CREATURES.length)];
}

export default function SlotMode({ seconds = 12, onAura, onDone, autoPlay = false }) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [reels, setReels] = useState([CREATURES[0], CREATURES[1], CREATURES[2]]);
  const [spinning, setSpinning] = useState(false);
  const [msg, setMsg] = useState('GIRA EL ROT');
  const [bg, setBg] = useState(0);
  const [spins, setSpins] = useState(0);

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
    const c = setInterval(() => setBg((i) => i + 1), 100);
    return () => {
      clearInterval(t);
      clearInterval(c);
    };
  }, []);

  useEffect(() => {
    if (autoPlay) {
      const id = setTimeout(() => spin(), 400);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [autoPlay]);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setMsg('GIRANDO...');
    Vibration.vibrate(20);
    let ticks = 0;
    const iv = setInterval(() => {
      setReels([spinReel(), spinReel(), spinReel()]);
      ticks += 1;
      if (ticks >= 12) {
        clearInterval(iv);
        const a = spinReel();
        const b = Math.random() < 0.28 ? a : spinReel();
        const c = Math.random() < 0.22 ? a : spinReel();
        const final = [a, b, c];
        setReels(final);
        setSpinning(false);
        setSpins((n) => n + 1);
        if (a.key === b.key && b.key === c.key) {
          setMsg('JACKPOT 67 🔥');
          onAura?.(12000);
          Vibration.vibrate([0, 50, 50, 80, 50, 120]);
        } else if (a.key === b.key || b.key === c.key || a.key === c.key) {
          setMsg('RIZZ PARCIAL');
          onAura?.(2500);
          Vibration.vibrate(60);
        } else {
          setMsg('CHOPPED');
          onAura?.(400);
        }
      }
    }, 70 + rand(0, 30));
  };

  return (
    <View style={[styles.arena, { backgroundColor: NEON[bg % NEON.length] }]}>
      <Text style={styles.title}>BRAINROT SLOTS</Text>
      <Text style={styles.meta}>
        {timeLeft}s · SPINS {spins}
      </Text>
      <View style={styles.row}>
        {reels.map((r, i) => (
          <View key={`${r.key}-${i}`} style={styles.reel}>
            <Image source={r.image} style={styles.img} />
            <Text style={styles.name}>{r.name}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.msg}>{msg}</Text>
      <Pressable
        style={[styles.btn, spinning && { opacity: 0.5 }]}
        onPress={spin}
        disabled={spinning}
      >
        <Text style={styles.btnText}>SPIN</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  arena: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { color: '#fff', fontWeight: '900', fontSize: 26 },
  meta: { color: '#111', fontWeight: '900', marginTop: 4 },
  row: { flexDirection: 'row', gap: 8, marginTop: 20 },
  reel: {
    width: 104,
    backgroundColor: '#00000099',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#ffff00',
    alignItems: 'center',
    padding: 6,
  },
  img: { width: 88, height: 88, borderRadius: 12 },
  name: { color: '#fff', fontSize: 9, fontWeight: '900', marginTop: 4 },
  msg: {
    marginTop: 18,
    fontSize: 22,
    fontWeight: '900',
    color: '#ffff00',
    textShadowColor: '#000',
    textShadowRadius: 6,
  },
  btn: {
    marginTop: 18,
    backgroundColor: '#ff003c',
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#fff',
  },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 24 },
});
