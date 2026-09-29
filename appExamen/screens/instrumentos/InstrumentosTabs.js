import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import NivelScreen from './NivelScreen';
import RumboScreen from './RumboScreen';
import QuietoScreen from './QuietoScreen';
import { colors } from '../../theme';

const Tab = createBottomTabNavigator();

export default function InstrumentosTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.bgSoft,
          borderTopColor: colors.line,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="Nivel"
        component={NivelScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ellipse-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Rumbo"
        component={RumboScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Giro"
        component={QuietoScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="hand-left-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
