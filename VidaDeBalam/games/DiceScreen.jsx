import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme';

const DICE = ['dice-1', 'dice-2', 'dice-3', 'dice-4', 'dice-5', 'dice-6'];

export default function DiceScreen() {
  const [value, setValue] = useState(1);
  const [rolling, setRolling] = useState(false);

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    let ticks = 0;
    const interval = setInterval(() => {
      setValue(Math.floor(Math.random() * 6) + 1);
      ticks += 1;
      if (ticks >= 8) {
        clearInterval(interval);
        setValue(Math.floor(Math.random() * 6) + 1);
        setRolling(false);
      }
    }, 80);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>MINIJUEGO</Text>
      <Text style={styles.title}>Lanzar Dados</Text>
      <View style={styles.stage}>
        <MaterialCommunityIcons
          name={DICE[value - 1]}
          size={110}
          color={colors.accentSoft}
        />
      </View>
      <Text style={styles.value}>Resultado: {value}</Text>
      <Pressable
        style={[styles.button, rolling && styles.buttonDisabled]}
        onPress={roll}
        disabled={rolling}
      >
        <MaterialCommunityIcons name="dice-multiple" size={22} color="#fff" />
        <Text style={styles.buttonText}>
          {rolling ? 'Lanzando...' : 'Lanzar dado'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  kicker: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 24,
  },
  stage: {
    width: 180,
    height: 180,
    borderRadius: 28,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  value: {
    fontSize: 18,
    color: colors.textMuted,
    marginBottom: 28,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.accent,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
