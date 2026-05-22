import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from 'tamagui';

import { AppHeader } from '@/components/AppHeader';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  EditIcon,
  LayersIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  PlusIcon,
} from '@/components/TabIcons';
import {
  mockClientes,
  mockFazendas,
  statsFazenda,
  type Cliente,
  type Fazenda,
} from '@/data/mocks';
import { colors } from '@/theme/colors';

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});

function FazendaItem({ fazenda }: { fazenda: Fazenda }) {
  const stats = statsFazenda(fazenda.id);
  return (
    <YStack bg="#f9fafb" borderWidth={1} borderColor={colors.border} rounded="$3" p="$3" gap="$0.5">
      <Text fontSize={14} fontWeight="600" color={colors.text}>
        {fazenda.nome}
      </Text>
      <Text fontSize={12} color={colors.textMuted}>
        {fazenda.municipio}, {fazenda.estado}
      </Text>
      <XStack gap="$4" items="center" pt="$1.5">
        <XStack gap="$1.5" items="center">
          <LayersIcon color={colors.textMuted} size={12} />
          <Text fontSize={12} color="#4b5563">
            {stats.talhoes} talhõ{stats.talhoes === 1 ? 'es' : 'es'}
          </Text>
        </XStack>
        <XStack gap="$1.5" items="center">
          <MapPinIcon color={colors.textMuted} size={12} />
          <Text fontSize={12} color="#4b5563">
            {stats.areaHa} ha
          </Text>
        </XStack>
      </XStack>
    </YStack>
  );
}

function ClienteCard({ cliente }: { cliente: Cliente }) {
  const [aberto, setAberto] = useState(false);
  const fazendas = mockFazendas.filter((f) => cliente.fazendaIds.includes(f.id));

  return (
    <YStack
      bg={colors.surface}
      rounded="$6"
      borderWidth={1}
      borderColor={colors.border}
      p="$4"
      gap="$3"
      style={styles.cardShadow}
    >
      <XStack items="flex-start" justify="space-between">
        <YStack flex={1} gap="$1">
          <Text fontSize={16} fontWeight="700" color={colors.text}>
            {cliente.nome}
          </Text>
          <XStack gap="$2" items="center">
            <PhoneIcon color={colors.textMuted} size={12} />
            <Text fontSize={12} color="#4b5563">
              {cliente.telefone}
            </Text>
          </XStack>
          <XStack gap="$2" items="center">
            <MailIcon color={colors.textMuted} size={12} />
            <Text fontSize={12} color="#4b5563">
              {cliente.email}
            </Text>
          </XStack>
        </YStack>
        <Pressable hitSlop={8}>
          <EditIcon color={colors.green} size={18} />
        </Pressable>
      </XStack>

      <Pressable onPress={() => setAberto((a) => !a)}>
        <XStack
          items="center"
          justify="space-between"
          borderTopWidth={1}
          borderTopColor={colors.border}
          pt="$3"
        >
          <XStack gap="$2" items="center">
            <LayersIcon color={colors.text} size={16} />
            <Text fontSize={14} fontWeight="600" color={colors.text}>
              Fazendas
            </Text>
            <YStack bg="rgba(0,98,50,0.1)" px="$2" py="$0.5" rounded="$10">
              <Text fontSize={12} fontWeight="700" color={colors.green}>
                {fazendas.length}
              </Text>
            </YStack>
          </XStack>
          {aberto ? (
            <ChevronDownIcon color={colors.textMuted} size={14} />
          ) : (
            <ChevronRightIcon color={colors.textMuted} size={14} />
          )}
        </XStack>
      </Pressable>

      {aberto && (
        <YStack gap="$2">
          {fazendas.map((f) => (
            <FazendaItem key={f.id} fazenda={f} />
          ))}
          <XStack
            borderWidth={2}
            borderColor="rgba(0,98,50,0.3)"
            rounded="$3"
            py="$3"
            items="center"
            justify="center"
            gap="$2"
            bg="rgba(0,98,50,0.05)"
            style={{ borderStyle: 'dashed' }}
          >
            <PlusIcon color={colors.green} size={14} />
            <Text fontSize={14} fontWeight="600" color={colors.green}>
              Adicionar Fazenda
            </Text>
          </XStack>
        </YStack>
      )}
    </YStack>
  );
}

export default function ClientesScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <AppHeader title="Clientes" />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 96, gap: 16 }}>
        {mockClientes.map((c) => (
          <ClienteCard key={c.id} cliente={c} />
        ))}

        <Pressable>
          <XStack
            bg={colors.green}
            rounded="$5"
            py="$3.5"
            items="center"
            justify="center"
            gap="$2"
            style={styles.cardShadow}
          >
            <PlusIcon color={colors.white} size={18} />
            <Text fontSize={15} fontWeight="700" color={colors.white}>
              Adicionar Cliente
            </Text>
          </XStack>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
