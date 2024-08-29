import { useTheme } from '../context/ThemeContext';

interface ThemeColors {
  root: string;
  background: string;
  text: string;
  primary: string;
  secondary: string;
  accent: string;
  hover: string;
  weekday: string;
  non_month: string;
}

const lightTheme: ThemeColors = {
  root: 'bg-amber-50',
  background: 'bg-amber-100',
  text: 'text-slate-800',
  primary: 'bg-amber-600 text-white hover:bg-amber-500',
  secondary: 'bg-amber-200 text-slate-700',
  accent: 'text-amber-600',
  hover: 'hover:bg-amber-200',
  weekday: '#ffffff',
  non_month: '#e8e8e8',

};

const darkTheme: ThemeColors = {
  root: 'bg-slate-800',
  background: 'bg-slate-900',
  text: 'text-slate-100',
  primary: 'bg-amber-500 text-slate-900 hover:bg-amber-400',
  secondary: 'bg-slate-700 text-amber-100',
  accent: 'text-amber-400',
  hover: 'hover:bg-slate-700',
  weekday: '#b6d3fc',
  non_month: '#52525b',
};

export const useThemeColors = () => {
  const { isDarkMode } = useTheme();
  return isDarkMode ? darkTheme : lightTheme;
};

type ThemeKey = keyof ThemeColors;

export const getThemeClass = (key: ThemeKey) => {
  const colors = useThemeColors();
  return colors[key];
};