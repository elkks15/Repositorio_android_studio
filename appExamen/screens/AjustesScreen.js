import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import Ventana from '../components/Ventana';
import { useMandado } from '../context/AppContext';
import { colors } from '../theme';

function Fila({ titulo, detalle, value, onValueChange }) {
  return (
    <View style={styles.fila}>
      <View style={styles.textos}>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.detalle}>{detalle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: colors.accent, false: '#D1D5DB' }}
      />
    </View>
  );
}

export default function AjustesScreen() {
  const {
    bloquearBocaAbajo,
    setBloquearBocaAbajo,
    agitarMarca,
    setAgitarMarca,
    reiniciar,
    enCarrito,
  } = useMandado();
  const [preguntar, setPreguntar] = useState(false);
  const hayCarrito = Object.values(enCarrito).some(Boolean);

  return (
    <View style={styles.fondo}>
      <Text style={styles.encabezado}>Ajustes</Text>
      <Fila
        titulo="Inclinar mete al carrito"
        detalle="Inclina el teléfono hacia adelante, sin agitarlo, para marcar el producto"
        value={agitarMarca}
        onValueChange={setAgitarMarca}
      />
      <Fila
        titulo="Boca abajo lo deja quieto"
        detalle="Si el teléfono va en el carrito, los golpes no marcan productos"
        value={bloquearBocaAbajo}
        onValueChange={setBloquearBocaAbajo}
      />
      <Pressable
        style={[styles.boton, !hayCarrito && styles.apagado]}
        onPress={() => hayCarrito && setPreguntar(true)}
      >
        <Text style={styles.botonTexto}>Reiniciar la lista</Text>
      </Pressable>
      <Ventana
        visible={preguntar}
        onClose={() => setPreguntar(false)}
        titulo="¿Vaciar el carrito?"
        accion="Sí, empezar de nuevo"
        onAccion={() => {
          reiniciar();
          setPreguntar(false);
        }}
      >
        <Text style={styles.detalle}>Los productos vuelven a estar pendientes.</Text>
      </Ventana>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colors.bg, padding: 22 },
  encabezado: { color: colors.ink, fontSize: 30, fontWeight: '800', marginBottom: 18 },
  fila: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textos: { flex: 1, marginRight: 12 },
  titulo: { color: colors.ink, fontWeight: '700', fontSize: 16 },
  detalle: { marginTop: 4, color: colors.muted, lineHeight: 20 },
  boton: {
    marginTop: 8,
    backgroundColor: colors.ink,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botonTexto: { color: '#fff', fontWeight: '800' },
  apagado: { opacity: 0.4 },
});
