/**
 * ADS Inteligente - Mobile App
 * React Native (Expo)
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ADS Inteligente</Text>
      <Text style={styles.subtitle}>Dashboard Móvel</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0e27',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f0f0f0',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#94a3b8',
  },
});
