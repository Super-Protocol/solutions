import {
  FC, createContext, useMemo, ReactNode, useContext, useEffect,
} from 'react';
import { Theme } from '@/utils/types';
import { BG_DARK, BG_LIGHT } from 'src/common/constants';

export interface IThemeContext {
  theme: Theme;
}

export const ThemeContext = createContext<IThemeContext>({
  theme: Theme.dark,
});

export interface ThemeProviderProps {
  children: ReactNode | string;
}

export const setBodyTheme = (theme: Theme) => {
  const body = document?.querySelector('body');
  if (body) {
    const removeClass = theme === Theme.dark ? Theme.light : Theme.dark;
    body.classList.remove(removeClass);
    body.classList.add(theme);
    body.setAttribute('data-theme', theme);
  }
  const html = document?.querySelector('html');
  if (html) {
    html.setAttribute('style', `background: ${theme === Theme.dark ? BG_DARK : BG_LIGHT}`);
  }
};

export const ThemeProvider: FC<ThemeProviderProps> = ({ children }) => {
  const data = useMemo(() => ({
    theme: Theme.dark, // todo get from some storage
  }), []);
  useEffect(() => {
    setBodyTheme(data.theme);
  }, [data.theme]);
  return (
    <ThemeContext.Provider value={data}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const props = useContext(ThemeContext);
  return props;
};