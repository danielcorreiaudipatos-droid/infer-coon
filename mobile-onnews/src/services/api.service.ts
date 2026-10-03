import axios, { AxiosInstance } from 'axios';
import { AuthService } from './auth.service';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 10000,
    });

    // Add auth interceptor
    this.api.interceptors.request.use(async (config) => {
      const headers = await AuthService.getAuthHeader();
      config.headers = { ...config.headers, ...headers };
      return config;
    });
  }

  async get(url: string, params?: any) {
    return this.api.get(url, { params });
  }

  async post(url: string, data?: any) {
    return this.api.post(url, data);
  }

  async patch(url: string, data?: any) {
    return this.api.patch(url, data);
  }

  async delete(url: string) {
    return this.api.delete(url);
  }
}

export const apiService = new ApiService();
