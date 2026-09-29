import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRef } from 'react';
import { colors } from '../theme';
import { useWins } from '../context/WinsContext';
import { play } from '../sounds/sfx';

const logo = require('../assets/balam-logo.png');

const GAMES = [
  { screen: 'Dados', label: 'Dados', icon: 'dice-6', color: '#ff6b81' },
  {
    screen: 'Memorama',
    label: 'Memorama',
    icon: 'cards',
    color: '#f5c542',
    winKey: 'memorama',
  },
  {
    screen: 'TicTacToe',
    label: 'Tic Tac Toe',
    icon: 'grid',
    color: '#7c5cff',
    winKey: 'tictactoe',
  },
  {
    screen: 'RPS',
    label: 'PPT',
    icon: 'hand-back-right',
    color: '#2ed573',
    winKey: 'rps',
  },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const { wins, winsCount, secretUnlocked, unlockSecret } = useWins();
  const taps = useRef({ count: 0, last: 0 });

  const onJaguar = () => {
    if (secretUnlocked) {
      play('intro');
      navigation.navigate('Juegos', { screen: 'Brainrot' });
      return;
    }
    const now = Date.now();
    if (now - taps.current.last > 1400) taps.current.count = 0;
    taps.current.last = now;
    taps.current.count += 1;
    play('tap');
    if (taps.current.count >= 5) {
      taps.current.count = 0;
      unlockSecret('Le picaste al jaguar 5 veces. El arcade secreto es tuyo.');
      setTimeout(() => {
        navigation.navigate('Juegos', { screen: 'Brainrot' });
      }, 500);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Pressable onPress={onJaguar} style={({ pressed }) => pressed && { opacity: 0.8 }}>
          <Image source={logo} style={styles.logo} />
        </Pressable>
        <Text style={styles.title}>Vida de Balam</Text>
        <Text style={styles.subtitle}>
          Gana Memorama, Tic Tac Toe y PPT para desbloquear el juego secreto
        </Text>
        <Text style={styles.progress}>
          {secretUnlocked
            ? '💀 SECRETO DESBLOQUEADO'
            : `Victorias ${winsCount}/3`}
        </Text>
      </View>

      <View style={styles.grid}>
        {GAMES.map((game) => {
          const beaten = game.winKey ? wins[game.winKey] : false;
          return (
            <Pressable
              key={game.screen}
              style={({ pressed }) => [
                styles.card,
                beaten && styles.cardWon,
                pressed && styles.cardPressed,
              ]}
              onPress={() =>
                navigation.navigate('Juegos', { screen: game.screen })
              }
            >
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: `${game.color}22` },
                ]}
              >
                <MaterialCommunityIcons
                  name={game.icon}
                  size={28}
                  color={game.color}
                />
              </View>
              <Text style={styles.cardLabel}>{game.label}</Text>
              {beaten ? <Text style={styles.wonTag}>GANADO</Text> : null}
            </Pressable>
          );
        })}

        <Pressable
          style={({ pressed }) => [
            styles.card,
            secretUnlocked ? styles.secretCard : styles.lockedCard,
            pressed && styles.cardPressed,
          ]}
          onPress={() => {
            if (!secretUnlocked) return;
            navigation.navigate('Juegos', { screen: 'Brainrot' });
          }}
        >
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: secretUnlocked ? '#ff003c33' : '#ffffff10',
              },
            ]}
          >
            <MaterialCommunityIcons
              name={secretUnlocked ? 'skull' : 'lock'}
              size={28}
              color={secretUnlocked ? '#ff003c' : colors.textMuted}
            />
          </View>
          <Text
            style={[
              styles.cardLabel,
              !secretUnlocked && { color: colors.textMuted },
            ]}
          >
            {secretUnlocked ? 'Brainrot' : '???'}
          </Text>
          <Text style={styles.wonTag}>
            {secretUnlocked ? 'SECRETO' : 'BLOQUEADO'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 20,
  },
  hero: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 28,
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  progress: {
    marginTop: 12,
    color: colors.gold,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  card: {
    width: '47%',
    backgroundColor: colors.bgCard,
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardWon: {
    borderColor: colors.success,
  },
  secretCard: {
    borderColor: '#ff003c',
    backgroundColor: '#2a0010',
  },
  lockedCard: {
    opacity: 0.7,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  wonTag: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '800',
    color: colors.gold,
    letterSpacing: 1,
  },
});
