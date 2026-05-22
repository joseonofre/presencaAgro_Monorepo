import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Paragraph, Text, XStack, YStack } from 'tamagui';

import { AppHeader } from '@/components/AppHeader';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FilterIcon,
  LayersIcon,
  ShareIcon,
  TargetIcon,
} from '@/components/TabIcons';
import {
  nivelMaisAltoDoTalhao,
  tipoLabel,
  type VisitaSalva,
} from '@/data/mocks';
import { getVisitas } from '@/data/storage';
import { colors } from '@/theme/colors';
import { nivelParaSeveridade, severidadeDot, type Severidade } from '@/theme/severity';

// ─── Helpers de data e severidade ────────────────────────────────────

const MESES_ABREV = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function horaDe(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function chaveDia(iso: string): string {
  return iso.slice(0, 10);
}

function severidadeDaVisita(v: VisitaSalva): Severidade {
  const sevs = v.ocorrencias.map((o) => nivelParaSeveridade(nivelMaisAltoDoTalhao(o)));
  if (sevs.includes('critico')) return 'critico';
  if (sevs.includes('alerta')) return 'alerta';
  return 'normal';
}

interface GrupoDia {
  chave: string;
  dia: number;
  mes: string;
  diaSemana: string;
  visitas: VisitaSalva[];
}

function agruparPorDia(visitas: VisitaSalva[]): GrupoDia[] {
  const mapa = new Map<string, VisitaSalva[]>();
  for (const v of visitas) {
    const k = chaveDia(v.data);
    if (!mapa.has(k)) mapa.set(k, []);
    mapa.get(k)!.push(v);
  }
  return Array.from(mapa.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([chave, lista]) => {
      const d = new Date(lista[0].data);
      const diaSemana = d.toLocaleDateString('pt-BR', { weekday: 'long' });
      return {
        chave,
        dia: d.getDate(),
        mes: MESES_ABREV[d.getMonth()],
        diaSemana: diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1),
        visitas: lista.sort((a, b) => (a.data < b.data ? -1 : 1)),
      };
    });
}

// ─── Filtros ──────────────────────────────────────────────────────────

type FiltroStatus = 'todos' | Severidade;

const STATUS_OPCOES: { key: FiltroStatus; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'normal', label: 'Normal' },
  { key: 'alerta', label: 'Alerta' },
  { key: 'critico', label: 'Crítico' },
];

function FiltrosCard({
  status,
  onStatus,
}: {
  status: FiltroStatus;
  onStatus: (s: FiltroStatus) => void;
}) {
  const [aberto, setAberto] = useState(true);

  return (
    <YStack
      bg={colors.surface}
      rounded="$6"
      borderWidth={1}
      borderColor={colors.border}
      overflow="hidden"
      style={styles.cardShadow}
    >
      <Pressable onPress={() => setAberto((a) => !a)}>
        <XStack px="$4" py="$3.5" items="center" justify="space-between">
          <XStack items="center" gap="$2">
            <FilterIcon color={colors.text} size={16} />
            <Text fontSize={14} fontWeight="700" color={colors.text}>
              Filtrar visitas
            </Text>
          </XStack>
          {aberto ? (
            <ChevronDownIcon color={colors.textMuted} size={16} />
          ) : (
            <ChevronRightIcon color={colors.textMuted} size={16} />
          )}
        </XStack>
      </Pressable>

      {aberto && (
        <YStack px="$4" pb="$4" pt="$1" gap="$3" borderTopWidth={1} borderTopColor={colors.border}>
          <YStack gap="$2" pt="$3">
            <Text fontSize={12} fontWeight="600" color="#4b5563">
              Período
            </Text>
            <SelectFalso label="Últimos 7 dias" />
          </YStack>

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
                      <Text
                        fontSize={12}
                        fontWeight="600"
                        color={ativo ? colors.white : '#374151'}
                      >
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
      )}
    </YStack>
  );
}

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

// ─── Card de visita na timeline ───────────────────────────────────────

