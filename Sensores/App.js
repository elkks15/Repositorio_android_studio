import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Dice3D from './Dice3D';
import GyroGame from './GyroGame';
import MagnetGame from './MagnetGame';
import AllSensorsGame from './AllSensorsGame';

export default function App() {
  const [tab, setTab] = useState('dice');

  return (
    <View style={styles.container}>
      <View style={styles.screen}>
        {tab === 'dice' ? (
          <Dice3D />
        ) : tab === 'gyro' ? (
          <GyroGame />
        ) : tab === 'magnet' ? (
          <MagnetGame />
        ) : (
          <AllSensorsGame />
        )}
      </View>
      <View style={styles.tabs}>
        <Pressable style={[styles.tab, tab === 'dice' && styles.tabOn]} onPress={() => setTab('dice')}>
          <Text style={[styles.tabText, tab === 'dice' && styles.tabTextOn]}>Dados</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === 'gyro' && styles.tabOn]} onPress={() => setTab('gyro')}>
          <Text style={[styles.tabText, tab === 'gyro' && styles.tabTextOn]}>Canica</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === 'magnet' && styles.tabOn]} onPress={() => setTab('magnet')}>
          <Text style={[styles.tabText, tab === 'magnet' && styles.tabTextOn]}>Nave</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === 'all' && styles.tabOn]} onPress={() => setTab('all')}>
          <Text style={[styles.tabText, tab === 'all' && styles.tabTextOn]}>Misión</Text>
        </Pressable>
      </View>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08140d',
  },
  screen: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 18,
    gap: 8,
    backgroundColor: '#07110c',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#14301f',
  },
  tabOn: {
    backgroundColor: '#2f9e5c',
  },
  tabText: {
    color: '#b7d8c3',
    fontWeight: '800',
    fontSize: 12,
  },
  tabTextOn: {
    color: '#fff',
  },
});
