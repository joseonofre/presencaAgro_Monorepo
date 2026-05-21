import { router, useNavigation } from 'expo-router';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Paragraph, Text, XStack, YStack } from 'tamagui';

import { LogoFull } from '@/components/Logo';
import { MenuIcon } from '@/components/TabIcons';
import { colors } from '@/theme/colors';

function FeatureCard({
  emoji,
  title,
  description,
  onPress,
}: {
  emoji: string;
  title: string;
  description: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Card
          p="$4"
          borderWidth={1}
          borderColor={colors.border}
          bg={pressed ? colors.greenLighter : colors.surface}
        >
          <XStack gap="$3" items="flex-start">
            <YStack
              width={52}
              height={52}
              rounded="$4"
              bg={colors.greenLight}
              items="center"
              justify="center"
            >
              <Text fontSize={26}>{emoji}</Text>
            </YStack>
            <YStack flex={1} gap="$1">
              <Text fontSize={16} fontWeight="700" color={colors.text}>
                {title}
              </Text>
              <Paragraph fontSize={13} color={colors.textMuted} lineHeight={18}>
                {description}
              </Paragraph>
            </YStack>
          </XStack>
        </Card>
      )}
    </Pressable>
  );
}

export default function InicioScreen() {
  const navigation = useNavigation<DrawerNavigationProp<{ '(tabs)': undefined }>>();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      {/* Header com botão menu (drawer) */}
      <XStack px="$4" py="$3" items="center" justify="space-between">
        <Pressable onPress={() => navigation.openDrawer()} hitSlop={12}>
          <MenuIcon color={colors.text} />
        </Pressable>
        <LogoFull size={140} />
        <YStack width={24} />
      </XStack>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        <YStack gap="$4">
          {/* Hero */}
          <YStack gap="$2" pt="$3">
            <Text fontSize={26} fontWeight="800" color={colors.text}>
              Bem-vindo, Onofre
            </Text>
            <Paragraph fontSize={15} color={colors.textMuted} lineHeight={22}>
              O Presença Agro é a sua ferramenta de campo para registrar visitas
              técnicas, monitorar pragas, acompanhar o histórico de cada talhão
              e gerar relatórios profissionais com a marca da sua revenda.
            </Paragraph>
          </YStack>

          {/* Ações principais */}
          <YStack gap="$3" mt="$2">
            <Text fontSize={13} fontWeight="700" color={colors.textMuted}>
              AÇÕES
            </Text>

            <FeatureCard
              emoji="💬"
              title="Nova visita"
              description="Registre uma visita guiada por chat: GPS sugere fazendas próximas, capture fotos e gere relatório."
              onPress={() => router.push('/visita/nova')}
            />

            <FeatureCard
              emoji="📅"
              title="Agenda"
              description="Veja suas visitas agendadas, fazendas com SLA vencido e janelas de colheita."
              onPress={() => router.push('/agenda')}
            />

            <FeatureCard
              emoji="📋"
              title="Minhas visitas"
              description="Histórico de visitas registradas, com fotos georreferenciadas e ocorrências."
              onPress={() => router.push('/visitas')}
            />
          </YStack>

          {/* Sobre o produto */}
          <YStack gap="$2" mt="$3">
            <Text fontSize={13} fontWeight="700" color={colors.textMuted}>
              O QUE O APP FAZ
            </Text>
            <Card p="$4" borderWidth={1} borderColor={colors.border} bg={colors.surface}>
              <YStack gap="$3">
                <Linha
                  emoji="🌱"
                  texto="Registra visitas técnicas no campo, mesmo sem sinal."
                />
                <Linha
                  emoji="📍"
                  texto="Foto georreferenciada como evidência da ocorrência, vinculada ao talhão."
                />
                <Linha
                  emoji="🔄"
                  texto="Sincroniza tudo automaticamente quando voltar ao WiFi ou 4G."
                />
                <Linha
                  emoji="📄"
                  texto="Gera relatório em PDF com a marca da sua revenda, pronto pra enviar pelo WhatsApp."
                />
                <Linha
                  emoji="📊"
                  texto="Histórico longitudinal por talhão pra comparar safras lado a lado."
                />
              </YStack>
            </Card>
          </YStack>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}

function Linha({ emoji, texto }: { emoji: string; texto: string }) {
  return (
    <XStack gap="$3" items="flex-start">
      <Text fontSize={18}>{emoji}</Text>
      <Text fontSize={14} color={colors.text} lineHeight={20} flex={1}>
        {texto}
      </Text>
    </XStack>
  );
}
