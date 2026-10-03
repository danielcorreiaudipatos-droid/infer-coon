import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'

export default function GamesScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Games & Predictions</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Trading Simulator</Text>
        <Text style={styles.cardText}>Practice trading with virtual money</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Play Now</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Leaderboard</Text>
        <Text style={styles.cardText}>Compete with other traders</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>View Rankings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  card: { backgroundColor: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  cardText: { fontSize: 14, color: '#666', marginBottom: 12 },
  button: { backgroundColor: '#FF6B35', padding: 12, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
})
