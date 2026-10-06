import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export default function SplashScreen() {
  const opacidad = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacidad, {
      toValue: 1,
      duration: 500,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [opacidad]);

  return (
    <View style={styles.fondo}>
      <Animated.View style={{ opacity: opacidad }}>
        <Text style={styles.nombre}>Mandado</Text>
        <Text style={styles.linea}>Lista del súper</Text>
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
    fontSize: 46,
    fontWeight: '800',
    textAlign: 'center',
  },
  linea: {
    marginTop: 6,
    color: '#DCFCE7',
    fontSize: 16,
    textAlign: 'center',
  },
});
