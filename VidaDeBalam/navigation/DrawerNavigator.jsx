import { Image, StyleSheet, Text, View } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItem,
  createDrawerNavigator,
} from '@react-navigation/drawer';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import TabNavigator from './TabNavigator';
import { colors } from '../theme';
import { useWins } from '../context/WinsContext';

const Drawer = createDrawerNavigator();
const logo = require('../assets/balam-logo.png');

function CustomDrawerContent(props) {
  const { secretUnlocked } = useWins();
  const current = props.state.routes[props.state.index]?.name;
  const activeTab =
    current === 'Juegos'
      ? props.state.routes[props.state.index]?.state?.routes?.[
          props.state.routes[props.state.index]?.state?.index ?? 0
        ]?.name
      : null;

  const goHome = () => props.navigation.navigate('Inicio');
  const goGame = (screen) =>
    props.navigation.navigate('Juegos', { screen });

  const item = (label, icon, onPress, focused) => (
    <DrawerItem
      label={label}
      focused={focused}
      activeTintColor={colors.accent}
      inactiveTintColor={colors.textMuted}
      activeBackgroundColor="rgba(233, 69, 96, 0.15)"
      icon={({ color, size }) => icon(color, size)}
      onPress={onPress}
      labelStyle={styles.itemLabel}
      style={styles.item}
    />
  );

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContent}
      style={styles.drawer}
    >
      <View style={styles.brand}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.brandTitle}>Vida de Balam</Text>
        <Text style={styles.brandSubtitle}>Arcade de minijuegos</Text>
      </View>

      <Text style={styles.section}>Menú</Text>
      {item(
        'Inicio',
        (color, size) => <Ionicons name="home" size={size} color={color} />,
        goHome,
        current === 'Inicio',
      )}

      <Text style={styles.section}>Juegos</Text>
      {item(
        'Dados',
        (color, size) => (
          <MaterialCommunityIcons name="dice-6" size={size} color={color} />
        ),
        () => goGame('Dados'),
        activeTab === 'Dados',
      )}
      {item(
        'Memorama',
        (color, size) => (
          <MaterialCommunityIcons name="cards" size={size} color={color} />
        ),
        () => goGame('Memorama'),
        activeTab === 'Memorama',
      )}
      {item(
        'Tic Tac Toe',
        (color, size) => (
          <MaterialCommunityIcons
            name="grid"
            size={size}
            color={color}
          />
        ),
        () => goGame('TicTacToe'),
        activeTab === 'TicTacToe',
      )}
      {item(
        'Piedra Papel Tijera',
        (color, size) => (
          <MaterialCommunityIcons
            name="hand-back-right"
            size={size}
            color={color}
          />
        ),
        () => goGame('RPS'),
        activeTab === 'RPS',
      )}
      {secretUnlocked
        ? item(
            '💀 Brainrot Secreto',
            (color, size) => (
              <MaterialCommunityIcons
                name="skull"
                size={size}
                color="#ff003c"
              />
            ),
            () => goGame('Brainrot'),
            activeTab === 'Brainrot',
          )
        : null}
    </DrawerContentScrollView>
  );
}

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.bgSoft,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        drawerStyle: { backgroundColor: colors.bgSoft, width: 290 },
      }}
    >
      <Drawer.Screen
        name="Inicio"
        component={HomeScreen}
        options={{
          title: 'Inicio',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Juegos"
        component={TabNavigator}
        options={{
          title: 'Juegos',
          headerShown: true,
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawer: {
    backgroundColor: colors.bgSoft,
  },
  drawerContent: {
    paddingTop: 12,
  },
  brand: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 8,
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 12,
  },
  brandTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  brandSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  section: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 4,
    marginLeft: 20,
  },
  item: {
    borderRadius: 12,
    marginHorizontal: 8,
  },
  itemLabel: {
    fontWeight: '600',
    fontSize: 15,
  },
});
