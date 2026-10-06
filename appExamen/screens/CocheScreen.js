import { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import { useMandado } from '../context/AppContext';
import { diferenciaAngulo, gradosDesde, useSensor } from '../lib/sensores';
import { colors } from '../theme';

export default function CocheScreen() {
  const { coche, guardarCoche } = useMandado();
  const rumboSuave = useRef(null);
  const cocheRef = useRef(coche);
  const flecha = useRef(new Animated.Value(0)).current;
  const [zona, setZona] = useState('sin');
  cocheRef.current = coche;

  const disponible = useSensor(Magnetometer, ({ x, y }) => {
    const crudo = gradosDesde(x, y);
    if (rumboSuave.current == null) {
      rumboSuave.current = crudo;
    } else {
      const ajuste = diferenciaAngulo(rumboSuave.current, crudo);
      rumboSuave.current = (rumboSuave.current + ajuste * 0.22 + 360) % 360;
    }

    const guardado = cocheRef.current;
    const diff = guardado == null ? 0 : diferenciaAngulo(rumboSuave.current, guardado);
    flecha.setValue(diff);

    const siguiente =
      guardado == null ? 'sin' : Math.abs(diff) < 14 ? 'listo' : diff < 0 ? 'izquierda' : 'derecha';
    setZona((prev) => (prev === siguiente ? prev : siguiente));
  });

  const instruccion =
    zona === 'sin'
      ? 'Párate frente al coche y guarda esa dirección.'
      : zona === 'listo'
        ? 'Así quedó el coche.'
        : zona === 'izquierda'
          ? 'Gira a la izquierda.'
          : 'Gira a la derecha.';

  const giro = flecha.interpolate({
    inputRange: [-180, 180],
    outputRange: ['-180deg', '180deg'],
  });

  return (
    <View style={styles.fondo}>
      <Text style={styles.titulo}>¿Hacia dónde quedó el coche?</Text>
      <Text style={styles.texto}>
        Guardas la dirección en la que lo estás viendo. Al salir de la tienda, giras hasta que vuelva a coincidir.
      </Text>

      {disponible === false ? (
        <Text style={styles.aviso}>Este teléfono no tiene brújula, así que esta parte no puede orientarte.</Text>
      ) : (
        <View style={styles.flechaCaja}>
          <Animated.Text style={[styles.flecha, { transform: [{ rotate: giro }] }]}>↑</Animated.Text>
        </View>
      )}

      <Text style={styles.instruccion}>{instruccion}</Text>

      <Pressable
        style={styles.boton}
        onPress={() => {
          if (rumboSuave.current != null) guardarCoche(rumboSuave.current);
        }}
      >
        <Text style={styles.botonTexto}>
          {coche == null ? 'El coche está enfrente' : 'Actualizar dirección'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 24,
    alignItems: 'center',
  },
  titulo: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  texto: {
    marginTop: 10,
    color: colors.muted,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  aviso: {
    marginTop: 28,
    color: colors.ink,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  flechaCaja: {
    marginTop: 28,
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 8,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  flecha: {
    fontSize: 84,
    color: colors.accent,
    fontWeight: '800',
    lineHeight: 92,
  },
  instruccion: {
    marginTop: 22,
    color: colors.ink,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  boton: {
    marginTop: 22,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  botonTexto: { color: '#fff', fontWeight: '800' },
});
