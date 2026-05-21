import { SafeAreaView } from 'react-native-safe-area-context';
import { Paragraph, Text, YStack } from 'tamagui';

import { colors } from '@/theme/colors';

export default function AgendaScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <YStack p="$4" gap="$2">
        <Text fontSize={22} fontWeight="800" color={colors.text}>
          Agenda
        </Text>
        <Paragraph fontSize={13} color={colors.textMuted}>
          Calendário com visitas, SLA por fazenda e janelas de colheita.
        </Paragraph>
      </YStack>

      <YStack flex={1} items="center" justify="center" px="$4">
        <Text fontSize={48}>📅</Text>
        <Paragraph fontSize={14} color={colors.textMuted} text="center" mt="$2">
          Em breve.{'\n'}A agenda vai mostrar suas visitas semanais com SLA visual por fazenda.
        </Paragraph>
      </YStack>
    </SafeAreaView>
  );
}
