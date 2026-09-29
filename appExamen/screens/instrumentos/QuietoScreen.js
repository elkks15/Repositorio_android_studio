import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gyroscope } from 'expo-sensors';
import { limitar, useSensor } from '../../lib/sensores';
import { colors } from '../../theme';

export default function QuietoScreen() {
  const [firmeza, setFirmeza] = useState(0);
  const disponible = useSensor(Gyroscope, ({ x, y, z }) => {
    const giro = Math.hypot(x, y, z);
    setFirmeza((prev) => {
      if (giro < 0.08) return limitar(prev + 0.08, 0, 1);
      return limitar(prev - giro * 0.35, 0, 1);
    });
  });

  const quieto = firmeza > 0.92;

  return (
    <View style={styles.fondo}>
      <Text style={styles.kicker}>Giroscopio</Text>
      <Text style={styles.titulo}>{quieto ? 'Está quieto' : 'Muévelo o déjalo quieto'}</Text>
      {disponible ? (
        <View style={styles.barra}>
          <View style={[styles.lleno, { width: `${Math.round(firmeza * 100)}%` }]} />
        </View>
      ) : (
        <Text style={styles.aviso}>Este aparato no trae giroscopio.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  kicker: {
    color: colors.accent,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontWeight: '700',
    fontSize: 12,
  },
  titulo: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 8,
    textAlign: 'center',
  },
  barra: {
    marginTop: 28,
    width: '100%',
    maxWidth: 320,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.line,
    overflow: 'hidden',
  },
  lleno: {
    height: '100%',
    backgroundColor: colors.sea,
  },
  aviso: {
    marginTop: 24,
    color: colors.muted,
    textAlign: 'center',
  },
});
