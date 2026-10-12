export interface ThemeColors {
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryMuted: string;
  secondary: string;
  bgBase: string;
  bgSurface: string;
  bgSurfaceSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  borderSubtle: string;
  borderStrong: string;
  riskLow: string;
  riskLowBg: string;
  riskLowBorder: string;
  riskMedium: string;
  riskMediumBg: string;
  riskMediumBorder: string;
  riskHigh: string;
  riskHighBg: string;
  riskHighBorder: string;
  cardShadow: string;
}

export const lightColors: ThemeColors = {
  primary: '#4f46e5',
  primaryHover: '#4338ca',
  primaryLight: '#eef2ff',
  primaryMuted: 'rgba(79, 70, 229, 0.12)',
  secondary: '#0f172a',
  bgBase: '#f8fafc',
  bgSurface: '#ffffff',
  bgSurfaceSubtle: '#f1f5f9',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#64748b',
  borderSubtle: '#e2e8f0',
  borderStrong: '#cbd5e1',
  riskLow: '#10b981',
  riskLowBg: '#ecfdf5',
  riskLowBorder: '#a7f3d0',
  riskMedium: '#f59e0b',
  riskMediumBg: '#fffbeb',
  riskMediumBorder: '#fde68a',
  riskHigh: '#ef4444',
  riskHighBg: '#fef2f2',
  riskHighBorder: '#fecaca',
  cardShadow: 'rgba(15, 23, 42, 0.06)',
};

export const darkColors: ThemeColors = {
  primary: '#6366f1',
  primaryHover: '#818cf8',
  primaryLight: '#1e1b4b',
  primaryMuted: 'rgba(99, 102, 241, 0.2)',
  secondary: '#0b0f17',
  bgBase: '#090d16',
  bgSurface: '#111827',
  bgSurfaceSubtle: '#151e2e',
  textPrimary: '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  borderSubtle: '#1f293d',
  borderStrong: '#334155',
  riskLow: '#34d399',
  riskLowBg: 'rgba(16, 185, 129, 0.12)',
  riskLowBorder: 'rgba(16, 185, 129, 0.25)',
  riskMedium: '#fbbf24',
  riskMediumBg: 'rgba(245, 158, 11, 0.12)',
  riskMediumBorder: 'rgba(245, 158, 11, 0.25)',
  riskHigh: '#f87171',
  riskHighBg: 'rgba(239, 68, 68, 0.12)',
  riskHighBorder: 'rgba(239, 68, 68, 0.25)',
  cardShadow: 'rgba(0, 0, 0, 0.4)',
};
