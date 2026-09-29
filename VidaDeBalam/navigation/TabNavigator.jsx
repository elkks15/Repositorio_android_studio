import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DiceScreen from '../games/DiceScreen';
import MemoramaScreen from '../games/MemoramaScreen';
import TicTacToeScreen from '../games/TicTacToeScreen';
import RpsScreen from '../games/RpsScreen';
import BrainrotScreen from '../games/BrainrotScreen';
import { colors } from '../theme';
import { useWins } from '../context/WinsContext';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { secretUnlocked } = useWins();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.bgSoft,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dados"
        component={DiceScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="dice-6" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Memorama"
        component={MemoramaScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cards" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="TicTacToe"
        component={TicTacToeScreen}
        options={{
          title: 'Tic Tac Toe',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="grid" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="RPS"
        component={RpsScreen}
        options={{
          title: 'PPT',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="hand-back-right"
              size={size}
              color={color}
            />
          ),
        }}
      />
      {secretUnlocked ? (
        <Tab.Screen
          name="Brainrot"
          component={BrainrotScreen}
          options={{
            title: 'SECRETO',
            tabBarActiveTintColor: '#ffff00',
            tabBarIcon: ({ size }) => (
              <MaterialCommunityIcons
                name="skull"
                size={size}
                color="#ff003c"
              />
            ),
          }}
        />
      ) : null}
    </Tab.Navigator>
  );
}
