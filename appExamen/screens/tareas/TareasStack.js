import { DrawerActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ListaTareas from './ListaTareas';
import DetalleTarea from './DetalleTarea';
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

export default function TareasStack() {
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
        name="Lista"
        component={ListaTareas}
        options={({ navigation }) => ({
          title: 'Tareas',
          headerLeft: () => <BotonMenu navigation={navigation} />,
        })}
      />
      <Stack.Screen name="Detalle" component={DetalleTarea} options={{ title: 'Tarea' }} />
    </Stack.Navigator>
  );
}
