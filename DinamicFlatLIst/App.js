import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import CustomModal from "./components/CustomModal";

export default function App() {
  const [visible, setVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const Cursos = [
    { id: 1, titulo: "React Native", duracion: "10 horas", rating: 4.5 },
    { id: 2, titulo: "React", duracion: "20 horas", rating: 3.5 },
    { id: 3, titulo: "Angular", duracion: "25 horas", rating: 4 },
    { id: 4, titulo: "Vue", duracion: "30 horas", rating: 4 },
    { id: 5, titulo: "Node", duracion: "35 horas", rating: 3 },
  ];

  const manejarPresionCurso = (tituloCurso) => {
    setSelectedCourse(tituloCurso);
    setVisible(true);
  };

  const renderCard = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.75}
        onPress={() => manejarPresionCurso(item.titulo)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.titulo}</Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>{item.rating} ★</Text>
          </View>
        </View>
        <Text style={styles.cardDuration}>{item.duracion}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Cursos</Text>
        <Text style={styles.headerSubtitle}>
          Toca un curso para ver la invitación
        </Text>
      </View>
      <FlatList
        data={Cursos}
        renderItem={renderCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
      <CustomModal
        visible={visible}
        onClose={() => setVisible(false)}
        contenido={selectedCourse}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748B",
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    flex: 1,
    marginRight: 12,
  },
  ratingBadge: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#047857",
  },
  cardDuration: {
    fontSize: 14,
    color: "#64748B",
  },
});
