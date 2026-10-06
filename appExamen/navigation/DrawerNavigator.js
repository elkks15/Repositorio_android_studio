import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import MandadoStack from '../screens/lista/MandadoStack';
import CocheScreen from '../screens/CocheScreen';
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
        name="Mandado"
        component={MandadoStack}
        options={{ headerShown: false, drawerIcon: icono('cart-outline') }}
      />
      <Drawer.Screen
        name="Coche"
        component={CocheScreen}
        options={{ title: 'El coche', drawerIcon: icono('car-outline') }}
      />
      <Drawer.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{ title: 'Quién compra', drawerIcon: icono('person-outline') }}
      />
      <Drawer.Screen
        name="Ajustes"
        component={AjustesScreen}
        options={{ title: 'Ajustes', drawerIcon: icono('options-outline') }}
      />
    </Drawer.Navigator>
  );
}
