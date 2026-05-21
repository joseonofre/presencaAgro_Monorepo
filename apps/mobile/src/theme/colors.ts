/**
 * Paleta Presença Agro — alinhada à logomarca.
 *
 * Cor primária #006232 vem do logo oficial. Variantes derivadas para
 * estados (hover, light backgrounds, dark active) seguem prática de
 * design system com diferença suficiente para acessibilidade AA.
 */
export const colors = {
  // Verde agro (do logo)
  green: '#006232',
  greenDark: '#004f28',
  greenDeep: '#003a1d',
  greenLight: '#d1fae5',
  greenLighter: '#f0fdf4',

  // Acentos secundários
  amber: '#f59e0b',
  amberLight: '#fef3c7',
  red: '#dc2626',
  redLight: '#fee2e2',
  blue: '#1e40af',
  blueLight: '#dbeafe',
  soil: '#78350f',

  // Neutros
  bg: '#f8fafc',
  surface: '#ffffff',
  text: '#0f172a',
  textMuted: '#64748b',
  textSoft: '#94a3b8',
  border: '#e2e8f0',
  borderStrong: '#cbd5e1',

  white: '#ffffff',
  black: '#0f172a',
} as const;

export type ColorKey = keyof typeof colors;
