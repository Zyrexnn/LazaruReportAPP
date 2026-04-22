import { create } from 'zustand';

type ThemeState = {
  themeMode: 'light' | 'dark';
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  themeMode: 'dark', // default to dark as per premium vibe, or light
  toggleTheme: () => set((state) => ({ themeMode: state.themeMode === 'dark' ? 'light' : 'dark' })),
}));
