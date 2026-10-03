import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function RewardsScreen() {
  return (
    <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>🏆 Rewards</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reading Streak</Text>
          <View style={styles.streakCard}>
            <Text style={styles.streakValue}>7️⃣</Text>
            <Text style={styles.streakLabel}>Days</Text>
            <Text style={styles.streakBonus}>1.5x Multiplier</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Stats</Text>
          <View style={styles.statGrid}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Articles Read</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>R$ 0.85</Text>
              <Text style={styles.statLabel}>Today's Earnings</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Collections</Text>
          <View style={styles.collection}>
            <Text style={styles.collectionIcon}>📰</Text>
            <View style={styles.collectionInfo}>
              <Text style={styles.collectionName}>News Junkie</Text>
              <Text style={styles.collectionProgress}>8/10 articles</Text>
            </View>
            <Text style={styles.collectionReward}>R$ 2.00</Text>
          </View>
          <View style={styles.collection}>
            <Text style={styles.collectionIcon}>🚀</Text>
            <View style={styles.collectionInfo}>
              <Text style={styles.collectionName}>Tech Guru</Text>
              <Text style={styles.collectionProgress}>4/10 articles</Text>
            </View>
            <Text style={styles.collectionReward}>R$ 5.00</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Leaderboard Rewards</Text>
          <View style={styles.leaderboardRewards}>
            <View style={styles.reward}>
              <Text style={styles.rewardRank}>🥇 1st</Text>
              <Text style={styles.rewardAmount}>R$ 50.00</Text>
            </View>
            <View style={styles.reward}>
              <Text style={styles.rewardRank}>🥈 2nd</Text>
              <Text style={styles.rewardAmount}>R$ 30.00</Text>
            </View>
            <View style={styles.reward}>
              <Text style={styles.rewardRank}>🥉 3rd</Text>
              <Text style={styles.rewardAmount}>R$ 20.00</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  streakCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  streakValue: {
    fontSize: 40,
    marginBottom: 8,
  },
  streakLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  streakBonus: {
    fontSize: 14,
    color: '#10b981',
    marginTop: 8,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  collection: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  collectionIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  collectionProgress: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  collectionReward: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
  },
  leaderboardRewards: {
    flexDirection: 'row',
    gap: 12,
  },
  reward: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  rewardRank: {
    fontSize: 18,
    marginBottom: 8,
  },
  rewardAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
});
