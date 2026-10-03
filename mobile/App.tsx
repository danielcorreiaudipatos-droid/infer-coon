import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from './src/store/auth';
import { usePushNotifications } from './src/hooks/usePushNotifications';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ONZAPGameScreen from './src/screens/games/ONZAPGameScreen';
import ONLOVEGameScreen from './src/screens/games/ONLOVEGameScreen';
import ONMAILGameScreen from './src/screens/games/ONMAILGameScreen';
import ResultsScreen from './src/screens/games/ResultsScreen';
import StudioScreen from './src/screens/StudioScreen';
import StudioEditorScreen from './src/screens/StudioEditorScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import WalletScreen from './src/screens/WalletScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const GameIcon = ({ name, color, size }) => {
  const icons = {
    Home: '🎮',
    Games: '🕹️',
    Studio: '✨',
    Leaderboard: '🏆',
    Wallet: '💰',
    Settings: '⚙️'
  };
  return <Text style={{ fontSize: size, color }}>{icons[name]}</Text>;
};

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#0f172a' }
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

// Game Stack
function GameStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1e293b' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        cardStyle: { backgroundColor: '#0f172a' }
      }}
    >
      <Stack.Screen
        name="ONZAP"
        component={ONZAPGameScreen}
        options={{ title: '💬 ONZAP' }}
      />
      <Stack.Screen
        name="ONLOVE"
        component={ONLOVEGameScreen}
        options={{ title: '💘 ONLOVE' }}
      />
      <Stack.Screen
        name="ONMAIL"
        component={ONMAILGameScreen}
        options={{ title: '🛡️ ONMAIL' }}
      />
      <Stack.Screen
        name="Results"
        component={ResultsScreen}
        options={{ title: '🏆 Resultados' }}
      />
    </Stack.Navigator>
  );
}

// Main App Stack (Authenticated)
function MainStack() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#7c3aed' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarStyle: {
          backgroundColor: '#1e293b',
          borderTopColor: '#374151',
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarActiveTintColor: '#a78bfa',
        tabBarInactiveTintColor: '#6b7280',
        cardStyle: { backgroundColor: '#0f172a' }
      })}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <GameIcon name="Home" color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="Games"
        component={GameStack}
        options={{
          title: 'Jogos',
          tabBarLabel: 'Jogos',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <GameIcon name="Games" color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="Studio"
        component={StudioScreen}
        options={{
          title: 'Studio',
          tabBarLabel: 'Studio',
          tabBarIcon: ({ color, size }) => <GameIcon name="Studio" color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          title: 'Ranking',
          tabBarLabel: 'Ranking',
          tabBarIcon: ({ color, size }) => <GameIcon name="Leaderboard" color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          title: 'Wallet',
          tabBarLabel: 'Wallet',
          tabBarIcon: ({ color, size }) => <GameIcon name="Wallet" color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Configurações',
          tabBarLabel: 'Mais',
          tabBarIcon: ({ color, size }) => <GameIcon name="Settings" color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
}

// Root Navigator
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { user, setUser } = useAuthStore();
  usePushNotifications();

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      // Check if user has stored credentials
      const userToken = await SecureStore.getItemAsync('userToken');
      if (userToken) {
        // Validate token with backend
        const response = await fetch('https://api.ongame.com/auth/profile', {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Token expired
          await SecureStore.deleteItemAsync('userToken');
        }
      }
    } catch (error) {
      console.error('Bootstrap error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen
            name="Main"
            component={MainStack}
            options={{ animationEnabled: false }}
          />
        ) : (
          <Stack.Screen
            name="Auth"
            component={AuthStack}
            options={{ animationEnabled: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
