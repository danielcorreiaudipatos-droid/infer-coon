import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Cosmetic {
  id: string;
  name: string;
  type: 'skin' | 'effect' | 'theme';
  price: number;
  icon: string;
  description: string;
}

const cosmetics: Cosmetic[] = [
  { id: '1', name: 'Gold Skin', type: 'skin', price: 4.99, icon: '👑', description: 'Premium character skin' },
  { id: '2', name: 'Fire Effect', type: 'effect', price: 2.99, icon: '🔥', description: 'Burning animation' },
  { id: '3', name: 'Dark Theme', type: 'theme', price: 1.99, icon: '🌙', description: 'Dark UI theme' },
  { id: '4', name: 'Diamond Skin', type: 'skin', price: 9.99, icon: '💎', description: 'Ultra rare skin' },
  { id: '5', name: 'Ice Effect', type: 'effect', price: 2.99, icon: '❄️', description: 'Frozen particles' },
  { id: '6', name: 'Neon Theme', type: 'theme', price: 1.99, icon: '🌐', description: 'Neon UI theme' },
];

export default function ShopScreen() {
  const [owned, setOwned] = useState<string[]>([]);

  const handleBuy = (cosmetic: Cosmetic) => {
    if (!owned.includes(cosmetic.id)) {
      setOwned([...owned, cosmetic.id]);
    }
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>🛍️ Cosmetics Shop</Text>
          <Text style={styles.subtitle}>Customize your game experience</Text>
        </View>

        <View style={styles.grid}>
          {cosmetics.map((cosmetic) => (
            <View key={cosmetic.id} style={styles.itemContainer}>
              <View style={styles.itemCard}>
                <Text style={styles.itemIcon}>{cosmetic.icon}</Text>
                <Text style={styles.itemName}>{cosmetic.name}</Text>
                <Text style={styles.itemDesc}>{cosmetic.description}</Text>
                <Text style={styles.itemPrice}>R$ {cosmetic.price.toFixed(2)}</Text>

                <TouchableOpacity
                  style={[
                    styles.buyBtn,
                    owned.includes(cosmetic.id) && styles.ownedBtn,
                  ]}
                  onPress={() => handleBuy(cosmetic)}
                  disabled={owned.includes(cosmetic.id)}
                >
                  <Text style={styles.buyBtnText}>
                    {owned.includes(cosmetic.id) ? '✓ Owned' : 'Buy Now'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  grid: {
    paddingHorizontal: 12,
    paddingBottom: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemContainer: {
    width: '48%',
    marginBottom: 16,
  },
  itemCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  itemIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  itemDesc: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ade80',
    marginTop: 8,
  },
  buyBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 12,
    width: '100%',
  },
  ownedBtn: {
    backgroundColor: '#10b981',
  },
  buyBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
