import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import { useGameStore } from '../../store/auth';

export default function ONZAPGameScreen({ navigation }) {
  const [gameState, setGameState] = useState({ score: 0, gameOver: false });
  const { setGameSession } = useGameStore();

  const handleGameOver = async (score: number) => {
    setGameState({ score, gameOver: true });

    try {
      const response = await fetch('https://api.ongame.com/api/games/onzap/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'session_123', score })
      });

      const data = await response.json();
      setGameSession({ gameType: 'onzap', sessionId: 'session_123', score, reward: data.data.reward });
      navigation.navigate('Results', { game: 'onzap', score, reward: data.data.reward });
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
  };

  if (gameState.gameOver) {
    return (
      <View style={styles.container}>
        <Text style={styles.gameOverText}>Game Over!</Text>
        <Text style={styles.finalScore}>Score: {gameState.score}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💬 ONZAP</Text>
        <Text style={styles.score}>{gameState.score}</Text>
      </View>
      <View style={styles.gameArea}>
        <Text style={styles.placeholder}>Jogo renderizando...</Text>
      </View>
      <TouchableOpacity style={styles.quitButton} onPress={() => navigation.goBack()}>
        <Text style={styles.quitButtonText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  header: {
    backgroundColor: '#7c3aed',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 10
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  score: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold'
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e293b'
  },
  placeholder: {
    color: '#fff',
    fontSize: 18
  },
  gameOverText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 100
  },
  finalScore: {
    color: '#fff',
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 20
  },
  button: {
    backgroundColor: '#7c3aed',
    marginHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  quitButton: {
    backgroundColor: '#ef4444',
    margin: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  quitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});
