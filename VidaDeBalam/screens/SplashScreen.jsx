import { Animated, StyleSheet, Text, View } from 'react-native';
import { useEffect, useRef } from 'react';
import { colors } from '../theme';

const logo = require('../assets/balam-logo.png');

export default function SplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.4)).current;
  const position = useRef(new Animated.Value(60)).current;
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(position, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <View style={styles.splash}>
      <View style={styles.glow} />
      <Animated.Image
        source={logo}
        style={[
          styles.logo,
          {
            opacity,
            transform: [{ translateY: position }, { scale }],
          },
        ]}
      />
      <Animated.Text style={[styles.title, { opacity }]}>
        Vida de Balam
      </Animated.Text>
      <Animated.Text style={[styles.subtitle, { opacity: pulse }]}>
        Cargando aventura...
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.accent,
    opacity: 0.12,
  },
  logo: {
    width: 160,
    height: 160,
    borderRadius: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.accentSoft,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
  },
});
