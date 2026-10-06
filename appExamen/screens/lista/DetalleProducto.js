import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMandado } from '../../context/AppContext';
import { colors } from '../../theme';

export default function DetalleProducto({ route, navigation }) {
  const { productos, enCarrito, marcar, desmarcar, cambiarCantidad, editarNota, quitar } =
    useMandado();
  const producto = productos.find((item) => item.id === route.params.id);

  if (!producto) {
    return (
      <View style={styles.fondo}>
        <Text style={styles.nombre}>Ese producto ya no está en la lista.</Text>
      </View>
    );
  }

  const listo = Boolean(enCarrito[producto.id]);

  return (
    <View style={styles.fondo}>
      <Text style={styles.nombre}>{producto.nombre}</Text>
      <Text style={styles.estado}>{listo ? 'En el carrito' : 'Todavía falta'}</Text>

      <Text style={styles.etiqueta}>Cantidad</Text>
      <View style={styles.cantidad}>
        <Pressable style={styles.paso} onPress={() => cambiarCantidad(producto.id, -1)}>
          <Text style={styles.pasoTexto}>−</Text>
        </Pressable>
        <Text style={styles.numero}>{producto.cantidad}</Text>
        <Pressable style={styles.paso} onPress={() => cambiarCantidad(producto.id, 1)}>
          <Text style={styles.pasoTexto}>+</Text>
        </Pressable>
      </View>

      <Text style={styles.etiqueta}>Nota</Text>
      <TextInput
        style={styles.input}
        placeholder="Por ejemplo: la marca de siempre"
        placeholderTextColor={colors.muted}
        value={producto.nota}
        onChangeText={(valor) => editarNota(producto.id, valor)}
      />

      <Pressable
        style={styles.principal}
        onPress={() => (listo ? desmarcar(producto.id) : marcar(producto.id))}
      >
        <Text style={styles.principalTexto}>{listo ? 'Sacar del carrito' : 'Meter al carrito'}</Text>
      </Pressable>
      <Pressable
        style={styles.peligro}
        onPress={() => {
          quitar(producto.id);
          navigation.goBack();
        }}
      >
        <Text style={styles.peligroTexto}>Quitar de la lista</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colors.bg, padding: 22 },
  nombre: { color: colors.ink, fontSize: 34, fontWeight: '800' },
  estado: { marginTop: 6, color: colors.accent, fontWeight: '700', fontSize: 16 },
  etiqueta: { marginTop: 22, color: colors.muted, fontWeight: '700' },
  cantidad: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8 },
  paso: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pasoTexto: { fontSize: 26, color: colors.ink, fontWeight: '700' },
  numero: { fontSize: 28, fontWeight: '800', color: colors.ink, minWidth: 36, textAlign: 'center' },
  input: {
    marginTop: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 12,
    color: colors.ink,
  },
  principal: {
    marginTop: 24,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  principalTexto: { color: '#fff', fontWeight: '800' },
  peligro: {
    marginTop: 10,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  peligroTexto: { color: '#B91C1C', fontWeight: '700' },
});
