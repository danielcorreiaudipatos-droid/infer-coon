import { apiService } from './api.service';

export class QuotesService {
  static async getQuotes() {
    const response = await apiService.get('/quotes');
    return response.data;
  }

  static async getHistory(symbol: string, limit = 100) {
    const response = await apiService.get(`/quotes/${symbol}/history`, { limit });
    return response.data;
  }
}
