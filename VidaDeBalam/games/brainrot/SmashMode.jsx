import { useEffect, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
  useWindowDimensions,
} from 'react-native';
import { CREATURES, NEON, pickCreature, rand } from './shared';

const DEFAULT_MODS = {
  speed: 1,
  multiplier: 1,
  sizeMul: 1,
  frozen: false,
  flip: false,
  freezeTimer: false,
  reverse: false,
  onlyTagged: false,
};

const EVENTS = [
  { id: 'fanum', title: 'FANUM TAX', hint: '-35% AURA', duration: 2000, mods: {} },
  { id: 'ohio', title: 'OHIO SPEED', hint: '2.8x SPEED', duration: 4500, mods: { speed: 2.8 } },
  { id: 'rizz', title: 'RIZZ x5', hint: 'PUNTOS LOCOS', duration: 5000, mods: { multiplier: 5 } },
  { id: 'skibidi', title: 'SKIBIDI FLIP', hint: 'MUNDO AL REVÉS', duration: 4000, mods: { flip: true } },
  { id: 'gyatt', title: 'GYATT', hint: 'GIGANTES', duration: 4500, mods: { sizeMul: 2.1 } },
  { id: 'npc', title: 'NPC LOCK', hint: 'FREEZE', duration: 1600, mods: { frozen: true } },
  { id: 'sigma', title: 'SIGMA', hint: 'SLOWMO x6', duration: 4500, mods: { speed: 0.28, multiplier: 6 } },
  { id: 'raid', title: 'BOMBARDIRO RAID', hint: 'INVASIÓN', duration: 4000, mods: { speed: 1.5 } },
  { id: 'chopped', title: 'CHOPPED', hint: 'MINIS', duration: 4500, mods: { sizeMul: 0.45, speed: 1.7 } },
  { id: 'lockedin', title: 'LOCKED IN', hint: 'TIMER STOP x3', duration: 4000, mods: { freezeTimer: true, multiplier: 3 } },
  { id: 'cooked', title: 'COOKED', hint: 'TAPS RESTAN', duration: 3200, mods: { reverse: true } },
  { id: 'sixseven', title: '6 7', hint: 'SOLO LOS 67', duration: 5000, mods: { onlyTagged: true, multiplier: 8 } },
  { id: 'crash', title: 'CRASH OUT', hint: 'CAOS TOTAL', duration: 4000, mods: { speed: 3.2, sizeMul: 1.4, flip: true } },
];

function spawn(width, height, id, options = {}) {
  const type = pickCreature(options.key);
  const size = options.size ?? rand(88, 138);
  return {
    id,
    key: type.key,
    name: type.name,
    image: type.image,
    x: rand(8, Math.max(9, width - size - 8)),
    y: rand(120, Math.max(121, height - size - 130)),
    vx: rand(2.2, 5.2) * (Math.random() < 0.5 ? -1 : 1),
    vy: rand(2.2, 5.2) * (Math.random() < 0.5 ? -1 : 1),
    size,
    tagged: Boolean(options.tagged),
  };
}

