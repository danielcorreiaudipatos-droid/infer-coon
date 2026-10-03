import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Dimensions
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuthStore } from '../store/auth';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const { user } = useAuthStore();
  const [gameStats, setGameStats] = useState({
    onzapBest: 5000,
    onloveBest: 1850,
    onmailBest: 18,
    totalPoints: 7350,
    badges: 5,
    skinsUnlocked: 3
  });

  const games = [
    {
      id: 'onzap',
      name: 'ONZAP',
      icon: '💬',
      description: 'WhatsApp Battle',
      color: ['#9333EA', '#3B82F6'],
      screen: 'ONZAP',
      score: gameStats.onzapBest
    },
    {
      id: 'onlove',
      name: 'ONLOVE',
      icon: '💘',
      description: 'Tinder Simulator',
      color: ['#EC4899', '#F43F5E'],
      screen: 'ONLOVE',
      score: gameStats.onloveBest
    },
    {
      id: 'onmail',
      name: 'ONMAIL',
      icon: '🛡️',
      description: 'Tower Defense',
      color: ['#EA580C', '#F59E0B'],
      screen: 'ONMAIL',
      score: `${gameStats.onmailBest}/20`
    }
  ];

  const renderGameCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Games', { screen: item.screen })}
      style={styles.gameCard}
    >
      <LinearGradient
        colors={item.color}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gameGradient}
      >
        <Text style={styles.gameIcon}>{item.icon}</Text>
        <Text style={styles.gameName}>{item.name}</Text>
        <Text style={styles.gameDesc}>{item.description}</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{item.score}</Text>
        </View>
        <TouchableOpacity style={styles.playButton}>
          <Text style={styles.playText}>▶ Jogar</Text>
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#7c3aed', '#ec4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Olá, {user?.name || 'Jogador'}! 👋</Text>
            <Text style={styles.subGreeting}>Bem-vindo de volta</Text>
          </View>
          {user?.picture && (
            <Image
              source={{ uri: user.picture }}
              style={styles.avatar}
            />
          )}
        </View>
      </LinearGradient>

      {/* Wallet Card */}
      <LinearGradient
        colors={['#ec4899', '#f43f5e']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.walletCard}
      >
        <View style={styles.walletContent}>
          <View>
            <Text style={styles.walletLabel}>Saldo do Wallet</Text>
            <Text style={styles.walletAmount}>R$ {user?.walletBalance.toFixed(2) || '0.00'}</Text>
          </View>
          <Text style={styles.walletIcon}>💰</Text>
        </View>
        <TouchableOpacity style={styles.addFundsButton}>
          <Text style={styles.addFundsText}>+ Carregar</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Meus Jogos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎮 Meus Jogos</Text>
        <FlatList
          data={games}
          renderItem={renderGameCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Minhas Estatísticas</Text>
        <View style={styles.statsGrid}>
          <LinearGradient
            colors={['#9333EA', '#ec4899']}
            style={styles.statBox}
          >
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>{gameStats.totalPoints}</Text>
            <Text style={styles.statLabel}>Pontos</Text>
          </LinearGradient>
          <LinearGradient
            colors={['#ec4899', '#f97316']}
            style={styles.statBox}
          >
            <Text style={styles.statIcon}>🏆</Text>
            <Text style={styles.statValue}>{gameStats.badges}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </LinearGradient>
          <LinearGradient
            colors={['#f97316', '#f59e0b']}
            style={styles.statBox}
          >
            <Text style={styles.statIcon}>🎨</Text>
            <Text style={styles.statValue}>{gameStats.skinsUnlocked}</Text>
            <Text style={styles.statLabel}>Skins</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Studio CTA */}
      <LinearGradient
        colors={['#10b981', '#059669']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.studioCTA}
      >
        <Text style={styles.ctaIcon}>✨</Text>
        <Text style={styles.ctaTitle}>Crie Seus Próprios Jogos</Text>
        <Text style={styles.ctaDescription}>
          Use nosso Game Builder Studio para criar e monetizar seus jogos
        </Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate('Studio')}
        >
          <Text style={styles.ctaButtonText}>Ir para Studio</Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  header: {
    padding: 20,
    paddingTop: 40
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5
  },
  subGreeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)'
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30
  },
  walletCard: {
    margin: 20,
    padding: 20,
    borderRadius: 15,
    marginBottom: 30
  },
  walletContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15
  },
  walletLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 5
  },
  walletAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff'
  },
  walletIcon: {
    fontSize: 40
  },
  addFundsButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  addFundsText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15
  },
  gameCard: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden'
  },
  gameGradient: {
    padding: 15,
    alignItems: 'center'
  },
  gameIcon: {
    fontSize: 50,
    marginBottom: 10
  },
  gameName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5
  },
  gameDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 10
  },
  scoreContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center'
  },
  scoreLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)'
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff'
  },
  playButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center'
  },
  playText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10
  },
  statBox: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statIcon: {
    fontSize: 30,
    marginBottom: 8
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5
  },
  studioCTA: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center'
  },
  ctaIcon: {
    fontSize: 50,
    marginBottom: 10
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center'
  },
  ctaDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 15,
    textAlign: 'center'
  },
  ctaButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center'
  },
  ctaButtonText: {
    color: '#059669',
    fontWeight: 'bold',
    fontSize: 14
  }
});
