import type { TextStyle, ViewStyle } from 'react-native';

export const colors = {
  brand: '#075E80',
  brandDark: '#063F59',
  accent: '#20A9CD',
  accentSoft: '#E8F7FB',
  background: '#EAF3F6',
  surface: '#FFFFFF',
  text: '#14262E',
  textMuted: '#637982',
  border: '#DCE9ED',
  success: '#169477',
  warning: '#EA8B43',
  error: '#C64B4B',
  white: '#FFFFFF',
  overlay: 'rgba(3, 32, 44, 0.54)',
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 42, lineHeight: 46, fontWeight: '600' } satisfies TextStyle,
  title: { fontSize: 28, lineHeight: 36, fontWeight: '700' } satisfies TextStyle,
  heading: { fontSize: 20, lineHeight: 28, fontWeight: '700' } satisfies TextStyle,
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' } satisfies TextStyle,
  label: { fontSize: 14, lineHeight: 20, fontWeight: '700' } satisfies TextStyle,
  caption: { fontSize: 12, lineHeight: 18, fontWeight: '500' } satisfies TextStyle,
} as const;

export const shadows = {
  card: {
    shadowColor: '#004862',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
  } satisfies ViewStyle,
} as const;

export const theme = { colors, spacing, radii, typography, shadows } as const;
