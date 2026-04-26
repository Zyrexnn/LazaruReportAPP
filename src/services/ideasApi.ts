import { MOCK_IDEAS } from './ideasMockData';
import { TradingIdea, IdeaCategory, IdeaType } from '../types/ideas';

export const fetchTradingIdeas = async (
  category?: IdeaCategory,
  type?: IdeaType
): Promise<TradingIdea[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  let filtered = [...MOCK_IDEAS];

  if (category) {
    filtered = filtered.filter(item => item.category === category);
  }

  if (type) {
    filtered = filtered.filter(item => item.type === type);
  }

  return filtered;
};
