import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TipScreen from './screens/TipScreen';
import CurrencyScreen from './screens/CurrencyScreen';
import IMCscreen from './screens/IMCscreen';
import HomeScreen from './screens/HomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Menú' }} />
        <Stack.Screen name="IMCscreen" component={IMCscreen} options={{ title: 'IMC' }} />
        <Stack.Screen name="TipScreen" component={TipScreen} options={{ title: 'Propina' }} />
        <Stack.Screen name="CurrencyScreen" component={CurrencyScreen} options={{ title: 'Divisas' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
