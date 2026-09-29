import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { useWins } from '../context/WinsContext';

const EMOJIS = ['🍎', '🍌', '🍇', '🍊', '🍓', '🥝', '🍑', '🍉'];

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createDeck() {
  return shuffle(
    [...EMOJIS, ...EMOJIS].map((emoji, index) => ({
      id: index,
      emoji,
      flipped: false,
      matched: false,
    })),
  );
}

export default function MemoramaScreen() {
  const { markWin } = useWins();
  const [cards, setCards] = useState(createDeck);
  const [selected, setSelected] = useState([]);
  const [locked, setLocked] = useState(false);
  const won = useMemo(
    () => cards.length > 0 && cards.every((c) => c.matched),
    [cards],
  );

  useEffect(() => {
    if (won) markWin('memorama');
  }, [won, markWin]);

  const reset = () => {
    setCards(createDeck());
    setSelected([]);
    setLocked(false);
  };

  const onCardPress = (index) => {
    if (locked) return;
    const card = cards[index];
    if (card.flipped || card.matched || selected.includes(index)) return;

    const nextCards = cards.map((c, i) =>
      i === index ? { ...c, flipped: true } : c,
    );
    const nextSelected = [...selected, index];
    setCards(nextCards);
    setSelected(nextSelected);

    if (nextSelected.length === 2) {
      setLocked(true);
      const [a, b] = nextSelected;
      if (nextCards[a].emoji === nextCards[b].emoji) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) =>
              i === a || i === b ? { ...c, matched: true } : c,
            ),
          );
          setSelected([]);
          setLocked(false);
        }, 350);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) =>
              i === a || i === b ? { ...c, flipped: false } : c,
            ),
          );
          setSelected([]);
          setLocked(false);
        }, 650);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>MINIJUEGO</Text>
      <Text style={styles.title}>Memorama</Text>
      {won ? <Text style={styles.won}>¡Ganaste! · Cuenta para el secreto</Text> : null}
      <View style={styles.grid}>
        {cards.map((card, index) => (
          <Pressable
            key={card.id}
            style={[
              styles.card,
              (card.flipped || card.matched) && styles.cardOpen,
              card.matched && styles.cardMatched,
            ]}
            onPress={() => onCardPress(index)}
          >
            <Text style={styles.cardText}>
              {card.flipped || card.matched ? card.emoji : '?'}
            </Text>
          </Pressable>
        ))}
      </View>
      <Pressable style={styles.button} onPress={reset}>
        <Text style={styles.buttonText}>Reiniciar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 12,
  },
  kicker: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  won: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.success,
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 14,
  },
  card: {
    width: 72,
    height: 72,
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardOpen: {
    backgroundColor: '#2a2a48',
    borderColor: colors.accent,
  },
  cardMatched: {
    borderColor: colors.success,
    opacity: 0.85,
  },
  cardText: {
    fontSize: 28,
    color: colors.text,
    fontWeight: '700',
  },
  button: {
    backgroundColor: colors.accent,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
