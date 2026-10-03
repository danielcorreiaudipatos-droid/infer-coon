import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const LEADERBOARD = [
  { rank: 1, name: 'João Silva', reads: 245, earned: 45.50, badge: '🥇' },
  { rank: 2, name: 'Maria Santos', reads: 198, earned: 38.20, badge: '🥈' },
  { rank: 3, name: 'Pedro Costa', reads: 176, earned: 32.10, badge: '🥉' },
  { rank: 4, name: 'Ana Oliveira', reads: 152, earned: 28.40, badge: '4' },
  { rank: 5, name: 'Lucas Ferreira', reads: 148, earned: 26.80, badge: '5' },
];

export default function LeaderboardScreen() {
  const renderLeaderboardItem = ({ item }: any) => (
    <View style={styles.item}>
      <Text style={styles.badge}>{item.badge}</Text>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userStats}>{item.reads} reads</Text>
      </View>
      <Text style={styles.earned}>R$ {item.earned.toFixed(2)}</Text>
    </View>
  );

  return (
    <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Leaderboard</Text>
        <Text style={styles.subtitle}>Top Readers This Week</Text>
      </View>

      <FlatList
        data={LEADERBOARD}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.rank.toString()}
        contentContainerStyle={styles.list}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  item: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  badge: {
    fontSize: 24,
    marginRight: 12,
    width: 30,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  userStats: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  earned: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
  },
});
