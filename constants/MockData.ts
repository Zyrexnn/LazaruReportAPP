export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  imageUrl: string;
  category: string;
}

export const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'BRICS Financial Realignment: A New Global Standard',
    excerpt: 'The BRICS nations are moving towards a unified payment system, challenging the dominance of traditional financial networks.',
    author: 'Lazarus Intelligence',
    date: '2024-04-21',
    imageUrl: 'https://images.unsplash.com/photo-1611974714658-dc3d17960fc5?q=80&w=2070&auto=format&fit=crop',
    category: 'Finance',
  },
  {
    id: '2',
    title: 'Global Energy Transition: Geopolitical Implications',
    excerpt: 'How the shift to renewable energy is redrawing the map of global influence and power dynamics between nations.',
    author: 'Strategic Analysis',
    date: '2024-04-20',
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=2070&auto=format&fit=crop',
    category: 'Geopolitics',
  },
  {
    id: '3',
    title: 'Cryptocurrency Regulation: The Obsidian Dossier Strategy',
    excerpt: 'An exclusive look into how major world economies are approaching the regulation of decentralized digital assets.',
    author: 'Security Desk',
    date: '2024-04-19',
    imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=2069&auto=format&fit=crop',
    category: 'Crypto',
  },
];
