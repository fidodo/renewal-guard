// hooks/useTheme.ts
import { useAppDispatch, useAppSelector } from "./redux";
import { toggleTheme, setTheme } from "../store/slices/themeSlice";
import type { Theme } from "../store/slices/themeSlice";

interface UseThemeReturn {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

export const useTheme = (): UseThemeReturn => {
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector((state) => state.theme.current);

  const toggle = (): void => {
    dispatch(toggleTheme());
  };

  const set = (theme: Theme): void => {
    dispatch(setTheme(theme));
  };

  return {
    theme: currentTheme,
    toggleTheme: toggle,
    setTheme: set,
    isDark: currentTheme === "dark",
  };
};
