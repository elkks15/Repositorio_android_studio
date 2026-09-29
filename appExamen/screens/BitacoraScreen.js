import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ficha from '../components/Ficha';
import Ventana from '../components/Ventana';
import { useNotas } from '../context/AppContext';
import { colors } from '../theme';

export default function BitacoraScreen() {
  const { notas, agregarNota } = useNotas();
  const [busqueda, setBusqueda] = useState('');
  const [abierta, setAbierta] = useState(null);
  const [creando, setCreando] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [cuerpo, setCuerpo] = useState('');

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return notas;
    return notas.filter((nota) =>
      `${nota.titulo} ${nota.cuerpo}`.toLowerCase().includes(texto),
    );
  }, [busqueda, notas]);

  const guardar = () => {
    if (!titulo.trim() || !cuerpo.trim()) return;
    agregarNota({ titulo: titulo.trim(), cuerpo: cuerpo.trim() });
    setTitulo('');
    setCuerpo('');
    setCreando(false);
  };

  return (
    <View style={styles.fondo}>
      <TextInput
        style={styles.busqueda}
        placeholder="Buscar en las notas"
        placeholderTextColor={colors.muted}
        value={busqueda}
        onChangeText={setBusqueda}
      />
      <FlatList
        data={visibles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={<Text style={styles.vacio}>Ninguna nota coincide.</Text>}
        renderItem={({ item }) => (
          <Ficha
            titulo={item.titulo}
            meta={item.cuando}
            onPress={() => setAbierta(item)}
          >
            <Text style={styles.extracto} numberOfLines={2}>
              {item.cuerpo}
            </Text>
          </Ficha>
        )}
      />
      <Pressable style={styles.fab} onPress={() => setCreando(true)}>
        <Text style={styles.fabTexto}>Nueva nota</Text>
      </Pressable>

      <Ventana
        visible={Boolean(abierta)}
        onClose={() => setAbierta(null)}
        titulo={abierta?.titulo || ''}
      >
        <Text style={styles.cuando}>{abierta?.cuando}</Text>
        <Text style={styles.cuerpo}>{abierta?.cuerpo}</Text>
      </Ventana>

      <Ventana visible={creando} onClose={() => setCreando(false)} titulo="Nueva nota">
        <TextInput
          style={styles.input}
          placeholder="Título"
          value={titulo}
          onChangeText={setTitulo}
        />
        <TextInput
          style={[styles.input, styles.area]}
          placeholder="Escribe la nota"
          value={cuerpo}
          onChangeText={setCuerpo}
          multiline
        />
        <Pressable style={styles.guardar} onPress={guardar}>
          <Text style={styles.guardarTexto}>Guardar en esta sesión</Text>
        </Pressable>
      </Ventana>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  busqueda: {
    margin: 16,
    marginBottom: 4,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.ink,
  },
  lista: {
    padding: 16,
    paddingBottom: 96,
  },
  extracto: {
    marginTop: 8,
    color: colors.muted,
    lineHeight: 20,
  },
  vacio: {
    textAlign: 'center',
    color: colors.muted,
    marginTop: 24,
  },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  fabTexto: {
    color: '#fff',
    fontWeight: '800',
  },
  cuando: {
    color: colors.sea,
    fontWeight: '700',
    marginBottom: 8,
  },
  cuerpo: {
    color: colors.ink,
    fontSize: 16,
    lineHeight: 23,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    color: colors.ink,
  },
  area: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  guardar: {
    backgroundColor: colors.sea,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  guardarTexto: {
    color: '#fff',
    fontWeight: '700',
  },
});
