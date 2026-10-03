import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import GamesScreen from '../screens/games/GamesScreen';
import LeaderboardScreen from '../screens/leaderboard/LeaderboardScreen';
import TVScreen from '../screens/tv/TVScreen';
import ShopScreen from '../screens/shop/ShopScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor: '#1e293b',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 4,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Games"
        component={GamesScreen}
        options={{
          tabBarLabel: '🎮 Games',
          tabBarIcon: ({ color }) => (
            <Ionicons name="game-controller" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          tabBarLabel: '🏆 Top',
          tabBarIcon: ({ color }) => (
            <Ionicons name="podium" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="TV"
        component={TVScreen}
        options={{
          tabBarLabel: '📺 TV',
          tabBarIcon: ({ color }) => (
            <Ionicons name="tv" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Shop"
        component={ShopScreen}
        options={{
          tabBarLabel: '🛍️ Shop',
          tabBarIcon: ({ color }) => (
            <Ionicons name="bag" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: '👤 Perfil',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
