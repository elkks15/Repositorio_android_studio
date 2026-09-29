import { FlatList, StyleSheet, Text, View } from 'react-native';
import Ficha from '../../components/Ficha';
import { useNotas } from '../../context/AppContext';
import { colors } from '../../theme';

export default function ListaTareas({ navigation }) {
  const { tareas, hechas } = useNotas();

  return (
    <View style={styles.fondo}>
      <Text style={styles.ayuda}>Toca una tarea para verla.</Text>
      <FlatList
        data={tareas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => (
          <Ficha
            titulo={item.titulo}
            meta={hechas[item.id] ? 'Hecha' : 'Pendiente'}
            onPress={() => navigation.navigate('Detalle', { id: item.id })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colors.bg },
  ayuda: { color: colors.muted, paddingHorizontal: 20, paddingTop: 16 },
  lista: { padding: 16 },
});
