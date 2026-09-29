import { StyleSheet, Switch, Text, View } from 'react-native';
import { useNotas } from '../context/AppContext';
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
  const { mostrarGrados, setMostrarGrados, avisoNivel, setAvisoNivel } = useNotas();

  return (
    <View style={styles.fondo}>
      <Text style={styles.encabezado}>Ajustes</Text>
      <Text style={styles.ayuda}>Solo duran mientras la app está abierta.</Text>
      <Fila
        titulo="Mostrar grados"
        detalle="La brújula enseña el número además de la letra"
        value={mostrarGrados}
        onValueChange={setMostrarGrados}
      />
      <Fila
        titulo="Aviso de nivel"
        detalle="Avisa cuando el teléfono está plano"
        value={avisoNivel}
        onValueChange={setAvisoNivel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 22,
  },
  encabezado: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: '800',
  },
  ayuda: {
    marginTop: 6,
    marginBottom: 18,
    color: colors.muted,
  },
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
  textos: {
    flex: 1,
    marginRight: 12,
  },
  titulo: {
    color: colors.ink,
    fontWeight: '700',
    fontSize: 16,
  },
  detalle: {
    marginTop: 4,
    color: colors.muted,
  },
});
