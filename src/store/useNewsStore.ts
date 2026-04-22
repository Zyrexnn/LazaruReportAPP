import { create } from 'zustand';
import type { NewsArticle } from '@/src/types/news';

type NewsStore = {
  selectedArticle: NewsArticle | null;
  setSelectedArticle: (article: NewsArticle | null) => void;
};

export const useNewsStore = create<NewsStore>((set) => ({
  selectedArticle: null,
  setSelectedArticle: (selectedArticle) => set({ selectedArticle }),
}));
