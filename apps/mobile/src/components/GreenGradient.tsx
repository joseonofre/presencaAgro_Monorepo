import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { colors } from '@/theme/colors';

/**
 * Fundo em gradiente verde de marca (#006232 → #003a1d), de cima para baixo.
 * Usa react-native-svg (já no projeto) — sem novas dependências, ok offline-first.
 * Posicione dentro de um container com `position: relative` e `overflow: hidden`.
 */
export function GreenGradient() {
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id="agroGreen" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.green} />
          <Stop offset="1" stopColor={colors.greenDeep} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#agroGreen)" />
    </Svg>
  );
}
