import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from 'tamagui';

import { AppHeader } from '@/components/AppHeader';
import {
  ChevronDownIcon,
  DollarIcon,
  FilterIcon,
  MapPinIcon,
  MoreVerticalIcon,
  ShareIcon,
  UserIcon,
} from '@/components/TabIcons';
import {
  formatBRL,
  mockPedidos,
  statusPedidoLabel,
  type Pedido,
  type StatusPedido,
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

const statusBadge: Record<StatusPedido, { bg: string; fg: string }> = {
  pendente: { bg: 'rgba(234,179,8,0.1)', fg: '#a16207' },
  aprovado: { bg: 'rgba(0,98,50,0.1)', fg: colors.green },
  cancelado: { bg: 'rgba(220,38,38,0.1)', fg: '#dc2626' },
};

type FiltroStatus = 'todos' | StatusPedido;

const STATUS_OPCOES: { key: FiltroStatus; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'pendente', label: 'Pendente' },
  { key: 'aprovado', label: 'Aprovado' },
  { key: 'cancelado', label: 'Cancelado' },
];

function SelectFalso({ label }: { label: string }) {
  return (
    <XStack
      bg="#f9fafb"
      borderWidth={1}
      borderColor={colors.border}
      rounded="$3"
      px="$3"
      py="$2.5"
      items="center"
      justify="space-between"
    >
      <Text fontSize={14} color="#1f2937">
        {label}
      </Text>
      <ChevronDownIcon color={colors.textMuted} size={14} />
    </XStack>
  );
}

function FiltrosCard({
  status,
  onStatus,
}: {
  status: FiltroStatus;
  onStatus: (s: FiltroStatus) => void;
}) {
  return (
    <YStack
      bg={colors.surface}
      rounded="$6"
      borderWidth={1}
      borderColor={colors.border}
      overflow="hidden"
      style={styles.cardShadow}
    >
      <XStack px="$4" py="$3.5" items="center" gap="$2" borderBottomWidth={1} borderBottomColor={colors.border}>
        <FilterIcon color={colors.text} size={16} />
        <Text fontSize={14} fontWeight="700" color={colors.text}>
          Filtrar pedidos
        </Text>
      </XStack>

      <YStack px="$4" pb="$4" pt="$3" gap="$3">
        <YStack gap="$2">
          <Text fontSize={12} fontWeight="600" color="#4b5563">
            Status
          </Text>
          <XStack gap="$2" flexWrap="wrap">
            {STATUS_OPCOES.map((opt) => {
              const ativo = status === opt.key;
              return (
                <Pressable key={opt.key} onPress={() => onStatus(opt.key)}>
                  <YStack
                    px="$3"
                    py="$2.5"
                    rounded="$4"
                    borderWidth={2}
                    borderColor={ativo ? colors.green : colors.border}
                    bg={ativo ? colors.green : colors.surface}
                  >
                    <Text fontSize={12} fontWeight="600" color={ativo ? colors.white : '#374151'}>
                      {opt.label}
                    </Text>
                  </YStack>
                </Pressable>
              );
            })}
          </XStack>
        </YStack>

        <YStack gap="$2">
          <Text fontSize={12} fontWeight="600" color="#4b5563">
            Cliente
          </Text>
          <SelectFalso label="Todos os clientes" />
        </YStack>

        <YStack gap="$2">
          <Text fontSize={12} fontWeight="600" color="#4b5563">
            Fazenda
          </Text>
          <SelectFalso label="Todas as fazendas" />
        </YStack>
      </YStack>
    </YStack>
  );
}

function PedidoCard({ pedido }: { pedido: Pedido }) {
  const badge = statusBadge[pedido.status];
  const cancelado = pedido.status === 'cancelado';

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
            {pedido.clienteNome}
          </Text>
          <Text fontSize={14} color={colors.textMuted}>
            {pedido.fazendaNome}
          </Text>
        </YStack>
        <YStack style={{ backgroundColor: badge.bg }} px="$2.5" py="$1" rounded="$3">
          <Text fontSize={10} fontWeight="700" style={{ color: badge.fg }} textTransform="uppercase">
            {statusPedidoLabel[pedido.status]}
          </Text>
        </YStack>
      </XStack>

      <YStack gap="$2">
        <XStack gap="$2" items="center">
          <UserIcon color={colors.textMuted} size={12} />
          <Text fontSize={12} color="#4b5563">
            <Text fontSize={12} fontWeight="600" color="#4b5563">
              Responsável:
            </Text>{' '}
            {pedido.responsavel}
          </Text>
        </XStack>
        <XStack gap="$2" items="center">
          <MapPinIcon color={colors.textMuted} size={12} />
          <Text fontSize={12} color="#4b5563">
            <Text fontSize={12} fontWeight="600" color="#4b5563">
              Local:
            </Text>{' '}
            {pedido.local}
          </Text>
        </XStack>
        <XStack gap="$2" items="center">
          <DollarIcon color={cancelado ? colors.textSoft : colors.green} size={12} />
          <Text
            fontSize={14}
            fontWeight="700"
            color={cancelado ? colors.textSoft : colors.green}
            textDecorationLine={cancelado ? 'line-through' : 'none'}
          >
            {formatBRL(pedido.valor)}
          </Text>
        </XStack>
      </YStack>

      <YStack gap="$2">
        <XStack bg="#f3f4f6" rounded="$3" py="$2.5" items="center" justify="center" gap="$2">
          <ShareIcon color="#374151" size={12} />
          <Text fontSize={12} fontWeight="600" color="#374151">
            Compartilhar Pedido
          </Text>
        </XStack>
        <XStack
          bg={colors.surface}
          borderWidth={1}
          borderColor={colors.border}
          rounded="$3"
          py="$2.5"
          items="center"
          justify="center"
          gap="$2"
        >
          <MoreVerticalIcon color="#374151" size={12} />
          <Text fontSize={12} fontWeight="600" color="#374151">
            Mais Ações
          </Text>
        </XStack>
      </YStack>
    </YStack>
  );
}

export default function PedidosScreen() {
  const [status, setStatus] = useState<FiltroStatus>('todos');

  const pedidos = useMemo(
    () => (status === 'todos' ? mockPedidos : mockPedidos.filter((p) => p.status === status)),
    [status],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <AppHeader title="Pedidos" />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 96, gap: 16 }}>
        <FiltrosCard status={status} onStatus={setStatus} />
        {pedidos.map((p) => (
          <PedidoCard key={p.id} pedido={p} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
