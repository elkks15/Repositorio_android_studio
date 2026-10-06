import { DrawerActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ListaTabs from './ListaTabs';
import DetalleProducto from './DetalleProducto';
import { colors } from '../../theme';

const Stack = createNativeStackNavigator();

function BotonMenu({ navigation }) {
  return (
    <Pressable
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      style={{ paddingRight: 8 }}
    >
      <Ionicons name="menu" size={26} color={colors.ink} />
    </Pressable>
  );
}

export default function MandadoStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgSoft },
        headerTintColor: colors.ink,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen
        name="Tabs"
        component={ListaTabs}
        options={({ navigation }) => ({
          title: 'Mandado',
          headerLeft: () => <BotonMenu navigation={navigation} />,
        })}
      />
      <Stack.Screen name="Detalle" component={DetalleProducto} options={{ title: 'Producto' }} />
    </Stack.Navigator>
  );
}