function VisitaCard({ visita, ultimo }: { visita: VisitaSalva; ultimo: boolean }) {
  const sev = severidadeDaVisita(visita);
  const totalTalhoes = visita.ocorrencias.length;

  return (
    <View style={styles.timelineRow}>
      {!ultimo && <View style={styles.timelineLine} />}
      <View style={[styles.timelineNode, { backgroundColor: severidadeDot[sev] }]} />

      <Pressable
        onPress={() => router.push(`/visita/${visita.id}`)}
        style={({ pressed }) => [pressed && { opacity: 0.9 }]}
      >
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
              <XStack items="center" gap="$2">
                <YStack bg="rgba(0,98,50,0.1)" px="$2" py="$0.5" rounded="$2">
                  <Text fontSize={10} fontWeight="700" color={colors.green} textTransform="uppercase">
                    Concluída
                  </Text>
                </YStack>
                <Text fontSize={12} color={colors.textSoft}>
                  {horaDe(visita.data)}
                </Text>
              </XStack>
              <Text fontSize={16} fontWeight="700" color={colors.text}>
                {visita.fazendaNome}
              </Text>
            </YStack>
            <ChevronRightIcon color={colors.textSoft} size={16} />
          </XStack>

          <YStack gap="$2">
            <XStack items="center" gap="$2">
              <TargetIcon color={colors.textMuted} size={13} />
              <Text fontSize={12} fontWeight="500" color="#4b5563">
                {tipoLabel[visita.tipo]}
              </Text>
            </XStack>
            <XStack items="center" gap="$2">
              <LayersIcon color={colors.textMuted} size={13} />
              <Text fontSize={12} color="#4b5563">
                <Text fontSize={12} fontWeight="700" color={colors.green}>
                  {totalTalhoes}
                </Text>{' '}
                talhã{totalTalhoes === 1 ? 'o' : 'es'} visitado{totalTalhoes === 1 ? '' : 's'}
              </Text>
            </XStack>
            {totalTalhoes > 0 && (
              <XStack gap="$1.5" items="center">
                {visita.ocorrencias.map((o, i) => {
                  const s = nivelParaSeveridade(nivelMaisAltoDoTalhao(o));
                  return (
                    <View
                      key={`${o.talhaoId}-${i}`}
                      style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: severidadeDot[s] }}
                    />
                  );
                })}
              </XStack>
            )}
          </YStack>

          <XStack
            bg="#f3f4f6"
            rounded="$3"
            py="$2.5"
            items="center"
            justify="center"
            gap="$2"
          >
            <ShareIcon color="#374151" size={12} />
            <Text fontSize={12} fontWeight="600" color="#374151">
              Compartilhar Visita
            </Text>
          </XStack>
        </YStack>
      </Pressable>
    </View>
  );
}

// ─── Tela ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  timelineRow: {
    paddingLeft: 40,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 19,
    top: 28,
    bottom: -24,
    width: 2,
    backgroundColor: colors.borderStrong,
  },
  timelineNode: {
    position: 'absolute',
    left: 12,
    top: 24,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: colors.surface,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'ios' ? 24 : 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.greenDeep,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
});

export default function VisitasScreen() {
  const [salvas, setSalvas] = useState<VisitaSalva[]>([]);
  const [status, setStatus] = useState<FiltroStatus>('todos');

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      getVisitas().then((lista) => {
        if (ativo) setSalvas(lista);
      });
      return () => {
        ativo = false;
      };
    }, []),
  );

  const grupos = useMemo(() => {
    const filtradas =
      status === 'todos' ? salvas : salvas.filter((v) => severidadeDaVisita(v) === status);
    return agruparPorDia(filtradas);
  }, [salvas, status]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <AppHeader title="Visitas" />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 96, gap: 32 }}>
        <FiltrosCard status={status} onStatus={setStatus} />

        {grupos.length === 0 ? (
          <YStack items="center" py="$8" gap="$2">
            <Paragraph fontSize={14} color={colors.textMuted} text="center">
              {salvas.length === 0
                ? 'Você ainda não registrou nenhuma visita.\nToque no + para começar.'
                : 'Nenhuma visita para esse filtro.'}
            </Paragraph>
          </YStack>
        ) : (
          grupos.map((g) => (
            <YStack key={g.chave} gap="$4">
              <XStack items="center" gap="$3">
                <YStack bg={colors.green} px="$3" py="$1.5" rounded="$3" items="center">
                  <Text fontSize={12} fontWeight="700" color={colors.white}>
                    {g.dia}
                  </Text>
                  <Text fontSize={10} color={colors.white} textTransform="uppercase">
                    {g.mes}
                  </Text>
                </YStack>
                <YStack>
                  <Text fontSize={14} fontWeight="700" color={colors.text}>
                    {g.diaSemana}
                  </Text>
                  <Text fontSize={12} color={colors.textMuted}>
                    {g.visitas.length} visita{g.visitas.length === 1 ? '' : 's'} realizada
                    {g.visitas.length === 1 ? '' : 's'}
                  </Text>
                </YStack>
              </XStack>

              <YStack gap="$6">
                {g.visitas.map((v, i) => (
                  <VisitaCard key={v.id} visita={v} ultimo={i === g.visitas.length - 1} />
                ))}
              </YStack>
            </YStack>
          ))
        )}
      </ScrollView>

      <Pressable
        onPress={() => router.push('/visita/nova')}
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}
        hitSlop={8}
      >
        <Text style={{ color: colors.white, fontSize: 30, fontWeight: '300', lineHeight: 32 }}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}
