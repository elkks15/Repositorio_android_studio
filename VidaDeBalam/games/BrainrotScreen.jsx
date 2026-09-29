import { useMemo, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import { CREATURES, NEON, rankFor } from './brainrot/shared';
import SmashMode from './brainrot/SmashMode';
import BossMode from './brainrot/BossMode';
import SixtySevenMode from './brainrot/SixtySevenMode';
import SlotMode from './brainrot/SlotMode';
import ClickerMode from './brainrot/ClickerMode';
import WhackMode from './brainrot/WhackMode';
import { play } from '../sounds/sfx';

const CHAOS = [
  { id: 'smash', title: 'SMASH ROT', seconds: 12 },
  { id: 'whack', title: 'WHACK-A-ROT', seconds: 10 },
  { id: 'sixty', title: '6 7 REFLEX', seconds: 10 },
  { id: 'clicker', title: 'AURA CLICKER', seconds: 8 },
  { id: 'boss', title: 'TUNG TUNG BOSS', seconds: 14 },
  { id: 'slot', title: 'SLOTS JACKPOT', seconds: 10 },
];

const SOLO = [
  { id: 'chaos', title: 'CHAOS RUN', subtitle: '6 minijuegos seguidos', color: '#ff003c' },
  { id: 'smash', title: 'SMASH', subtitle: 'Aplasta brainrots', color: '#ff6b00' },
  { id: 'whack', title: 'WHACK', subtitle: 'Golpéalos al salir', color: '#ffff00' },
  { id: 'sixty', title: '6 7', subtitle: 'Reflejo puro', color: '#7c5cff' },
  { id: 'clicker', title: 'CLICKER', subtitle: 'Tap dopamina', color: '#00ff88' },
  { id: 'boss', title: 'BOSS', subtitle: 'Tung Tung Sahur', color: '#00e5ff' },
  { id: 'slot', title: 'SLOTS', subtitle: 'Jackpot italiano', color: '#ff00aa' },
];

export default function BrainrotScreen() {
  const [gate, setGate] = useState(true);
  const [mode, setMode] = useState(null);
  const [chaosIndex, setChaosIndex] = useState(0);
  const [aura, setAura] = useState(0);
  const [best, setBest] = useState(0);
  const [flash, setFlash] = useState(0);
  const auraRef = useRef(0);

  const addAura = (delta) => {
    auraRef.current = Math.max(0, auraRef.current + delta);
    setAura(auraRef.current);
    setFlash((n) => n + 1);
    if (delta >= 1000) Vibration.vibrate(24);
  };

  const start = (id) => {
    auraRef.current = 0;
    setAura(0);
    setChaosIndex(0);
    setMode(id);
    play('event');
    Vibration.vibrate(50);
  };

  const finish = () => {
    setBest((b) => Math.max(b, auraRef.current));
    play('win');
    setMode('result');
  };

  const nextChaos = () => {
    if (chaosIndex >= CHAOS.length - 1) {
      finish();
      return;
    }
    setChaosIndex((i) => i + 1);
  };

  const bg = NEON[flash % NEON.length];
  const currentChaos = CHAOS[chaosIndex];
  const rank = useMemo(() => rankFor(aura), [aura]);

  if (gate) {
    return (
      <View style={[styles.gate, { backgroundColor: '#090009' }]}>
        <Text style={styles.gateKicker}>ARCADE SECRETO</Text>
        <Text style={styles.gateTitle}>BRAINROT{'\n'}DOPAMINA</Text>
        <View style={styles.faces}>
          {CREATURES.map((c) => (
            <Image key={c.key} source={c.image} style={styles.face} />
          ))}
        </View>
        <Text style={styles.gateBody}>
          Chaos Run + 6 minijuegos. Luces, 67, bosses y zero thoughts.
        </Text>
        <Pressable
          style={styles.danger}
          onPress={() => {
            play('intro');
            setGate(false);
          }}
        >
          <Text style={styles.dangerText}>ENTRAR A LA LOCURA</Text>
        </Pressable>
      </View>
    );
  }

  if (mode === 'result') {
    return (
      <View style={[styles.gate, { backgroundColor: bg }]}>
        <Text style={styles.gateKicker}>RUN COOKED</Text>
        <Text style={styles.score}>{aura}</Text>
        <Text style={styles.rank}>{rank}</Text>
        <Text style={styles.best}>BEST {best}</Text>
        <Pressable style={styles.danger} onPress={() => start('chaos')}>
          <Text style={styles.dangerText}>OTRA CHAOS RUN</Text>
        </Pressable>
        <Pressable style={styles.ghostBtn} onPress={() => setMode(null)}>
          <Text style={styles.ghostText}>VOLVER AL ARCADE</Text>
        </Pressable>
      </View>
    );
  }

  const playId = mode === 'chaos' ? currentChaos.id : mode;
  const playSeconds = mode === 'chaos' ? currentChaos.seconds : undefined;
  const onDone = mode === 'chaos' ? nextChaos : finish;

  if (playId) {
    return (
      <View style={styles.fill}>
        {mode === 'chaos' ? (
          <View style={styles.chaosBar}>
            <Text style={styles.chaosText}>
              CHAOS {chaosIndex + 1}/{CHAOS.length} · {currentChaos.title}
            </Text>
            <Text style={styles.chaosAura}>AURA {aura}</Text>
          </View>
        ) : null}
        {playId === 'smash' ? (
          <SmashMode seconds={playSeconds ?? 36} onAura={addAura} onDone={onDone} />
        ) : null}
        {playId === 'whack' ? (
          <WhackMode seconds={playSeconds ?? 14} onAura={addAura} onDone={onDone} />
        ) : null}
        {playId === 'sixty' ? (
          <SixtySevenMode seconds={playSeconds ?? 14} onAura={addAura} onDone={onDone} />
        ) : null}
        {playId === 'clicker' ? (
          <ClickerMode seconds={playSeconds ?? 10} onAura={addAura} onDone={onDone} />
        ) : null}
        {playId === 'boss' ? (
          <BossMode seconds={playSeconds ?? 16} onAura={addAura} onDone={onDone} />
        ) : null}
        {playId === 'slot' ? (
          <SlotMode
            seconds={playSeconds ?? 14}
            onAura={addAura}
            onDone={onDone}
            autoPlay={mode === 'chaos'}
          />
        ) : null}
      </View>
    );
  }

  return (
    <ScrollView style={styles.hub} contentContainerStyle={styles.hubInner}>
      <Text style={styles.hubKicker}>GEN ALPHA ARCADE</Text>
      <Text style={styles.hubTitle}>DOPAMINA ROT</Text>
      <Text style={styles.best}>BEST AURA {best}</Text>
      <View style={styles.faces}>
        {CREATURES.map((c) => (
          <Image key={c.key} source={c.image} style={styles.face} />
        ))}
      </View>
      <View style={styles.grid}>
        {SOLO.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => start(item.id)}
            style={[
              styles.card,
              item.id === 'chaos' && styles.chaosCard,
              { borderColor: item.color },
            ]}
          >
            <Text style={[styles.cardTitle, { color: item.color }]}>
              {item.title}
            </Text>
            <Text style={styles.cardSub}>{item.subtitle}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#000' },
  gate: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },
  gateKicker: {
    color: '#ff4d6d',
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
  },
  gateTitle: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 42,
  },
  gateBody: {
    color: '#ddd',
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 22,
    fontSize: 15,
    fontWeight: '700',
  },
  faces: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 14,
  },
  face: { width: 64, height: 64, borderRadius: 16 },
  danger: {
    backgroundColor: '#ff003c',
    paddingHorizontal: 26,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#ffff00',
  },
  dangerText: { color: '#fff', fontWeight: '900', fontSize: 18 },
  ghostBtn: { marginTop: 14 },
  ghostText: { color: '#fff', fontWeight: '800' },
  score: { fontSize: 72, fontWeight: '900', color: '#ffff00' },
  rank: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 6 },
  best: { color: '#ffff00', fontWeight: '900', marginBottom: 10 },
  hub: { flex: 1, backgroundColor: '#07010a' },
  hubInner: { padding: 16, paddingBottom: 40 },
  hubKicker: {
    color: '#ff4d6d',
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
  },
  hubTitle: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 4,
  },
  grid: { gap: 10 },
  card: {
    borderWidth: 3,
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#140018',
  },
  chaosCard: { paddingVertical: 22, backgroundColor: '#2a0010' },
  cardTitle: { fontSize: 22, fontWeight: '900' },
  cardSub: { color: '#ccc', fontWeight: '700', marginTop: 4 },
  chaosBar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#111',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chaosText: { color: '#ffff00', fontWeight: '900', fontSize: 12 },
  chaosAura: { color: '#fff', fontWeight: '900', fontSize: 12 },
});
