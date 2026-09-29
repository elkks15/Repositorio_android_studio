import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

const SOURCES = {
  tap: require('../assets/sfx/tap.wav'),
  smash: require('../assets/sfx/smash.wav'),
  combo: require('../assets/sfx/combo.wav'),
  win: require('../assets/sfx/win.wav'),
  lose: require('../assets/sfx/lose.wav'),
  event: require('../assets/sfx/event.wav'),
  dice: require('../assets/sfx/dice.wav'),
  match: require('../assets/sfx/match.wav'),
  flip: require('../assets/sfx/flip.wav'),
  place: require('../assets/sfx/place.wav'),
  boss: require('../assets/sfx/boss.wav'),
  crit: require('../assets/sfx/crit.wav'),
  jackpot: require('../assets/sfx/jackpot.wav'),
  unlock: require('../assets/sfx/unlock.wav'),
  spin: require('../assets/sfx/spin.wav'),
  miss: require('../assets/sfx/miss.wav'),
  boom: require('../assets/sfx/boom.wav'),
  intro: require('../assets/sfx/intro.wav'),
};

const POOL_SIZE = {
  tap: 5,
  smash: 4,
  place: 3,
  flip: 3,
  boss: 3,
};

const pools = {};
const cursors = {};
let ready = false;
let booting = null;

export function initSfx() {
  if (ready) return Promise.resolve();
  if (booting) return booting;
  booting = (async () => {
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        interruptionMode: 'mixWithOthers',
      });
      Object.entries(SOURCES).forEach(([name, source]) => {
        const size = POOL_SIZE[name] ?? 2;
        pools[name] = Array.from({ length: size }, () =>
          createAudioPlayer(source),
        );
        cursors[name] = 0;
      });
      ready = true;
    } catch (error) {
      console.warn('No se pudieron iniciar los sonidos', error);
    }
  })();
  return booting;
}

export function play(name) {
  const pool = pools[name];
  if (!pool?.length) {
    initSfx().then(() => playNow(name));
    return;
  }
  playNow(name);
}

function playNow(name) {
  const pool = pools[name];
  if (!pool?.length) return;
  const i = cursors[name] % pool.length;
  cursors[name] = i + 1;
  const player = pool[i];
  try {
    const seek = player.seekTo(0);
    if (seek && typeof seek.then === 'function') {
      seek.then(() => player.play()).catch(() => player.play());
    } else {
      player.play();
    }
  } catch {
    try {
      player.play();
    } catch {
      // ignore
    }
  }
}
