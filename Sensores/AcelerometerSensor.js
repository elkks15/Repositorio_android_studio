import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Accelerometer } from 'expo-sensors';

export default function AccelerometerSensor() {
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    const suscribir = Accelerometer.addListener((result) => {
      setData(result);
    });

    Accelerometer.setUpdateInterval(100);

    return () => {
      suscribir.remove();
    };
  }, []);

  return (
    <View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});