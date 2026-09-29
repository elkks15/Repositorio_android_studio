import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import { useNotas } from '../../context/AppContext';
import { useSensor } from '../../lib/sensores';
import { colors } from '../../theme';

function gradosDesde(x, y) {
  const angulo = (Math.atan2(y, x) * 180) / Math.PI;
  return (angulo + 360) % 360;
}

function puntoCardinal(grados) {
  const nombres = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  const indice = Math.round(grados / 45) % 8;
  return nombres[indice];
}

export default function RumboScreen() {
  const { mostrarGrados } = useNotas();
  const [grados, setGrados] = useState(0);
  const disponible = useSensor(Magnetometer, ({ x, y }) => {
    setGrados(gradosDesde(x, y));
  });

  return (
    <View style={styles.fondo}>
      <Text style={styles.kicker}>Magnetómetro</Text>
      <Text style={styles.titulo}>Brújula</Text>
      {disponible ? (
        <>
          <View style={styles.rosa}>
            <Text style={styles.norte}>N</Text>
            <View style={[styles.aguja, { transform: [{ rotate: `${grados}deg` }] }]} />
          </View>
          <Text style={styles.cardinal}>{puntoCardinal(grados)}</Text>
          {mostrarGrados ? (
            <Text style={styles.grados}>{Math.round(grados)}°</Text>
          ) : null}
        </>
      ) : (
        <Text style={styles.aviso}>Este aparato no trae magnetómetro.</Text>
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
    padding: 24,
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
    fontSize: 24,
    fontWeight: '800',
    marginTop: 8,
    textAlign: 'center',
  },
  rosa: {
    marginTop: 28,
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 10,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  norte: {
    position: 'absolute',
    top: 12,
    color: colors.ink,
    fontWeight: '800',
  },
  aguja: {
    width: 8,
    height: 90,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  cardinal: {
    marginTop: 18,
    color: colors.ink,
    fontSize: 36,
    fontWeight: '800',
  },
  grados: {
    marginTop: 4,
    color: colors.accent,
    fontSize: 18,
  },
  aviso: {
    marginTop: 24,
    color: colors.ink,
    textAlign: 'center',
  },
});
