import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Alert } from 'react-native';
import { play } from '../sounds/sfx';

const GAME_KEYS = ['memorama', 'tictactoe', 'rps'];

const WinsContext = createContext(null);

export function WinsProvider({ children }) {
  const [wins, setWins] = useState({
    memorama: false,
    tictactoe: false,
    rps: false,
  });
  const [forcedUnlock, setForcedUnlock] = useState(false);

  const secretUnlocked =
    forcedUnlock || GAME_KEYS.every((key) => wins[key]);
  const winsCount = GAME_KEYS.filter((key) => wins[key]).length;

  const unlockSecret = useCallback((message) => {
    setForcedUnlock((prev) => {
      if (prev) return prev;
      play('unlock');
      setTimeout(() => {
        Alert.alert(
          '💀 ARCADE SECRETO',
          message || 'El jaguar te dejó pasar. El Brainrot te espera.',
        );
      }, 250);
      return true;
    });
  }, []);

  const markWin = useCallback((game) => {
    setWins((prev) => {
      if (prev[game]) return prev;
      const next = { ...prev, [game]: true };
      const unlocked = GAME_KEYS.every((key) => next[key]);
      const wasLocked = !GAME_KEYS.every((key) => prev[key]);
      if (unlocked && wasLocked && !forcedUnlock) {
        play('unlock');
        setTimeout(() => {
          Alert.alert(
            '💀 JUEGO SECRETO DESBLOQUEADO',
            'Ganaste los 3 juegos. El Brainrot Epiléptico te está esperando. No hay vuelta atrás.',
          );
        }, 400);
      }
      return next;
    });
  }, [forcedUnlock]);

  const value = useMemo(
    () => ({ wins, markWin, secretUnlocked, winsCount, unlockSecret }),
    [wins, markWin, secretUnlocked, winsCount, unlockSecret],
  );

  return (
    <WinsContext.Provider value={value}>{children}</WinsContext.Provider>
  );
}

export function useWins() {
  const ctx = useContext(WinsContext);
  if (!ctx) {
    throw new Error('useWins debe usarse dentro de WinsProvider');
  }
  return ctx;
}
