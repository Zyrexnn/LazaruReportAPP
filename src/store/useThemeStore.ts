import type { ThemeName } from "@/constants/theme";
import { create } from "zustand";

const THEME_ORDER: ThemeName[] = ["snow", "obsidian", "ocean", "forest"];

type ThemeState = {
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  cycleTheme: () => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  themeName: "snow", // default to white/snow theme
  setTheme: (name) => set({ themeName: name }),
  cycleTheme: () =>
    set((state) => {
      const idx = THEME_ORDER.indexOf(state.themeName);
      const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
      return { themeName: next };
    }),
}));
