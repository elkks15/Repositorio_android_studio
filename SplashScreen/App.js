import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

function SplashScreen() {
  return (
   <View style={styles.splash}>
    <Text style={styles.logo}>
      cohete la app
    </Text>
    <Text style={styles.title}>
      Mi aplicacion
      </Text>
      <Text>
        cargando...
      </Text>
    </View>
  );
}

function HomeScreen() {
  return (
    <View style={styles.home}>
      <Text style={styles.homeText}> bienvenido</Text>
    </View>
  );
}

export default function App() {
const [Loading, setLoading] = useState(true);
useEffect(() => {
  setTimeout(() => {
    setLoading(false);
  }, 5000);
}, []);

if (Loading) {
  return <SplashScreen />;
} else {
  return <HomeScreen />;
}
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  home: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  loading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
});