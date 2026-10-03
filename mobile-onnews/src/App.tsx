import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from './store';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './navigation/RootNavigator';
import { AuthService } from './services/auth.service';

export default function App() {
  useEffect(() => {
    // Initialize app - check auth token
    AuthService.checkAuth();
  }, []);

  return (
    <Provider store={store}>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <RootNavigator />
      </NavigationContainer>
    </Provider>
  );
}
