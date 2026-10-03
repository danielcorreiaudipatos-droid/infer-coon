import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ONLOVEGameScreen({ navigation }) {
  const [gameState, setGameState] = useState({ score: 0, matches: 0, gameOver: false });

  const handleGameOver = async () => {
    try {
      const response = await fetch('https://api.ongame.com/api/games/onlove/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId: 'session_123', 
          score: gameState.score,
          matches: gameState.matches
        })
      });
      
      const data = await response.json();
      navigation.navigate('Results', { 
        game: 'onlove', 
        score: gameState.score, 
        matches: gameState.matches,
        reward: data.data.reward 
      });
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💘 ONLOVE</Text>
        <View style={styles.stats}>
          <Text style={styles.stat}>Matches: {gameState.matches}</Text>
          <Text style={styles.stat}>Score: {gameState.score}</Text>
        </View>
      </View>
      <View style={styles.gameArea}>
        <Text style={styles.placeholder}>Swipe cards aqui...</Text>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.playButton}>
          <Text style={styles.buttonText}>Jogar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quitButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { backgroundColor: '#ec4899', padding: 15, paddingTop: 25 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  stats: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { color: '#fff', fontSize: 14 },
  gameArea: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e293b' },
  placeholder: { color: '#fff', fontSize: 18 },
  buttonRow: { flexDirection: 'row', padding: 20, gap: 10 },
  playButton: { flex: 1, backgroundColor: '#ec4899', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  quitButton: { flex: 1, backgroundColor: '#ef4444', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
