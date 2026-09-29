import { NavigationContainer } from '@react-navigation/native';
import {View, Text} from 'react-native';
'@reavt-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
const Drawer = createDrawerNavigator();
import HomeScreen from './components/HomeScreen';
import SearchScreen from './components/SearchScreen';
import ProfileScreen from './components/ProfileScreen';
import SettingsScreen from './components/SettingScreen';


export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator>
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Search" component={SearchScreen} />
        <Drawer.Screen name="Profile" component={ProfileScreen} />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}