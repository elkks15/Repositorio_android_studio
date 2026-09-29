import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Magnetometer } from 'expo-sensors';

const SHIP = 22;
const COIN_R = 12;
const ROCK_R = 20;
const COIN_COUNT = 6;
const ROCK_COUNT = 5;

function wrap360(deg) {
  return ((deg % 360) + 360) % 360;
}

function lerpAngle(from, to, t) {
  const diff = ((to - from + 540) % 360) - 180;
  return wrap360(from + diff * t);
}

function magHeading(x, y) {
  return wrap360((Math.atan2(-x, y) * 180) / Math.PI);
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function wrap(v, max) {
  if (v < 0) return v + max;
  if (v > max) return v - max;
  return v;
}

function farFrom(x, y, other, min) {
  return Math.hypot(x - other.x, y - other.y) > min;
}

function makeCoin(w, h, ship) {
  let x = rand(30, w - 30);
  let y = rand(30, h - 30);
  let guard = 0;
  while (ship && !farFrom(x, y, ship, 90) && guard < 12) {
    x = rand(30, w - 30);
    y = rand(30, h - 30);
    guard += 1;
  }
  return { x, y, pulse: Math.random() * Math.PI * 2 };
}

function makeRock(w, h, ship) {
  let x = rand(40, w - 40);
  let y = rand(40, h - 40);
  let guard = 0;
  while (ship && !farFrom(x, y, ship, 120) && guard < 12) {
    x = rand(40, w - 40);
    y = rand(40, h - 40);
    guard += 1;
  }
  return {
    x,
    y,
    vx: rand(-70, 70),
    vy: rand(-70, 70),
    spin: rand(0, 360),
  };
}

function makeStars(w, h) {
  return Array.from({ length: 28 }, () => ({
    x: rand(0, w),
    y: rand(0, h),
    s: rand(1.2, 3.2),
    o: rand(0.25, 0.9),
  }));
}

export default function MagnetGame() {
  const magRef = useRef({ x: 0, y: 0, z: 0 });
  const headingRef = useRef(0);
  const offsetRef = useRef(0);
  const gameRef = useRef(null);
  const [view, setView] = useState(null);
  const [hud, setHud] = useState({
    score: 0,
    lives: 3,
    combo: 0,
    turbo: false,
    over: false,
    mag: '0 µT',
  });

  const boot = (w, h) => {
    const ship = { x: w / 2, y: h / 2 };
    gameRef.current = {
      w,
      h,
      ship,
      heading: 0,
      coins: Array.from({ length: COIN_COUNT }, () => makeCoin(w, h, ship)),
      rocks: Array.from({ length: ROCK_COUNT }, () => makeRock(w, h, ship)),
      stars: makeStars(w, h),
      score: 0,
      lives: 3,
      combo: 0,
      comboUntil: 0,
      invulnUntil: 0,
      over: false,
      flash: 0,
    };
  };

  const restart = () => {
    const g = gameRef.current;
    if (!g) return;
    boot(g.w, g.h);
    offsetRef.current = wrap360(headingRef.current + offsetRef.current);
    headingRef.current = 0;
    setHud({
      score: 0,
      lives: 3,
      combo: 0,
      turbo: false,
      over: false,
      mag: '0 µT',
    });
  };

  useEffect(() => {
    let sub;
    let raf;
    let last = Date.now();
    let cancelled = false;
    let hudAt = 0;

    const start = async () => {
      await Magnetometer.requestPermissionsAsync();
      Magnetometer.setUpdateInterval(32);
      sub = Magnetometer.addListener(({ x = 0, y = 0, z = 0 }) => {
        magRef.current = { x, y, z };
        const display = wrap360(magHeading(x, y) - offsetRef.current);
        headingRef.current = lerpAngle(headingRef.current, display, 0.35);
      });

      const loop = () => {
        if (cancelled) return;
        raf = requestAnimationFrame(loop);
        const g = gameRef.current;
        if (!g || g.over) return;

        const now = Date.now();
        const dt = Math.min((now - last) / 1000, 0.04);
        last = now;

        const { x, y, z } = magRef.current;
        const field = Math.hypot(x, y, z);
        const turbo = field > 85;
        const heading = headingRef.current;
        g.heading = heading;
        const rad = (heading * Math.PI) / 180;
        const speed = (turbo ? 280 : 155) + g.score * 0.35;
        g.ship.x = wrap(g.ship.x + Math.sin(rad) * speed * dt, g.w);
        g.ship.y = wrap(g.ship.y - Math.cos(rad) * speed * dt, g.h);

        if (now > g.comboUntil) g.combo = 0;

        g.coins.forEach((coin, i) => {
          coin.pulse += dt * 5;
          if (Math.hypot(coin.x - g.ship.x, coin.y - g.ship.y) < SHIP + COIN_R) {
            g.combo += 1;
            g.comboUntil = now + 1800;
            g.score += 10 * g.combo;
            g.coins[i] = makeCoin(g.w, g.h, g.ship);
          }
        });

        g.rocks.forEach((rock) => {
          rock.x = wrap(rock.x + rock.vx * dt, g.w);
          rock.y = wrap(rock.y + rock.vy * dt, g.h);
          rock.spin += dt * 80;
          if (
            now > g.invulnUntil &&
            Math.hypot(rock.x - g.ship.x, rock.y - g.ship.y) < SHIP + ROCK_R - 6
          ) {
            g.lives -= 1;
            g.combo = 0;
            g.flash = now + 220;
            g.invulnUntil = now + 900;
            if (g.lives <= 0) {
              g.over = true;
            }
          }
        });

        if (now - hudAt > 40) {
          hudAt = now;
          setView({
            heading: g.heading,
            ship: { ...g.ship },
            coins: g.coins.map((c) => ({ ...c })),
            rocks: g.rocks.map((r) => ({ ...r })),
            stars: g.stars,
            flash: now < g.flash,
            blink: now < g.invulnUntil && Math.floor(now / 80) % 2 === 0,
            w: g.w,
            h: g.h,
          });
          setHud({
            score: g.score,
            lives: g.lives,
            combo: g.combo,
            turbo,
            over: g.over,
            mag: `${field.toFixed(0)} µT`,
          });
        }
      };

      loop();
    };

    start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      sub?.remove();
    };
  }, []);

  return (
    <View style={styles.root}>
      <View style={styles.hud}>
        <Text style={styles.kicker}>Magnetómetro</Text>
        <Text style={styles.title}>
          {hud.turbo ? '⚡ TURBO MAGNÉTICO' : hud.combo > 1 ? `COMBO x${hud.combo}` : 'Nave polar'}
        </Text>
        <Text style={styles.stats}>
          {hud.score} pts    {'❤️'.repeat(Math.max(0, hud.lives))}    {hud.mag}
        </Text>
        <Text style={styles.hint}>Gira el celular para dirigir. Acércalo a un imán para turbo.</Text>
      </View>

      <View
        style={[styles.arena, view?.flash && styles.arenaHit]}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          if (!gameRef.current) boot(width, height);
          else {
            gameRef.current.w = width;
            gameRef.current.h = height;
          }
        }}
      >
        {view?.stars?.map((star, i) => (
          <View
            key={`s-${i}`}
            style={[
              styles.star,
              {
                left: star.x,
                top: star.y,
                width: star.s,
                height: star.s,
                opacity: star.o,
              },
            ]}
          />
        ))}

        {view?.coins?.map((coin, i) => (
          <View
            key={`c-${i}`}
            style={[
              styles.coin,
              {
                left: coin.x - COIN_R,
                top: coin.y - COIN_R,
                transform: [{ scale: 1 + Math.sin(coin.pulse) * 0.12 }],
              },
            ]}
          />
        ))}

        {view?.rocks?.map((rock, i) => (
          <View
            key={`r-${i}`}
            style={[
              styles.rock,
              {
                left: rock.x - ROCK_R,
                top: rock.y - ROCK_R,
                transform: [{ rotate: `${rock.spin}deg` }],
              },
            ]}
          >
            <Text style={styles.rockFace}>✸</Text>
          </View>
        ))}

        {view?.ship && !view.blink ? (
          <View
            style={[
              styles.shipWrap,
              {
                left: view.ship.x - SHIP,
                top: view.ship.y - SHIP,
                transform: [{ rotate: `${view.heading}deg` }],
              },
            ]}
          >
            <View style={styles.flame} />
            <Text style={styles.ship}>🚀</Text>
          </View>
        ) : null}

        {hud.over ? (
          <View style={styles.over}>
            <Text style={styles.overTitle}>Nave destruida</Text>
            <Text style={styles.overScore}>{hud.score} puntos</Text>
            <Pressable style={styles.overBtn} onPress={restart}>
              <Text style={styles.overBtnText}>Otra ronda</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <Pressable style={styles.calibrate} onPress={restart}>
        <Text style={styles.calibrateText}>Calibrar / Reiniciar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050716',
    paddingTop: 48,
  },
  hud: {
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  kicker: {
    color: '#8b7cff',
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  stats: {
    color: '#d6dcff',
    marginTop: 6,
    fontWeight: '700',
  },
  hint: {
    color: '#8b93c7',
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
  },
  arena: {
    flex: 1,
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#0b1028',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#5b4dff',
  },
  arenaHit: {
    backgroundColor: '#3a1020',
    borderColor: '#ff5b7a',
  },
  star: {
    position: 'absolute',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  coin: {
    position: 'absolute',
    width: COIN_R * 2,
    height: COIN_R * 2,
    borderRadius: COIN_R,
    backgroundColor: '#ffe45e',
    borderWidth: 3,
    borderColor: '#fff3b0',
  },
  rock: {
    position: 'absolute',
    width: ROCK_R * 2,
    height: ROCK_R * 2,
    borderRadius: 10,
    backgroundColor: '#6b3a2f',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#d18b6a',
  },
  rockFace: {
    color: '#ffd0b8',
    fontSize: 18,
    fontWeight: '800',
  },
  shipWrap: {
    position: 'absolute',
    width: SHIP * 2,
    height: SHIP * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ship: {
    fontSize: 28,
  },
  flame: {
    position: 'absolute',
    bottom: 0,
    width: 8,
    height: 14,
    borderRadius: 6,
    backgroundColor: '#ff9a3c',
  },
  over: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,7,22,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  overScore: {
    color: '#ffe45e',
    fontSize: 20,
    marginTop: 8,
    fontWeight: '700',
  },
  overBtn: {
    marginTop: 16,
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  overBtnText: {
    color: '#fff',
    fontWeight: '800',
  },
  calibrate: {
    alignSelf: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(91,77,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  calibrateText: {
    color: '#d6dcff',
    fontWeight: '700',
  },
});
