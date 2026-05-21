import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Paragraph, Text, XStack, YStack } from 'tamagui';

import { colors } from '@/theme/colors';

function InfoRow({ label, valor }: { label: string; valor: string }) {
  return (
    <XStack
      py="$3"
      px="$4"
      justify="space-between"
      items="center"
      borderBottomWidth={1}
      borderBottomColor={colors.border}
    >
      <Text fontSize={13} color={colors.textMuted}>
        {label}
      </Text>
      <Text fontSize={14} fontWeight="600" color={colors.text}>
        {valor}
      </Text>
    </XStack>
  );
}

export default function PerfilScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        <YStack items="center" pt="$4" gap="$2">
          <YStack
            width={88}
            height={88}
            rounded="$10"
            bg={colors.green}
            items="center"
            justify="center"
          >
            <Text fontSize={36} color={colors.white} fontWeight="700">
              ON
            </Text>
          </YStack>
          <Text fontSize={20} fontWeight="800" color={colors.text}>
            Onofre Neto
          </Text>
          <Paragraph fontSize={13} color={colors.textMuted}>
            Consultor agronômico
          </Paragraph>
        </YStack>

        <YStack mt="$4" gap="$2">
          <Text fontSize={12} fontWeight="700" color={colors.textMuted} px="$1">
            EMPRESA ATIVA
          </Text>
          <Card borderWidth={1} borderColor={colors.border} bg={colors.surface} overflow="hidden">
            <InfoRow label="Revenda" valor="Agro Vale" />
            <InfoRow label="Cargo" valor="RTV — Soja" />
            <InfoRow label="Região" valor="Lucas do Rio Verde / MT" />
          </Card>
        </YStack>

        <YStack mt="$4" gap="$2">
          <Text fontSize={12} fontWeight="700" color={colors.textMuted} px="$1">
            CONTATO
          </Text>
          <Card borderWidth={1} borderColor={colors.border} bg={colors.surface} overflow="hidden">
            <InfoRow label="E-mail" valor="onofre@agrovale.com.br" />
            <InfoRow label="WhatsApp" valor="(65) 99876-5432" />
          </Card>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
