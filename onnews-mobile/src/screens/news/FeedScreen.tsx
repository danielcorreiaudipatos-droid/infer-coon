import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import useNewsStore from '../../store/newsStore';

export default function FeedScreen({ navigation }: any) {
  const articles = useNewsStore((state) => state.articles);
  const fetchFeed = useNewsStore((state) => state.fetchFeed);
  const selectArticle = useNewsStore((state) => state.selectArticle);

  useEffect(() => {
    fetchFeed();
  }, []);

  const renderArticleCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        selectArticle(item);
        navigation.navigate('ArticleDetail', { article: item });
      }}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.source}>{item.source} • {item.readTime}m</Text>
          <Text style={styles.reward}>💰 R$ {item.reward.toFixed(2)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📰 ONNEWS</Text>
        <Text style={styles.headerSubtitle}>Read. Earn. Repeat.</Text>
      </View>

      <FlatList
        data={articles}
        renderItem={renderArticleCard}
        keyExtractor={(item) => item.id}
        scrollEnabled={true}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 12,
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  source: {
    fontSize: 12,
    color: '#9ca3af',
  },
  reward: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
  },
});
