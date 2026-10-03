#!/bin/bash

echo "🚀 Building OnCreators Mobile App..."

# Create directories
mkdir -p src/screens src/components src/services src/store src/utils

# Create 5 main screens
cat > src/screens/GamesScreen.js << 'EOF'
import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'

export default function GamesScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Games & Predictions</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Trading Simulator</Text>
        <Text style={styles.cardText}>Practice trading with virtual money</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Play Now</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Leaderboard</Text>
        <Text style={styles.cardText}>Compete with other traders</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>View Rankings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  card: { backgroundColor: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  cardText: { fontSize: 14, color: '#666', marginBottom: 12 },
  button: { backgroundColor: '#FF6B35', padding: 12, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
})
EOF

cat > src/screens/TVScreen.js << 'EOF'
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
EOF

cat > src/screens/WalletScreen.js << 'EOF'
import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useSelector } from 'react-redux'

export default function WalletScreen() {
  const { balance } = useSelector(state => state.wallet || { balance: 0 })

  return (
    <ScrollView style={styles.container}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>R$ {balance?.toFixed(2) || '0.00'}</Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Deposit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Withdraw</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      <View style={styles.transaction}>
        <Text style={styles.txType}>Deposit</Text>
        <Text style={styles.txAmount}>+R$ 100.00</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  balanceCard: { backgroundColor: '#004E89', padding: 24, borderRadius: 12, marginBottom: 16 },
  balanceLabel: { fontSize: 14, color: '#fff', opacity: 0.9, marginBottom: 8 },
  balanceAmount: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  actionButton: { flex: 1, backgroundColor: '#FF6B35', padding: 12, borderRadius: 8 },
  actionText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  transaction: { backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  txType: { fontWeight: 'bold' },
  txAmount: { color: '#2ECC71', fontWeight: 'bold' },
})
EOF

cat > src/screens/LeaderboardScreen.js << 'EOF'
import React from 'react'
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native'

export default function LeaderboardScreen() {
  const data = [
    { id: '1', rank: 1, name: 'Expert Trader', points: 45000 },
    { id: '2', rank: 2, name: 'Crypto King', points: 42000 },
    { id: '3', rank: 3, name: 'Market Master', points: 38000 },
  ]

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.rankItem}>
            <Text style={[styles.rank, item.rank === 1 && styles.goldRank]}>#{item.rank}</Text>
            <View style={styles.rankInfo}>
              <Text style={styles.rankName}>{item.name}</Text>
            </View>
            <Text style={styles.rankPoints}>{item.points} pts</Text>
          </View>
        )}
        scrollEnabled={false}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  rankItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, marginBottom: 8 },
  rank: { fontSize: 18, fontWeight: 'bold', width: 40 },
  goldRank: { color: '#FFD700' },
  rankInfo: { flex: 1 },
  rankName: { fontSize: 16, fontWeight: 'bold' },
  rankPoints: { fontSize: 16, fontWeight: 'bold', color: '#FF6B35' },
})
EOF

cat > src/screens/ProfileScreen.js << 'EOF'
import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store'

export default function ProfileScreen() {
  const { user } = useSelector(state => state.auth || {})
  const dispatch = useDispatch()

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.firstName?.charAt(0) || 'U'}</Text>
        </View>
        <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>15</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>8</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={() => dispatch(logout())}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FF6B35', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  name: { fontSize: 20, fontWeight: 'bold' },
  email: { fontSize: 14, color: '#666' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 16 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: '#666' },
  logoutButton: { backgroundColor: '#E74C3C', padding: 12, borderRadius: 8 },
  logoutText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
})
EOF

# Create Store
mkdir -p src/store
cat > src/store/index.js << 'EOF'
import { configureStore, createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
    },
    logout: (state) => {
      state.user = null
      state.token = null
    },
  },
})

const walletSlice = createSlice({
  name: 'wallet',
  initialState: { balance: 0 },
  reducers: {
    setBalance: (state, action) => {
      state.balance = action.payload
    },
  },
})

export const { setUser, logout } = authSlice.actions
export const { setBalance } = walletSlice.actions

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    wallet: walletSlice.reducer,
  },
})

export default store
EOF

# Create API service
cat > src/services/api.js << 'EOF'
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3333',
})

api.interceptors.request.use((config) => {
  const token = global.authToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
EOF

# Create .babelrc
cat > .babelrc << 'EOF'
{
  "presets": ["babel-preset-expo"]
}
EOF

# Create index.js
cat > index.js << 'EOF'
import { registerRootComponent } from 'expo'
import App from './App'

registerRootComponent(App)
EOF

# Create README
cat > README.md << 'EOF'
# 📱 OnCreators Mobile App

React Native + Expo with 5-tab navigation

## 🚀 Quick Start

```bash
npm install
npx expo start
```

Then:
- Press `i` for iOS
- Press `a` for Android
- Press `w` for web

## 📱 5 Tabs

1. **Games** - Trading simulator and competitions
2. **TV** - Live streams and market analysis
3. **Wallet** - Manage balance and transactions
4. **Leaderboard** - Rankings and scores
5. **Profile** - User account

## 🛠️ Tech Stack

- React Native
- Expo
- Redux Toolkit
- Axios
- React Navigation

## ✨ Features

- 5-tab navigation
- Redux state management
- API integration
- Real-time balance updates
- Beautiful UI

EOF

echo "✅ Mobile app structure created!"
echo "📱 Run: npx expo start"
