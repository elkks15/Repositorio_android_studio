import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export default function SplashScreen() {
  const opacidad = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacidad, {
      toValue: 1,
      duration: 600,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [opacidad]);

  return (
    <View style={styles.fondo}>
      <Animated.View style={{ opacity: opacidad }}>
        <Text style={styles.nombre}>Notas</Text>
        <Text style={styles.linea}>Tu agenda</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nombre: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '800',
    textAlign: 'center',
  },
  linea: {
    marginTop: 6,
    color: '#DBEAFE',
    fontSize: 16,
    textAlign: 'center',
  },
});
