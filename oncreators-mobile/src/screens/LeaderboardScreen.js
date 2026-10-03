import React from 'react'
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native'

export default function LeaderboardScreen() {
  const data = [
    { id: '1', rank: 1, name: 'Expert Trader', points: 45000 },
    { id: '2', rank: 2, name: 'Crypto King', points: 42000 },
    { id: '3', rank: 3, name: 'Market Master', points: 38000 },
  ]

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.rankItem}>
            <Text style={[styles.rank, item.rank === 1 && styles.goldRank]}>#{item.rank}</Text>
            <View style={styles.rankInfo}>
              <Text style={styles.rankName}>{item.name}</Text>
            </View>
            <Text style={styles.rankPoints}>{item.points} pts</Text>
          </View>
        )}
        scrollEnabled={false}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  rankItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, marginBottom: 8 },
  rank: { fontSize: 18, fontWeight: 'bold', width: 40 },
  goldRank: { color: '#FFD700' },
  rankInfo: { flex: 1 },
  rankName: { fontSize: 16, fontWeight: 'bold' },
  rankPoints: { fontSize: 16, fontWeight: 'bold', color: '#FF6B35' },
})
