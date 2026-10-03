import create from 'zustand';

export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  image: string;
  source: string;
  category: string;
  publishedAt: string;
  readTime: number; // minutes
  reward: number;
}

interface NewsState {
  articles: Article[];
  selectedArticle: Article | null;
  loading: boolean;
  fetchFeed: () => Promise<void>;
  selectArticle: (article: Article) => void;
  clearSelected: () => void;
}

const useNewsStore = create<NewsState>((set) => ({
  articles: [],
  selectedArticle: null,
  loading: false,

  fetchFeed: async () => {
    set({ loading: true });
    try {
      const response = await fetch('https://api.ongame.com/api/news/feed');
      const data = await response.json();
      set({ articles: data.articles, loading: false });
    } catch (error) {
      console.error('Fetch feed error:', error);
      set({ loading: false });
    }
  },

  selectArticle: (article) => set({ selectedArticle: article }),
  clearSelected: () => set({ selectedArticle: null }),
}));

export default useNewsStore;
