import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';

export default function TipScreen() {
  const [cuenta, setCuenta] = useState('');
  const [porcentaje, setPorcentaje] = useState('');
  const [total, setTotal] = useState(null);

  const calcularPropina = () => {
    if (!cuenta || !porcentaje) return;
    const propinaNum = (parseFloat(cuenta) * parseFloat(porcentaje)) / 100;
    const totalNum = parseFloat(cuenta) + propinaNum;
    setTotal({
      propina: propinaNum.toFixed(2),
      total: totalNum.toFixed(2),
    });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text>Monto de la cuenta:</Text>
      <TextInput
        keyboardType="numeric"
        value={cuenta}
        onChangeText={setCuenta}
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10 }}
      />

      <Text>Porcentaje de propina:</Text>
      <TextInput
        keyboardType="numeric"
        value={porcentaje}
        onChangeText={setPorcentaje}
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10 }}
      />

      <Button title="Calcular propina" onPress={calcularPropina} />

      {total && (
        <Text style={{ marginTop: 20, fontSize: 18 }}>
          Propina: {total.propina} | Total: {total.total}
        </Text>
      )}
    </View>
  );
}
