import type { NivelInfestacao } from '@/data/mocks';

import { colors } from './colors';

/** Buckets de severidade exibidos na UI (timeline, detalhe da visita). */
export type Severidade = 'normal' | 'alerta' | 'critico';

/** Mapeia o nível de infestação para um dos três buckets visuais. */
export function nivelParaSeveridade(n?: NivelInfestacao): Severidade {
  if (n === 'critico') return 'critico';
  if (n === 'medio' || n === 'alto') return 'alerta';
  return 'normal'; // baixo ou sem praga
}

export const severidadeLabel: Record<Severidade, string> = {
  normal: 'Normal',
  alerta: 'Alerta',
  critico: 'Crítico',
};

/** Cor do ponto/indicador por severidade. */
export const severidadeDot: Record<Severidade, string> = {
  normal: colors.green,
  alerta: colors.amber,
  critico: colors.red,
};

/** Fundo e texto do badge de severidade (chip claro). */
export const severidadeBadge: Record<Severidade, { bg: string; fg: string }> = {
  normal: { bg: colors.greenLight, fg: colors.green },
  alerta: { bg: colors.amberLight, fg: '#a16207' },
  critico: { bg: colors.redLight, fg: '#b91c1c' },
};