export default function SmashMode({ seconds = 40, onAura, onDone }) {
  const { width, height } = useWindowDimensions();
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [aura, setAura] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bgIndex, setBgIndex] = useState(0);
  const [shake, setShake] = useState({ x: 0, y: 0, rot: 0 });
  const [creatures, setCreatures] = useState([]);
  const [pops, setPops] = useState([]);
  const [banner, setBanner] = useState(null);
  const nextId = useRef(1);
  const mods = useRef({ ...DEFAULT_MODS });
  const comboStamp = useRef(0);
  const eventTimeout = useRef(null);
  const lastEvent = useRef(null);
  const popId = useRef(1);

  const addAura = (delta) => {
    setAura((prev) => {
      const next = Math.max(0, prev + delta);
      onAura?.(delta);
      return next;
    });
  };

  const addPop = (x, y, text) => {
    const id = popId.current;
    popId.current += 1;
    setPops((list) => [...list.slice(-12), { id, x, y, text }]);
    setTimeout(() => {
      setPops((list) => list.filter((p) => p.id !== id));
    }, 700);
  };

  const clearEvent = () => {
    mods.current = { ...DEFAULT_MODS };
    setBanner(null);
    setCreatures((list) => list.map((c) => ({ ...c, tagged: false })));
  };

  const triggerEvent = () => {
    let def = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    if (def.id === lastEvent.current) {
      def = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    }
    lastEvent.current = def.id;
    mods.current = { ...DEFAULT_MODS, ...def.mods };
    setBanner(def);
    Vibration.vibrate(def.id === 'crash' ? [0, 40, 40, 80] : 70);

    if (def.id === 'fanum') {
      setAura((prev) => {
        const loss = Math.max(800, Math.floor(prev * 0.35));
        onAura?.(-loss);
        return Math.max(0, prev - loss);
      });
    }
    if (def.id === 'raid') {
      setCreatures((list) => {
        const extras = Array.from({ length: 8 }, () => {
          nextId.current += 1;
          return spawn(width, height, nextId.current, {
            key: 'bombardiro',
            size: rand(70, 110),
          });
        });
        return [...list, ...extras].slice(0, 16);
      });
    }
    if (def.id === 'sixseven') {
      setCreatures((list) => {
        const picks = [...list.keys()]
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        return list.map((c, i) => ({ ...c, tagged: picks.includes(i) }));
      });
    }
    if (eventTimeout.current) clearTimeout(eventTimeout.current);
    eventTimeout.current = setTimeout(clearEvent, def.duration);
  };

  useEffect(() => {
    nextId.current = 16;
    setCreatures(
      Array.from({ length: 10 }, (_, i) => spawn(width, height, i + 1)),
    );
  }, [width, height]);

  useEffect(() => {
    const colorTick = setInterval(() => {
      setBgIndex((i) => i + 1);
      const intensity = mods.current.flip || mods.current.speed > 2 ? 18 : 10;
      setShake({
        x: rand(-intensity, intensity),
        y: rand(-intensity, intensity),
        rot: rand(-7, 7),
      });
    }, 120);

    let finished = false;
    const timer = setInterval(() => {
      if (mods.current.freezeTimer) return;
      setTimeLeft((t) => {
        if (t <= 1) {
          if (!finished) {
            finished = true;
            onDone?.();
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    const events = setInterval(triggerEvent, 2800);
    const first = setTimeout(triggerEvent, 900);

    const loop = setInterval(() => {
      const speed = mods.current.speed;
      setCreatures((list) =>
        list.map((c) => {
          const drawSize = c.size * mods.current.sizeMul;
          let { x, y, vx, vy } = c;
          x += vx * speed;
          y += vy * speed;
          if (x < 6 || x > width - drawSize - 6) vx *= -1;
          if (y < 108 || y > height - drawSize - 120) vy *= -1;
          return {
            ...c,
            x: Math.min(Math.max(6, x), Math.max(6, width - drawSize - 6)),
            y: Math.min(Math.max(108, y), Math.max(108, height - drawSize - 120)),
            vx,
            vy,
          };
        }),
      );
    }, 16);

    return () => {
      clearInterval(colorTick);
      clearInterval(timer);
      clearInterval(events);
      clearInterval(loop);
      clearTimeout(first);
      if (eventTimeout.current) clearTimeout(eventTimeout.current);
    };
  }, [width, height]);

  const smash = (creature) => {
    if (mods.current.frozen) return;
    if (mods.current.onlyTagged && !creature.tagged) {
      addAura(-500);
      addPop(creature.x, creature.y, 'NPC');
      return;
    }
    const now = Date.now();
    const nextCombo = now - comboStamp.current < 800 ? combo + 1 : 1;
    comboStamp.current = now;
    setCombo(nextCombo);
    const delta = Math.round(
      900 * mods.current.multiplier * (1 + Math.min(nextCombo, 20) * 0.2),
    );
    const applied = mods.current.reverse ? -delta : delta;
    addAura(applied);
    addPop(creature.x, creature.y, applied > 0 ? `+${applied}` : `${applied}`);
    Vibration.vibrate(28);
    setCreatures((list) => {
      const kept = list.filter((c) => c.id !== creature.id);
      nextId.current += 1;
      return [
        ...kept,
        spawn(width, height, nextId.current, {
          tagged: mods.current.onlyTagged ? Math.random() < 0.4 : false,
        }),
      ];
    });
  };

  const bg = NEON[bgIndex % NEON.length];
  const fg = NEON[(bgIndex + 3) % NEON.length];
  const sizeMul = banner ? mods.current.sizeMul : 1;

  return (
    <View
      style={[
        styles.arena,
        {
          backgroundColor: bg,
          transform: [
            { translateX: shake.x },
            { translateY: shake.y },
            { rotate: `${shake.rot}deg` },
            { scaleY: mods.current.flip ? -1 : 1 },
          ],
        },
      ]}
    >
      {CREATURES.slice(0, 6).map((c, i) => (
        <Image
          key={`rain-${c.key}`}
          source={c.image}
          style={[
            styles.rain,
            {
              left: (width / 6) * i,
              opacity: 0.18,
              transform: [{ rotate: `${(bgIndex * 17 + i * 40) % 360}deg` }],
            },
          ]}
        />
      ))}
      {banner ? (
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>{banner.title}</Text>
          <Text style={styles.bannerHint}>{banner.hint}</Text>
        </View>
      ) : null}
      <View style={styles.hud}>
        <Text style={styles.hudText}>AURA {aura}</Text>
        <Text style={[styles.hudText, combo > 1 && { color: '#ffff00' }]}>
          {combo > 1 ? `COMBO x${combo}` : 'SMASH'}
        </Text>
        <Text style={styles.hudText}>{timeLeft}s</Text>
      </View>
      {creatures.map((c) => {
        const drawSize = Math.max(42, c.size * sizeMul);
        return (
          <Pressable
            key={c.id}
            onPress={() => smash(c)}
            style={[
              styles.creature,
              {
                left: c.x,
                top: c.y,
                width: drawSize,
                height: drawSize,
                borderColor: c.tagged ? '#ffff00' : fg,
                borderWidth: c.tagged ? 6 : 3,
              },
            ]}
          >
            <Image source={c.image} style={styles.sprite} />
            {c.tagged ? <Text style={styles.tag}>67</Text> : null}
          </Pressable>
        );
      })}
      {pops.map((p) => (
        <Text key={p.id} style={[styles.pop, { left: p.x, top: p.y }]}>
          {p.text}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  arena: { flex: 1, overflow: 'hidden' },
  rain: { position: 'absolute', top: 180, width: 90, height: 90 },
  banner: {
    marginHorizontal: 12,
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.78)',
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#ffff00',
    padding: 8,
    alignItems: 'center',
  },
  bannerTitle: { color: '#ffff00', fontWeight: '900', fontSize: 22 },
  bannerHint: { color: '#fff', fontWeight: '800', fontSize: 12 },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  hudText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
    textShadowColor: '#000',
    textShadowRadius: 8,
  },
  creature: {
    position: 'absolute',
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#00000055',
  },
  sprite: { width: '100%', height: '100%' },
  tag: {
    position: 'absolute',
    bottom: 4,
    alignSelf: 'center',
    backgroundColor: '#ffff00',
    color: '#111',
    fontWeight: '900',
    paddingHorizontal: 6,
    borderRadius: 6,
    overflow: 'hidden',
  },
  pop: {
    position: 'absolute',
    color: '#ffff00',
    fontWeight: '900',
    fontSize: 22,
    textShadowColor: '#000',
    textShadowRadius: 6,
  },
});
