import { Drawer } from 'expo-router/drawer';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Paragraph, Text, XStack, YStack } from 'tamagui';

import { LogoFull } from '@/components/Logo';
import { colors } from '@/theme/colors';

function CustomDrawerContent() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
      <YStack flex={1} p="$4" gap="$4">
        <YStack items="flex-start" pt="$2">
          <LogoFull size={180} />
        </YStack>

        <YStack gap="$1" mt="$2">
          <Text fontSize={13} color={colors.textMuted} fontWeight="700">
            CONSULTOR
          </Text>
          <Text fontSize={16} color={colors.text} fontWeight="700">
            Onofre Neto
          </Text>
          <Paragraph fontSize={13} color={colors.textMuted}>
            Revenda Agro Vale
          </Paragraph>
        </YStack>

        <View
          style={{
            height: 1,
            backgroundColor: colors.border,
            marginVertical: 8,
          }}
        />

        <YStack gap="$1">
          <DrawerItem label="Sobre o app" />
          <DrawerItem label="Configurações" />
          <DrawerItem label="Ajuda e suporte" />
          <DrawerItem label="Termos e privacidade" />
        </YStack>

        <YStack flex={1} />

        <Pressable>
          <XStack
            p="$3"
            rounded="$3"
            items="center"
            gap="$2"
            borderWidth={1}
            borderColor={colors.border}
          >
            <Text fontSize={14} fontWeight="600" color={colors.red}>
              Sair
            </Text>
          </XStack>
        </Pressable>
      </YStack>
    </SafeAreaView>
  );
}

function DrawerItem({ label }: { label: string }) {
  return (
    <Pressable>
      {({ pressed }) => (
        <YStack
          p="$3"
          rounded="$3"
          bg={pressed ? colors.greenLighter : 'transparent'}
        >
          <Text fontSize={15} color={colors.text} fontWeight="600">
            {label}
          </Text>
        </YStack>
      )}
    </Pressable>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={() => <CustomDrawerContent />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: colors.green,
        drawerStyle: { width: 300 },
      }}
    >
      <Drawer.Screen name="(tabs)" options={{ title: 'Início' }} />
    </Drawer>
  );
}
