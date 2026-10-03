import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export class AuthService {
  static async register(email: string, username: string, password: string) {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email,
      username,
      password,
    });
    
    await SecureStore.setItemAsync('access_token', response.data.access_token);
    return response.data;
  }

  static async login(email: string, password: string) {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    
    await SecureStore.setItemAsync('access_token', response.data.access_token);
    return response.data;
  }

  static async logout() {
    await SecureStore.deleteItemAsync('access_token');
  }

  static async getToken() {
    return await SecureStore.getItemAsync('access_token');
  }

  static async checkAuth() {
    const token = await this.getToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          await this.logout();
          return false;
        }
        return true;
      } catch {
        await this.logout();
        return false;
      }
    }
    return false;
  }

  static async getAuthHeader() {
    const token = await this.getToken();
    return { Authorization: `Bearer ${token}` };
  }
}
