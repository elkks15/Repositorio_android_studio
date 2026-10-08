import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TextInput, Button, Modal } from "react-native";
import { useState } from "react";

export default function App() {
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [imc, setImc] = useState("");
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState("");
  const botonCalcular = () => {
    CalcularIMC(peso, altura);
    ModalVisible();
    TextVisible(imc);
  };
  const TextVisible = (imc) => {
    if (imc < 18.5) {
      setText( "esta por debajo del peso");
    } else if (imc >= 18.5 && imc <= 24.9) {
      setText("esta en el peso normal");
    } else if (imc >= 25 && imc <= 29.9) {
      setText("esta por encima del peso");
    } else if (imc >= 30 && imc <= 39.9) {
      setText("esta en obesidad");
    } else if (imc >= 40) {
      setText("esta en obesidad morbida");
    }
  };
  const ModalVisible = () => {
    setVisible(true);
  };
  const CalcularIMC = (peso, altura) => {
    peso = parseFloat(peso);
    altura = parseFloat(altura);
    setImc(peso / (altura * altura));
  };

  return (
    <View style={styles.container}>
      <View style={styles.container2}>
      <Text>Calculadora IMC</Text>
      </View>
      <Text>ingrese su peso</Text>
      <TextInput
        placeholder="Peso"
        value={peso}
        keyboardType="numeric"
        onChangeText={setPeso}
      />
      <Text>ingrese su altura</Text>
      <TextInput
        placeholder="Altura"
        value={altura}
        keyboardType="numeric"
        onChangeText={setAltura}
      />
      <Button title="Calcular IMC" onPress={botonCalcular} />
      
     
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        backgroundColor="white"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modal2}>
          <View style={styles.modal}>
            <Text>su imc es: {imc}</Text>
            <Text>{text}</Text>
            <View></View>
            <Button title="Cerrar" onPress={() => setVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "top",
    alignText: "center",
    fontSize: 200,
  },
  modal: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "black",
    width: "80%",
    height: "25%",
    backgroundColor: "white",
    

  },
  modal2: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  container2: {
    backgroundColor: "cyan",
    alignItems: "center",
    justifyContent: "top",
    width: "100%",
    height: "10%",
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 20,
    marginLeft: 20,
    marginRight: 20,
  },
});
