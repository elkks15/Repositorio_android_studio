import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import { NEON, pickCreature, rand } from './shared';

const HOLES = [0, 1, 2, 3, 4, 5];

export default function WhackMode({ seconds = 12, onAura, onDone }) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [active, setActive] = useState(0);
  const [rot, setRot] = useState(pickCreature());
  const [bg, setBg] = useState(0);
  const [score, setScore] = useState(0);

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
    const hop = setInterval(() => {
      setActive(Math.floor(rand(0, HOLES.length)));
      setRot(pickCreature());
    }, 620);
    const c = setInterval(() => setBg((i) => i + 1), 100);
    return () => {
      clearInterval(t);
      clearInterval(hop);
      clearInterval(c);
    };
  }, []);

  const whack = (i) => {
    if (i !== active) {
      onAura?.(-250);
      Vibration.vibrate(40);
      return;
    }
    setScore((s) => s + 1);
    onAura?.(900);
    Vibration.vibrate(30);
    setActive(Math.floor(rand(0, HOLES.length)));
    setRot(pickCreature());
  };

  return (
    <View style={[styles.arena, { backgroundColor: NEON[bg % NEON.length] }]}>
      <Text style={styles.title}>WHACK-A-ROT</Text>
      <Text style={styles.meta}>
        {timeLeft}s · SMASH {score}
      </Text>
      <View style={styles.grid}>
        {HOLES.map((i) => (
          <Pressable key={i} style={styles.hole} onPress={() => whack(i)}>
            {i === active ? (
              <Image source={rot.image} style={styles.img} />
            ) : (
              <View style={styles.empty} />
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  arena: { flex: 1, alignItems: 'center', paddingTop: 18 },
  title: { color: '#fff', fontWeight: '900', fontSize: 26 },
  meta: { color: '#111', fontWeight: '900', marginTop: 4 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 330,
    justifyContent: 'center',
    gap: 12,
    marginTop: 22,
  },
  hole: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#00000099',
    borderWidth: 4,
    borderColor: '#ffff00',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  img: { width: 92, height: 92 },
  empty: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#111' },
});
