import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme';
import { useWins } from '../context/WinsContext';

const CHOICES = [
  { id: 'piedra', label: 'Piedra', icon: 'circle' },
  { id: 'papel', label: 'Papel', icon: 'newspaper-variant-outline' },
  { id: 'tijera', label: 'Tijera', icon: 'content-cut' },
];

function getResult(player, cpu) {
  if (player === cpu) return 'Empate';
  if (
    (player === 'piedra' && cpu === 'tijera') ||
    (player === 'papel' && cpu === 'piedra') ||
    (player === 'tijera' && cpu === 'papel')
  ) {
    return '¡Ganaste!';
  }
  return 'Perdiste';
}

export default function RpsScreen() {
  const { markWin } = useWins();
  const [player, setPlayer] = useState(null);
  const [cpu, setCpu] = useState(null);
  const [result, setResult] = useState('');
  const [score, setScore] = useState({ win: 0, lose: 0, draw: 0 });

  const play = (choiceId) => {
    const cpuChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)].id;
    const outcome = getResult(choiceId, cpuChoice);
    setPlayer(choiceId);
    setCpu(cpuChoice);
    setResult(outcome);
    if (outcome === '¡Ganaste!') markWin('rps');
    setScore((prev) => {
      if (outcome === '¡Ganaste!') return { ...prev, win: prev.win + 1 };
      if (outcome === 'Perdiste') return { ...prev, lose: prev.lose + 1 };
      return { ...prev, draw: prev.draw + 1 };
    });
  };

  const iconOf = (id) => CHOICES.find((c) => c.id === id)?.icon ?? 'help';

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>MINIJUEGO</Text>
      <Text style={styles.title}>Piedra Papel Tijera</Text>
      <Text style={styles.secretHint}>Gana una ronda para el secreto</Text>
      <Text style={styles.score}>
        G {score.win} · P {score.lose} · E {score.draw}
      </Text>

      <View style={styles.vs}>
        <View style={styles.side}>
          <Text style={styles.sideLabel}>Tú</Text>
          <View style={styles.badge}>
            <MaterialCommunityIcons
              name={player ? iconOf(player) : 'account-question'}
              size={42}
              color={colors.accentSoft}
            />
          </View>
        </View>
        <Text style={styles.vsText}>VS</Text>
        <View style={styles.side}>
          <Text style={styles.sideLabel}>CPU</Text>
          <View style={styles.badge}>
            <MaterialCommunityIcons
              name={cpu ? iconOf(cpu) : 'robot'}
              size={42}
              color={colors.gold}
            />
          </View>
        </View>
      </View>

      {result ? <Text style={styles.result}>{result}</Text> : null}

      <View style={styles.choices}>
        {CHOICES.map((choice) => (
          <Pressable
            key={choice.id}
            style={({ pressed }) => [
              styles.choiceBtn,
              pressed && styles.choicePressed,
            ]}
            onPress={() => play(choice.id)}
          >
            <MaterialCommunityIcons
              name={choice.icon}
              size={30}
              color={colors.accentSoft}
            />
            <Text style={styles.choiceLabel}>{choice.label}</Text>
          </Pressable>
        ))}
      </View>
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
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  secretHint: {
    fontSize: 13,
    color: colors.gold,
    fontWeight: '600',
    marginBottom: 4,
  },
  score: {
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: 22,
    fontWeight: '600',
  },
  vs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  side: { alignItems: 'center', width: 100 },
  sideLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 8,
    fontWeight: '600',
  },
  badge: {
    width: 78,
    height: 78,
    borderRadius: 20,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    fontSize: 16,
    fontWeight: '800',
    marginHorizontal: 10,
    color: colors.accent,
  },
  result: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 22,
  },
  choices: { flexDirection: 'row', gap: 12 },
  choiceBtn: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    minWidth: 92,
  },
  choicePressed: { borderColor: colors.accent },
  choiceLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
});
