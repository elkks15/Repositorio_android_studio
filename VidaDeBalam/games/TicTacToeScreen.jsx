import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { useWins } from '../context/WinsContext';

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function getWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function cpuMove(board) {
  const empty = board
    .map((cell, index) => (cell ? null : index))
    .filter((index) => index !== null);
  if (!empty.length) return board;
  const pick = empty[Math.floor(Math.random() * empty.length)];
  const next = [...board];
  next[pick] = 'O';
  return next;
}

export default function TicTacToeScreen() {
  const { markWin } = useWins();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const winner = useMemo(() => getWinner(board), [board]);
  const isDraw = !winner && board.every(Boolean);
  const status = winner
    ? winner === 'X'
      ? '¡Ganaste!'
      : 'Perdiste'
    : isDraw
      ? 'Empate'
      : xIsNext
        ? 'Tu turno (X)'
        : 'Piensa la CPU...';

  useEffect(() => {
    if (winner === 'X') markWin('tictactoe');
  }, [winner, markWin]);

  useEffect(() => {
    if (winner || isDraw || xIsNext) return undefined;
    const timer = setTimeout(() => {
      setBoard((prev) => cpuMove(prev));
      setXIsNext(true);
    }, 450);
    return () => clearTimeout(timer);
  }, [xIsNext, winner, isDraw]);

  const play = (index) => {
    if (board[index] || winner || !xIsNext) return;
    const next = [...board];
    next[index] = 'X';
    setBoard(next);
    setXIsNext(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>MINIJUEGO</Text>
      <Text style={styles.title}>Tic Tac Toe</Text>
      <Text style={styles.vsHint}>Tú (X) vs CPU (O) · gana para el secreto</Text>
      <Text style={styles.status}>{status}</Text>
      <View style={styles.board}>
        {board.map((cell, index) => (
          <Pressable
            key={index}
            style={styles.cell}
            onPress={() => play(index)}
          >
            <Text
              style={[styles.cellText, cell === 'X' ? styles.x : styles.o]}
            >
              {cell}
            </Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        style={styles.button}
        onPress={() => {
          setBoard(Array(9).fill(null));
          setXIsNext(true);
        }}
      >
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
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
  },
  vsHint: {
    fontSize: 13,
    color: colors.gold,
    marginBottom: 8,
    fontWeight: '600',
  },
  status: {
    fontSize: 17,
    color: colors.textMuted,
    marginBottom: 18,
    fontWeight: '600',
  },
  board: {
    width: 264,
    height: 264,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  cell: {
    width: '33.333%',
    height: '33.333%',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: { fontSize: 38, fontWeight: '800' },
  x: { color: colors.accentSoft },
  o: { color: colors.gold },
  button: {
    backgroundColor: colors.accent,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 22,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
