import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ArticleDetailScreen({ route, navigation }: any) {
  const article = route.params?.article;
  const [liked, setLiked] = useState(false);
  const [readProgress, setReadProgress] = useState(0);

  if (!article) return null;

  return (
    <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} onScroll={(e) => {
        const progress = (e.nativeEvent.contentOffset.y / e.nativeEvent.contentSize.height) * 100;
        setReadProgress(Math.min(progress, 100));
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Image source={{ uri: article.image }} style={styles.image} />

        <View style={styles.content}>
          <Text style={styles.category}>{article.category}</Text>
          <Text style={styles.title}>{article.title}</Text>
          <Text style={styles.meta}>{article.source} • {article.publishedAt}</Text>

          <Text style={styles.body}>{article.content}</Text>

          <View style={styles.engagement}>
            <TouchableOpacity
              style={[styles.engagementBtn, liked && styles.engagementBtnActive]}
              onPress={() => setLiked(!liked)}
            >
              <Text style={styles.engagementBtnText}>{liked ? '❤️' : '🤍'} Like</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.engagementBtn}>
              <Text style={styles.engagementBtnText}>💬 Comment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.engagementBtn}>
              <Text style={styles.engagementBtnText}>📤 Share</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rewardBox}>
            <Text style={styles.rewardLabel}>Earned for reading:</Text>
            <Text style={styles.rewardAmount}>R$ {article.reward.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: `${readProgress}%` }]} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 12,
  },
  backText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 20,
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  meta: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 20,
  },
  body: {
    fontSize: 16,
    color: '#e2e8f0',
    lineHeight: 24,
    marginBottom: 24,
  },
  engagement: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  engagementBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  engagementBtnActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  engagementBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  rewardBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  rewardLabel: {
    color: '#9ca3af',
    fontSize: 12,
  },
  rewardAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10b981',
    marginTop: 4,
  },
  progressBar: {
    height: 3,
    backgroundColor: '#1e293b',
  },
  progress: {
    height: '100%',
    backgroundColor: '#2563eb',
  },
});
