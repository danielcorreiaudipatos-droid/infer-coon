import { apiService } from './api.service';

export class WalletService {
  static async getWallet() {
    const response = await apiService.get('/wallet');
    return response.data;
  }

  static async getTransactions(limit = 20, offset = 0) {
    const response = await apiService.get('/wallet/transactions', { limit, offset });
    return response.data;
  }
}
