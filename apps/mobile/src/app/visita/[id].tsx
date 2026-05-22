import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Paragraph, Spinner, Text, XStack, YStack } from 'tamagui';

import {
  BackIcon,
  EditIcon,
  FileTextIcon,
  ShareIcon,
} from '@/components/TabIcons';
import {
  mockTalhoes,
  nivelMaisAltoDoTalhao,
  pragasDoTalhao,
  tipoLabel,
  type OcorrenciaTalhao,
  type VisitaSalva,
} from '@/data/mocks';
import { getVisitas } from '@/data/storage';
import { colors } from '@/theme/colors';
import {
  nivelParaSeveridade,
  severidadeBadge,
  severidadeDot,
  severidadeLabel,
  type Severidade,
} from '@/theme/severity';

function areaDoTalhao(talhaoId: string): number | undefined {
  return mockTalhoes.find((t) => t.id === talhaoId)?.area_ha;
}

function horaDe(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// ─── Blocos auxiliares ────────────────────────────────────────────────

function CampoCinza({ label, valor }: { label: string; valor: string }) {
  return (
    <YStack bg="#f9fafb" rounded="$4" p="$3" gap="$1.5">
      <Text fontSize={12} fontWeight="600" color={colors.textMuted}>
        {label}
      </Text>
      <Text fontSize={14} color="#374151" lineHeight={20}>
        {valor}
      </Text>
    </YStack>
  );
}

function FotoStrip({ fotos }: { fotos: { uri: string }[] }) {
  if (fotos.length === 0) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <XStack gap="$2" pr="$2">
        {fotos.map((f, i) => (
          <Image key={`${f.uri}-${i}`} source={{ uri: f.uri }} style={styles.foto} />
        ))}
      </XStack>
    </ScrollView>
  );
}

// ─── Card de talhão ───────────────────────────────────────────────────

function TalhaoCard({ ocorrencia, tipo }: { ocorrencia: OcorrenciaTalhao; tipo: VisitaSalva['tipo'] }) {
  const sev = nivelParaSeveridade(nivelMaisAltoDoTalhao(ocorrencia));
  const area = areaDoTalhao(ocorrencia.talhaoId);
  const badge = severidadeBadge[sev];
  const pragas = pragasDoTalhao(ocorrencia);

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
        <YStack gap="$1" items="flex-start">
          <Text fontSize={16} fontWeight="700" color={colors.text}>
            {ocorrencia.talhaoNome}
          </Text>
          <YStack style={{ backgroundColor: badge.bg }} px="$2" py="$0.5" rounded="$2">
            <Text fontSize={10} fontWeight="700" style={{ color: badge.fg }} textTransform="uppercase">
              {severidadeLabel[sev]}
            </Text>
          </YStack>
        </YStack>
        {area !== undefined && (
          <YStack items="flex-end">
            <Text fontSize={12} color={colors.textMuted}>
              Área
            </Text>
            <Text fontSize={14} fontWeight="700" color={colors.text}>
              {area} ha
            </Text>
          </YStack>
        )}
      </XStack>

      {ocorrencia.observacao && <CampoCinza label="Observação" valor={ocorrencia.observacao} />}
      {ocorrencia.recomendacao && <CampoCinza label="Sugestão" valor={ocorrencia.recomendacao} />}

      {/* Monitoramento: pragas com fotos próprias */}
      {tipo === 'monitoramento_pragas' && pragas.length > 0 && (
        <YStack gap="$3">
          <Text fontSize={12} fontWeight="600" color={colors.textMuted}>
            Pragas Identificadas
          </Text>
          {pragas.map((p, i) => {
            const ps = nivelParaSeveridade(p.nivelInfestacao);
            return (
              <YStack key={`${p.pragaNome}-${i}`} gap="$2">
                <XStack items="center" gap="$2">
                  <View
                    style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: severidadeDot[ps] }}
                  />
                  <Text fontSize={13} fontWeight="700" color={colors.text}>
                    {p.pragaNome}
                  </Text>
                  {p.nivelInfestacao && (
                    <YStack style={{ backgroundColor: severidadeBadge[ps].bg }} px="$2" py="$0.5" rounded="$2">
                      <Text fontSize={10} fontWeight="700" style={{ color: severidadeBadge[ps].fg }} textTransform="uppercase">
                        {severidadeLabel[ps]}
                      </Text>
                    </YStack>
                  )}
                </XStack>
                {p.fotos.length > 0 ? (
                  <FotoStrip fotos={p.fotos} />
                ) : (
                  <Text fontSize={12} color={colors.textSoft}>
                    Sem fotos desta praga.
                  </Text>
                )}
              </YStack>
            );
          })}
        </YStack>
      )}

      {/* Plantio / Colheita: campos da tipologia + fotos do talhão */}
      {tipo !== 'monitoramento_pragas' && (
        <YStack gap="$2">
          {ocorrencia.cultura && <CampoCinza label="Cultura" valor={ocorrencia.cultura} />}
          {ocorrencia.variedade && <CampoCinza label="Variedade" valor={ocorrencia.variedade} />}
          {ocorrencia.produtividade !== undefined && (
            <CampoCinza label="Produtividade" valor={`${ocorrencia.produtividade} sc/ha`} />
          )}
          {ocorrencia.umidade !== undefined && (
            <CampoCinza label="Umidade" valor={`${ocorrencia.umidade}%`} />
          )}
          {ocorrencia.fotos.length > 0 && (
            <YStack gap="$2">
              <Text fontSize={12} fontWeight="600" color={colors.textMuted}>
                Fotos do Talhão
              </Text>
              <FotoStrip fotos={ocorrencia.fotos} />
            </YStack>
          )}
        </YStack>
      )}
    </YStack>
  );
}

