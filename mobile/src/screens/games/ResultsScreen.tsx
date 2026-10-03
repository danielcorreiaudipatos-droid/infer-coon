import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default function ResultsScreen({ route, navigation }) {
  const { game, score, reward, matches, waves } = route.params;

  const gameConfigs = {
    onzap: { icon: '💬', colors: ['#9333EA', '#3B82F6'] },
    onlove: { icon: '💘', colors: ['#EC4899', '#F43F5E'] },
    onmail: { icon: '🛡️', colors: ['#EA580C', '#F59E0B'] }
  };

  const config = gameConfigs[game];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <LinearGradient
        colors={config.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.successCard}
      >
        <Text style={styles.icon}>{config.icon}</Text>
        <Text style={styles.successText}>🎉 Parabéns!</Text>
        <Text style={styles.subtitle}>Prêmios adicionados à sua carteira!</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Score</Text>
            <Text style={styles.statValue}>{score}</Text>
          </View>
          
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Recompensa</Text>
            <Text style={styles.rewardValue}>R$ {reward.toFixed(2)}</Text>
          </View>

          {matches && (
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Matches</Text>
              <Text style={styles.statValue}>{matches}</Text>
            </View>
          )}

          {waves && (
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Ondas</Text>
              <Text style={styles.statValue}>{waves}/20</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.dashboardBtn}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.btnText}>📊 Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.playAgainBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.btnText}>🔄 Jogar Novamente</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  contentContainer: { padding: 20, paddingTop: 40 },
  successCard: { borderRadius: 15, padding: 20, alignItems: 'center', marginBottom: 30 },
  icon: { fontSize: 60, marginBottom: 15 },
  successText: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 20 },
  statsContainer: { width: '100%' },
  statBox: { 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderRadius: 10, 
    padding: 15, 
    marginBottom: 10, 
    alignItems: 'center' 
  },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 5 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  rewardValue: { fontSize: 24, fontWeight: 'bold', color: '#fbbf24' },
  actions: { gap: 12 },
  dashboardBtn: { 
    backgroundColor: '#7c3aed', 
    paddingVertical: 14, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  playAgainBtn: { 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    paddingVertical: 14, 
    borderRadius: 10, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
