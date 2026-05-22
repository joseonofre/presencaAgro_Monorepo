import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { router, useNavigation } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

import { AgendaIcon, BellIcon, MenuIcon } from '@/components/TabIcons';
import { colors } from '@/theme/colors';

function dataHoje(): string {
  const texto = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

interface AppHeaderProps {
  title: string;
  /** Texto do subtítulo. Default: data de hoje por extenso. */
  subtitle?: string;
  /** Mostra o ponto vermelho de notificação no sino. */
  notify?: boolean;
}

/**
 * Header padrão das telas principais (espelha o Figma): menu (drawer) à
 * esquerda, sino + avatar à direita, título grande e subtítulo com a data.
 */
export function AppHeader({ title, subtitle, notify = true }: AppHeaderProps) {
  const navigation = useNavigation<DrawerNavigationProp<Record<string, object | undefined>>>();

  return (
    <YStack
      bg={colors.surface}
      px="$5"
      pt="$2"
      pb="$4"
      gap="$2"
      borderBottomWidth={1}
      borderBottomColor={colors.border}
    >
      <XStack items="center" justify="space-between">
        <Pressable onPress={() => navigation.openDrawer()} hitSlop={12}>
          <MenuIcon color={colors.text} size={22} />
        </Pressable>

        <XStack items="center" gap="$3">
          <Pressable hitSlop={10}>
            <View>
              <BellIcon color={colors.text} size={22} />
              {notify && (
                <View
                  style={{
                    position: 'absolute',
                    top: -1,
                    right: -1,
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    backgroundColor: colors.red,
                    borderWidth: 1,
                    borderColor: colors.surface,
                  }}
                />
              )}
            </View>
          </Pressable>

          <Pressable onPress={() => router.push('/perfil')} hitSlop={8}>
            <YStack
              width={36}
              height={36}
              rounded="$10"
              bg={colors.green}
              items="center"
              justify="center"
              borderWidth={1}
              borderColor={colors.border}
            >
              <Text fontSize={13} fontWeight="700" color={colors.white}>
                ON
              </Text>
            </YStack>
          </Pressable>
        </XStack>
      </XStack>

      <YStack>
        <Text fontSize={24} fontWeight="800" color={colors.text}>
          {title}
        </Text>
        <XStack items="center" gap="$1.5">
          <AgendaIcon color={colors.textMuted} size={13} />
          <Text fontSize={14} color={colors.textMuted}>
            {subtitle ?? dataHoje()}
          </Text>
        </XStack>
      </YStack>
    </YStack>
  );
}
