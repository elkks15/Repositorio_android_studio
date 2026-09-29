import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import SplashScreen from './screens/SplashScreen';
import DrawerNavigator from './navigation/DrawerNavigator';
import { WinsProvider } from './context/WinsContext';
import { initSfx, play } from './sounds/sfx';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initSfx().then(() => play('intro'));
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <>
        <StatusBar style="light" />
        <SplashScreen />
      </>
    );
  }

  return (
    <WinsProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <DrawerNavigator />
      </NavigationContainer>
    </WinsProvider>
  );
}
