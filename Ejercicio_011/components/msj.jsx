import { Text, View, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    color: 'blue',
    backgroundColor: 'red',
  },

});
const styles2 = StyleSheet.create({
    container: {
      color: 'green',
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });


export default function Msj(props) {
  const variable = 'hola me llamo pedro';
  const num = 10;
  const double = num * 2;

  return (
    <View >
      <Text style={styles.container}>{props.message}</Text>
      <Text style={styles2.container}>{props.num}</Text>
      <Text>{props.double}</Text>
    </View>
  );
} 
