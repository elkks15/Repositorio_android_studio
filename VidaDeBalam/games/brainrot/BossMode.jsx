import { useEffect, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import { NEON, pickCreature, rand } from './shared';

export default function BossMode({ seconds = 14, onAura, onDone }) {
  const boss = pickCreature('tungtung');
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [hp, setHp] = useState(12000);
  const [hits, setHits] = useState(0);
  const [crit, setCrit] = useState(false);
  const [bg, setBg] = useState(0);
  const maxHp = 12000;
  const doneRef = useRef(false);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          if (!doneRef.current) {
            doneRef.current = true;
            onDone?.();
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    const c = setInterval(() => setBg((i) => i + 1), 90);
    return () => {
      clearInterval(t);
      clearInterval(c);
    };
  }, []);

  const punch = () => {
    const isCrit = Math.random() < 0.22;
    const dmg = Math.round(isCrit ? rand(900, 1600) : rand(280, 620));
    setCrit(isCrit);
    setHits((h) => h + 1);
    setHp((h) => {
      const next = Math.max(0, h - dmg);
        if (next <= 0 && !doneRef.current) {
          doneRef.current = true;
          onAura?.(8000);
          Vibration.vibrate([0, 40, 40, 80, 40, 120]);
          setTimeout(() => onDone?.(), 400);
        }
      return next;
    });
    onAura?.(isCrit ? 420 : 180);
    Vibration.vibrate(isCrit ? 70 : 25);
  };

  const pct = hp / maxHp;
  const color = NEON[bg % NEON.length];

  return (
    <Pressable
      style={[styles.arena, { backgroundColor: color }]}
      onPress={punch}
    >
      <Text style={styles.kicker}>BOSS · TUNG TUNG TUNG SAHUR</Text>
      <Text style={styles.timer}>{timeLeft}s · HITS {hits}</Text>
      <View style={styles.bar}>
        <View style={[styles.hp, { width: `${pct * 100}%` }]} />
      </View>
      <Text style={styles.hpText}>{hp} HP</Text>
      <Image
        source={boss.image}
        style={[
          styles.boss,
          {
            transform: [
              { scale: crit ? 1.12 : 1 },
              { rotate: `${(bg % 2 === 0 ? -6 : 6) + (1 - pct) * 12}deg` },
            ],
          },
        ]}
      />
      <Text style={styles.hint}>
        {hp <= 0 ? 'BOSS DOWN · GOAT' : crit ? 'CRITICAL GYATT' : 'TAPEALO SIN PARAR'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  arena: { flex: 1, alignItems: 'center', paddingTop: 16 },
  kicker: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
  },
  timer: { color: '#ffff00', fontWeight: '900', marginTop: 6 },
  bar: {
    width: '86%',
    height: 18,
    backgroundColor: '#00000088',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  hp: { height: '100%', backgroundColor: '#ff003c' },
  hpText: { color: '#fff', fontWeight: '900', marginTop: 6, fontSize: 18 },
  boss: { width: 280, height: 280, marginTop: 18 },
  hint: {
    marginTop: 18,
    color: '#111',
    fontWeight: '900',
    fontSize: 20,
    backgroundColor: '#ffff00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    overflow: 'hidden',
  },
});
