import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';

interface Stream {
  id: string;
  title: string;
  description: string;
  reward_per_min: number;
  is_live: boolean;
}

interface Quote {
  symbol: string;
  price: number;
  change_percent: number;
}

export default function TVScreen() {
  const [stream, setStream] = useState<Stream | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [watching, setWatching] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [earnings, setEarnings] = useState(0);
  const [minutesWatched, setMinutesWatched] = useState(0);
  const [loading, setLoading] = useState(true);

  const API_URL = 'https://api.ongame.com';

  useEffect(() => {
    fetchCurrentStream();
    fetchQuotes();
  }, []);

  const fetchCurrentStream = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tv/stream`);
      setStream(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stream:', error);
      setLoading(false);
    }
  };

  const fetchQuotes = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tv/quotes`);
      setQuotes(response.data);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    }
  };

  const startWatching = async () => {
    if (!stream) return;

    try {
      const response = await axios.post(`${API_URL}/api/tv/watch/start`, {
        stream_id: stream.id,
      });
      setSessionId(response.data.id);
      setWatching(true);

      // Start timer to calculate earnings
      const startTime = new Date();
      const interval = setInterval(() => {
        const now = new Date();
        const minutes = (now.getTime() - startTime.getTime()) / 60000;
        setMinutesWatched(Math.round(minutes));
        setEarnings(minutes * stream.reward_per_min);
      }, 1000);

      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error starting watch:', error);
    }
  };

  const stopWatching = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/api/tv/watch/end/${sessionId}`,
        {}
      );
      setWatching(false);
      setSessionId('');
      setMinutesWatched(0);

      // Show earned amount
      alert(`Você ganhou R$ ${response.data.earnings.toFixed(2)}!`);
    } catch (error) {
      console.error('Error stopping watch:', error);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>📺 ONNEWS TV</Text>
          <Text style={styles.subtitle}>Assista e ganhe R$</Text>
        </View>

        {/* Video Player Placeholder */}
        <View style={styles.playerContainer}>
          <View style={styles.videoPlaceholder}>
            <Text style={styles.playerText}>🎥 Video Stream Aqui</Text>
            {stream && (
              <Text style={styles.streamTitle}>{stream.title}</Text>
            )}
          </View>
        </View>

        {/* Quotes Ticker */}
        <View style={styles.tickerContainer}>
          <Text style={styles.tickerTitle}>📊 Cotações em Tempo Real</Text>
          {quotes.map((quote) => (
            <View key={quote.symbol} style={styles.quoteItem}>
              <View>
                <Text style={styles.quoteName}>{quote.symbol}</Text>
              </View>
              <View style={styles.quoteValue}>
                <Text style={styles.quotePrice}>
                  R$ {quote.price.toLocaleString('pt-BR')}
                </Text>
                <Text
                  style={[
                    styles.quoteChange,
                    {
                      color: quote.change_percent >= 0 ? '#10b981' : '#ef4444',
                    },
                  ]}
                >
                  {quote.change_percent >= 0 ? '+' : ''}
                  {quote.change_percent.toFixed(2)}%
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Earnings Display */}
        {watching && (
          <View style={styles.earningsContainer}>
            <Text style={styles.earningsLabel}>💰 Ganho Agora</Text>
            <Text style={styles.earningsAmount}>
              R$ {earnings.toFixed(2)}
            </Text>
            <Text style={styles.minutesText}>
              {minutesWatched} minutos assistindo
            </Text>
          </View>
        )}

        {/* Watch Button */}
        <TouchableOpacity
          style={[styles.button, watching && styles.buttonActive]}
          onPress={watching ? stopWatching : startWatching}
        >
          <Text style={styles.buttonText}>
            {watching ? '⏹️ Parar Assistir' : '▶️ Começar Assistir'}
          </Text>
        </TouchableOpacity>
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
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  playerContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  videoPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  playerText: {
    fontSize: 32,
    marginBottom: 8,
  },
  streamTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tickerContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  quoteItem: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quoteName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  quoteValue: {
    alignItems: 'flex-end',
  },
  quotePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  quoteChange: {
    fontSize: 12,
    fontWeight: '500',
  },
  earningsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  earningsLabel: {
    color: '#9ca3af',
    fontSize: 12,
  },
  earningsAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10b981',
    marginTop: 4,
  },
  minutesText: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    marginHorizontal: 20,
    marginBottom: 40,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
