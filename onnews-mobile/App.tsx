import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import useAuthStore from './src/store/authStore';
import FeedScreen from './src/screens/news/FeedScreen';
import ArticleDetailScreen from './src/screens/news/ArticleDetailScreen';
import RewardsScreen from './src/screens/rewards/RewardsScreen';
import LeaderboardScreen from './src/screens/leaderboard/LeaderboardScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import LoginScreen from './src/screens/auth/LoginScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function NewsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Feed" component={FeedScreen} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: { backgroundColor: '#0f172a', borderTopColor: '#1e293b' },
      }}
    >
      <Tab.Screen name="Feed" component={NewsStack} options={{ tabBarLabel: '📰 News' }} />
      <Tab.Screen name="Rewards" component={RewardsScreen} options={{ tabBarLabel: '🏆 Rewards' }} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} options={{ tabBarLabel: '📊 Top' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: '👤 Profile' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="MainApp" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
