import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import useWalletStore from '../../store/walletStore';

interface Game {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

const games: Game[] = [
  {
    id: 'onzap',
    name: '💬 ONZAP',
    icon: '⚡',
    description: 'Jumping Game\nR$ 0.10 - R$ 2.50',
    color: '#7c3aed',
  },
  {
    id: 'onlove',
    name: '💕 ONLOVE',
    icon: '❤️',
    description: 'Matching Game\nR$ 0.05 - R$ 5.00',
    color: '#ec4899',
  },
  {
    id: 'onmail',
    name: '📧 ONMAIL',
    icon: '🛡️',
    description: 'Tower Defense\nR$ 0.50 - R$ 200.00',
    color: '#f59e0b',
  },
];

export default function HomeScreen({ navigation }: any) {
  const balance = useWalletStore((state) => state.balance);
  const fetchBalance = useWalletStore((state) => state.fetchBalance);

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.header}>
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Welcome! 🎮</Text>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceAmount}>R$ {balance.toFixed(2)}</Text>
            <TouchableOpacity style={styles.withdrawBtn}>
              <Text style={styles.withdrawBtnText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.gamesSection}>
        <Text style={styles.sectionTitle}>🎮 Play & Earn</Text>
        {games.map((game) => (
          <TouchableOpacity
            key={game.id}
            style={[styles.gameCard, { borderLeftColor: game.color }]}
            onPress={() => navigation.navigate('Game', { gameId: game.id })}
          >
            <View>
              <Text style={styles.gameName}>{game.name}</Text>
              <Text style={styles.gameDesc}>{game.description}</Text>
            </View>
            <Text style={styles.gameIcon}>{game.icon}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>📊 Your Stats</Text>
        <View style={styles.statGrid}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Games Today</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>R$ 45.50</Text>
            <Text style={styles.statLabel}>Earned Today</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>342</Text>
            <Text style={styles.statLabel}>Rank</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>4.2⭐</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  welcomeSection: {
    gap: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  balanceLabel: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4ade80',
    marginBottom: 12,
  },
  withdrawBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  withdrawBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  gamesSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  gameCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  gameName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  gameDesc: {
    fontSize: 12,
    color: '#9ca3af',
  },
  gameIcon: {
    fontSize: 32,
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  stat: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 12,
    minWidth: '45%',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
});
