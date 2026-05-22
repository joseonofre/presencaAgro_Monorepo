import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Paragraph, Text, YStack } from 'tamagui';

import { LogoMark } from '@/components/Logo';
import { PrimaryButton, SecondaryButton } from '@/components/forms';
import { colors } from '@/theme/colors';

export default function LandingScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.green }}>
      <YStack flex={1} justify="space-between" px="$5" py="$6">
        {/* Hero */}
        <YStack flex={1} justify="center" items="center" gap="$5">
          <YStack
            width={112}
            height={112}
            rounded="$9"
            bg={colors.white}
            items="center"
            justify="center"
          >
            <LogoMark size={64} color={colors.green} />
          </YStack>

          <YStack items="center" gap="$3">
            <Text fontSize={30} fontWeight="800" color={colors.white} text="center">
              Presença Agro
            </Text>
            <Paragraph
              fontSize={16}
              color={colors.greenLight}
              text="center"
              lineHeight={24}
              maxW={320}
            >
              Inteligência por talhão, do campo ao relatório: registre visitas mesmo
              sem sinal, acompanhe o histórico de cada safra e gere laudos com a marca
              da sua revenda.
            </Paragraph>
          </YStack>
        </YStack>

        {/* Ações */}
        <YStack bg={colors.surface} rounded="$8" p="$4" gap="$3">
          <PrimaryButton label="Entrar" onPress={() => router.push('/login')} />
          <SecondaryButton label="Criar conta" onPress={() => router.push('/cadastro')} />
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}
