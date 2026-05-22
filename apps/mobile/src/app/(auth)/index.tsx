import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Paragraph, Text, XStack, YStack } from 'tamagui';

import {
  BuildingIcon,
  CheckIcon,
  FileTextIcon,
  LogInIcon,
  MapPinIcon,
  UserPlusIcon,
  UsersIcon,
  WifiIcon,
} from '@/components/FeatureIcons';
import { GreenGradient } from '@/components/GreenGradient';
import { LogoMark } from '@/components/Logo';
import { PrimaryButton, SecondaryButton } from '@/components/forms';
import { colors } from '@/theme/colors';

const FEATURES = [
  {
    icon: <UsersIcon />,
    title: 'Gerencie clientes e fazendas',
    desc: 'Organize todos os seus clientes, fazendas e propriedades em um só lugar',
  },
  {
    icon: <WifiIcon />,
    title: 'Funciona offline',
    desc: 'Registre visitas mesmo sem conexão com a internet, sincronize depois',
  },
  {
    icon: <MapPinIcon />,
    title: 'Registre visitas detalhadas',
    desc: 'Capture fotos, localização GPS e todas as informações importantes',
  },
  {
    icon: <FileTextIcon />,
    title: 'Gere relatórios completos',
    desc: 'Crie relatórios profissionais e compartilhe com seus clientes',
  },
  {
    icon: <BuildingIcon />,
    title: 'Uso individual e corporativo',
    desc: 'Perfeito para consultores individuais e equipes empresariais',
  },
];

const BENEFITS = [
  'Aumente sua produtividade em campo',
  'Mantenha histórico completo de visitas',
  'Impressione seus clientes com relatórios',
  'Trabalhe de qualquer lugar',
];

export default function LandingScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {/* Header em gradiente */}
        <YStack position="relative" overflow="hidden" pt={insets.top + 40} pb="$7" px="$6" items="center" gap="$3">
          <GreenGradient />
          <LogoMark size={60} color={colors.white} />
          <Text fontSize={30} fontWeight="800" color={colors.white} letterSpacing={-0.5}>
            Presença Agro
          </Text>
          <Paragraph fontSize={14} color="rgba(255,255,255,0.9)" text="center" lineHeight={22} maxW={300}>
            Sistema completo de gestão e acompanhamento de visitas agrícolas
          </Paragraph>
        </YStack>

        {/* Cards de feature */}
        <YStack px="$4" pt="$4" gap="$3">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} />
          ))}
        </YStack>

        {/* Por que usar? */}
        <YStack px="$4" pt="$4">
          <YStack bg={colors.greenLighter} rounded={16} p="$4" borderWidth={1} borderColor={colors.greenLight} gap="$3">
            <XStack items="center" gap="$3">
              <YStack width={48} height={48} rounded={9999} bg={colors.green} items="center" justify="center">
                <CheckIcon color={colors.white} size={22} />
              </YStack>
              <Text fontSize={18} fontWeight="800" color={colors.text}>
                Por que usar?
              </Text>
            </XStack>
            <YStack gap="$2.5">
              {BENEFITS.map((b) => (
                <XStack key={b} items="center" gap="$2.5">
                  <CheckIcon size={18} />
                  <Text fontSize={14} color={colors.text} flex={1}>
                    {b}
                  </Text>
                </XStack>
              ))}
            </YStack>
          </YStack>
        </YStack>

        {/* Ações */}
        <YStack px="$4" pt="$5" gap="$3">
          <PrimaryButton label="Fazer Login" icon={<LogInIcon />} onPress={() => router.push('/login')} />
          <SecondaryButton
            label="Criar Conta Grátis"
            icon={<UserPlusIcon />}
            onPress={() => router.push('/cadastro')}
          />
        </YStack>

        {/* Footer */}
        <YStack items="center" pt="$5" gap="$1">
          <Text fontSize={12} color={colors.textMuted}>
            Versão 1.0.0
          </Text>
          <Text fontSize={12} color={colors.textSoft}>
            © 2026 Presença Agro. Todos os direitos reservados.
          </Text>
        </YStack>
      </ScrollView>
    </View>
  );
}

function FeatureCard({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <YStack
      bg={colors.surface}
      rounded={16}
      p="$4"
      borderWidth={1}
      borderColor={colors.border}
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}
    >
      <XStack gap="$3" items="flex-start">
        <YStack width={56} height={56} rounded={12} bg={colors.greenLight} items="center" justify="center">
          {icon}
        </YStack>
        <YStack flex={1} gap="$1">
          <Text fontSize={16} fontWeight="700" color={colors.text}>
            {title}
          </Text>
          <Paragraph fontSize={14} color={colors.textMuted} lineHeight={21}>
            {desc}
          </Paragraph>
        </YStack>
      </XStack>
    </YStack>
  );
}
