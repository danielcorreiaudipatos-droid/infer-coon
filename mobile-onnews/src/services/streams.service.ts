import { apiService } from './api.service';

export class StreamsService {
  static async getCurrentStream() {
    const response = await apiService.get('/streams/current');
    return response.data;
  }

  static async getSchedule() {
    const response = await apiService.get('/streams/schedule');
    return response.data;
  }

  static async startWatching(streamId: string) {
    const response = await apiService.post('/streams/watch/start', { streamId });
    return response.data;
  }

  static async endWatching(sessionId: string) {
    const response = await apiService.post(`/streams/watch/end/${sessionId}`, {});
    return response.data;
  }

  static async getUserStats() {
    const response = await apiService.get('/streams/stats');
    return response.data;
  }
}
