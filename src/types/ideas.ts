export type IdeaCategory = 'stock' | 'crypto';
export type IdeaType = 'idea' | 'script' | 'post';

export interface TradingIdea {
  id: string;
  title: string;
  author: string;
  category: IdeaCategory;
  type: IdeaType;
  summary: string;
  content?: string; // For scripts, this is the code snippet
  imageUrl?: string;
  tradingViewUrl: string;
  createdAt: string;
  likes: number;
  comments: number;
}