// ─── Legenda de severidade ────────────────────────────────────────────

function LegendaItem({ sev }: { sev: Severidade }) {
  return (
    <XStack items="center" gap="$1">
      <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: severidadeDot[sev] }} />
      <Text fontSize={12} color="#4b5563">
        {severidadeLabel[sev]}
      </Text>
    </XStack>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  foto: {
    width: 96,
    height: 96,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function VisitaDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [visita, setVisita] = useState<VisitaSalva | null>(null);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      getVisitas().then((lista) => {
        if (!ativo) return;
        setVisita(lista.find((v) => v.id === id) ?? null);
        setCarregando(false);
      });
      return () => {
        ativo = false;
      };
    }, [id]),
  );

  // contagem por severidade para o resumo do topo
  const resumo = visita
    ? visita.ocorrencias.reduce(
        (acc, o) => {
          const s = nivelParaSeveridade(nivelMaisAltoDoTalhao(o));
          acc[s] += 1;
          return acc;
        },
        { critico: 0, alerta: 0, normal: 0 } as Record<Severidade, number>,
      )
    : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <XStack px="$4" py="$3" items="center" gap="$3" bg={colors.surface} borderBottomWidth={1} borderBottomColor={colors.border}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/visitas'))} hitSlop={12}>
          <View style={styles.backBtn}>
            <BackIcon color={colors.text} size={20} />
          </View>
        </Pressable>
        <Text fontSize={18} fontWeight="700" color={colors.text}>
          Detalhe da visita
        </Text>
      </XStack>

      {carregando ? (
        <YStack flex={1} items="center" justify="center">
          <Spinner color={colors.green} />
        </YStack>
      ) : !visita ? (
        <YStack flex={1} items="center" justify="center" px="$6">
          <Paragraph fontSize={14} color={colors.textMuted} text="center">
            Visita não encontrada.
          </Paragraph>
        </YStack>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 24 }}>
          {/* Cabeçalho da visita */}
          <YStack
            bg={colors.surface}
            rounded="$6"
            borderWidth={1}
            borderColor={colors.border}
            p="$4"
            gap="$4"
            style={styles.cardShadow}
          >
            <XStack items="center" justify="space-between">
              <XStack items="center" gap="$2">
                <YStack bg="rgba(0,98,50,0.1)" px="$3" py="$1.5" rounded="$3">
                  <Text fontSize={12} fontWeight="700" color={colors.green} textTransform="uppercase">
                    Concluída
                  </Text>
                </YStack>
                <Text fontSize={14} color={colors.textSoft}>
                  {horaDe(visita.data)}
                </Text>
              </XStack>
              <Pressable hitSlop={8} style={styles.iconBtn}>
                <EditIcon color={colors.text} size={16} />
              </Pressable>
            </XStack>

            <YStack gap="$3">
              <YStack gap="$1">
                <Text fontSize={12} fontWeight="600" color={colors.textMuted}>
                  Fazenda
                </Text>
                <Text fontSize={18} fontWeight="700" color={colors.text}>
                  {visita.fazendaNome}
                </Text>
              </YStack>
              <YStack gap="$1">
                <Text fontSize={12} fontWeight="600" color={colors.textMuted}>
                  Objetivo da Visita
                </Text>
                <Text fontSize={14} fontWeight="500" color="#374151">
                  {tipoLabel[visita.tipo]}
                </Text>
              </YStack>

              <XStack
                items="center"
                justify="space-between"
                borderTopWidth={1}
                borderTopColor={colors.border}
                pt="$3"
              >
                <YStack gap="$1">
                  <Text fontSize={12} fontWeight="600" color={colors.textMuted}>
                    Talhões Visitados
                  </Text>
                  <Text fontSize={24} fontWeight="800" color={colors.green}>
                    {visita.ocorrencias.length}
                  </Text>
                </YStack>
                {resumo && (
                  <XStack gap="$2" items="flex-end">
                    {(['critico', 'alerta', 'normal'] as Severidade[])
                      .filter((s) => resumo[s] > 0)
                      .map((s) => (
                        <YStack key={s} items="center" gap="$0.5">
                          <View
                            style={{ width: 12, height: 12, borderRadius: 999, backgroundColor: severidadeDot[s] }}
                          />
                          <Text fontSize={10} color={colors.textMuted}>
                            {resumo[s]}
                          </Text>
                        </YStack>
                      ))}
                  </XStack>
                )}
              </XStack>
            </YStack>
          </YStack>

          {/* Talhões */}
          <YStack gap="$4">
            <XStack items="center" justify="space-between">
              <Text fontSize={18} fontWeight="700" color={colors.text}>
                Talhões Visitados
              </Text>
              <XStack gap="$2">
                <LegendaItem sev="critico" />
                <LegendaItem sev="alerta" />
                <LegendaItem sev="normal" />
              </XStack>
            </XStack>

            {visita.ocorrencias.map((o, i) => (
              <TalhaoCard key={`${o.talhaoId}-${i}`} ocorrencia={o} tipo={visita.tipo} />
            ))}
          </YStack>

          {/* Ações */}
          <YStack
            bg={colors.surface}
            rounded="$6"
            borderWidth={1}
            borderColor={colors.border}
            p="$4"
            gap="$3"
            style={styles.cardShadow}
          >
            <Text fontSize={14} fontWeight="700" color={colors.text}>
              Ações
            </Text>
            <Pressable>
              <XStack bg={colors.green} rounded="$4" py="$3" items="center" justify="center" gap="$2">
                <FileTextIcon color={colors.white} size={14} />
                <Text fontSize={14} fontWeight="600" color={colors.white}>
                  Gerar Relatório PDF
                </Text>
              </XStack>
            </Pressable>
            <Pressable>
              <XStack bg="#f3f4f6" rounded="$4" py="$3" items="center" justify="center" gap="$2">
                <ShareIcon color="#374151" size={14} />
                <Text fontSize={14} fontWeight="600" color="#374151">
                  Compartilhar Visita
                </Text>
              </XStack>
            </Pressable>
          </YStack>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
