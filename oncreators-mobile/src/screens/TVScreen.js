import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'

export default function TVScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Live TV & Streams</Text>
      <View style={styles.liveCard}>
        <View style={styles.liveIndicator}><Text style={styles.liveText}>● LIVE</Text></View>
        <Text style={styles.streamTitle}>Market Analysis - EUR/USD</Text>
        <Text style={styles.streamCreator}>By Expert Analyst</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Watch Now</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Streams</Text>
        <Text style={styles.cardText}>Bitcoin Technical Analysis</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  liveCard: { backgroundColor: '#fff3cd', padding: 16, borderRadius: 8, marginBottom: 12 },
  liveIndicator: { marginBottom: 8 },
  liveText: { color: '#d9534f', fontWeight: 'bold' },
  streamTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  streamCreator: { fontSize: 14, color: '#666', marginBottom: 12 },
  card: { backgroundColor: '#f5f5f5', padding: 16, borderRadius: 8 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  cardText: { fontSize: 14, color: '#666' },
  button: { backgroundColor: '#FF6B35', padding: 12, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
})
