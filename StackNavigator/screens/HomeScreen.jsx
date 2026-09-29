import React from 'react';
import { View, Button } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, gap: 12 }}>
      <Button title="Calcular IMC" onPress={() => navigation.navigate('IMCscreen')} />
      <Button title="Calcular propina" onPress={() => navigation.navigate('TipScreen')} />
      <Button title="Convertir divisas" onPress={() => navigation.navigate('CurrencyScreen')} />
    </View>
  );
}
