import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Cat from './components/cat';
import Msj from './components/msj';
export default function App() {
  //codigo
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <Msj message="hola me llamo Saul" num={10} double={20}   />
      <Cat />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'blue',
  },
  });




