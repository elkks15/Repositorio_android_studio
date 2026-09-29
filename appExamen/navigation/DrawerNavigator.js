import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import TareasStack from '../screens/tareas/TareasStack';
import BitacoraScreen from '../screens/BitacoraScreen';
import InstrumentosTabs from '../screens/instrumentos/InstrumentosTabs';
import PerfilScreen from '../screens/PerfilScreen';
import AjustesScreen from '../screens/AjustesScreen';
import { colors } from '../theme';

const Drawer = createDrawerNavigator();

function icono(nombre) {
  return function Icono({ color, size }) {
    return <Ionicons name={nombre} size={size} color={color} />;
  };
}

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgSoft },
        headerTintColor: colors.ink,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        drawerActiveTintColor: colors.accent,
        drawerInactiveTintColor: colors.muted,
        drawerActiveBackgroundColor: colors.accentSoft,
        drawerStyle: { backgroundColor: colors.bgSoft, width: 280 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Drawer.Screen
        name="Inicio"
        component={HomeScreen}
        options={{ title: 'Inicio', drawerIcon: icono('home-outline') }}
      />
      <Drawer.Screen
        name="Notas"
        component={BitacoraScreen}
        options={{ title: 'Notas', drawerIcon: icono('document-text-outline') }}
      />
      <Drawer.Screen
        name="Tareas"
        component={TareasStack}
        options={{ headerShown: false, drawerIcon: icono('checkbox-outline') }}
      />
      <Drawer.Screen
        name="Sensores"
        component={InstrumentosTabs}
        options={{ title: 'Sensores', drawerIcon: icono('phone-portrait-outline') }}
      />
      <Drawer.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{ title: 'Perfil', drawerIcon: icono('person-outline') }}
      />
      <Drawer.Screen
        name="Ajustes"
        component={AjustesScreen}
        options={{ title: 'Ajustes', drawerIcon: icono('options-outline') }}
      />
    </Drawer.Navigator>
  );
}
