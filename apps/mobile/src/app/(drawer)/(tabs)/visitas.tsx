import { useFocusEffect, router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Paragraph, Text, XStack, YStack } from 'tamagui';

import {
  mockProximasVisitas,
  nivelLabel,
  statusLabel,
  tipoLabel,
  type NivelInfestacao,
  type VisitaAgendada,
  type VisitaSalva,
} from '@/data/mocks';
import { getVisitas } from '@/data/storage';
import { colors } from '@/theme/colors';

function formatDataHora(iso: string): string {
  const d = new Date(iso);
  const data = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${data} • ${hora}`;
}

function nivelBg(nivel: NivelInfestacao): string {
  switch (nivel) {
    case 'baixo':
      return colors.greenLight;
    case 'medio':
      return colors.amberLight;
    case 'alto':
      return '#FFE4D1';
    case 'critico':
      return colors.redLight;
  }
}

function nivelFg(nivel: NivelInfestacao): string {
  switch (nivel) {
    case 'baixo':
      return colors.greenDark;
    case 'medio':
      return '#92400e';
    case 'alto':
      return '#9a3412';
    case 'critico':
      return '#991b1b';
  }
}

function CardSalva({ visita }: { visita: VisitaSalva }) {
  const totalFotos = visita.ocorrencias.reduce((acc, o) => acc + o.fotos.length, 0);
  const totalTalhoes = visita.ocorrencias.length;
  const talhoesNomes = visita.ocorrencias.map((o) => o.talhaoNome).join(', ');

  return (
    <Card p="$3" borderWidth={1} borderColor={colors.border} bg={colors.surface}>
      <YStack gap="$2">
        <XStack justify="space-between" items="center">
          <Text fontSize={11} color={colors.textMuted} fontWeight="600">
            {formatDataHora(visita.data)}
          </Text>
          <YStack bg={colors.greenLight} px="$2" py="$1" rounded="$2">
            <Text fontSize={10} color={colors.greenDark} fontWeight="700">
              SALVA
            </Text>
          </YStack>
        </XStack>
        <Text fontSize={15} fontWeight="700" color={colors.text}>
          {visita.fazendaNome}
        </Text>
        <Text fontSize={13} color={colors.textMuted}>
          {talhoesNomes || '—'} ({totalTalhoes} talhã{totalTalhoes === 1 ? 'o' : 'os'})
        </Text>

        {/* Resumo das ocorrências */}
        {visita.ocorrencias.some((o) => o.pragaNome) && (
          <YStack gap="$1" mt="$1">
            {visita.ocorrencias
              .filter((o) => o.pragaNome)
              .map((o) => (
                <XStack key={o.talhaoId} gap="$2" items="center" flexWrap="wrap">
                  <Text fontSize={12} color={colors.text}>
                    {o.talhaoNome}: {o.pragaNome}
                  </Text>
                  {o.nivelInfestacao && (
                    <YStack
                      style={{
                        backgroundColor: nivelBg(o.nivelInfestacao),
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                      }}
                    >
                      <Text
                        fontSize={10}
                        style={{ color: nivelFg(o.nivelInfestacao) }}
                        fontWeight="600"
                      >
                        {nivelLabel[o.nivelInfestacao]}
                      </Text>
                    </YStack>
                  )}
                </XStack>
              ))}
          </YStack>
        )}

        <XStack gap="$2" flexWrap="wrap" mt="$1">
          <YStack bg={colors.blueLight} px="$2" py="$1" rounded="$2">
            <Text fontSize={11} color={colors.blue} fontWeight="600">
              {tipoLabel[visita.tipo]}
            </Text>
          </YStack>
          {totalFotos > 0 && (
            <YStack bg={colors.bg} px="$2" py="$1" rounded="$2">
              <Text fontSize={11} color={colors.textMuted} fontWeight="600">
                📷 {totalFotos}
              </Text>
            </YStack>
          )}
        </XStack>
      </YStack>
    </Card>
  );
}

function CardAgendada({ visita }: { visita: VisitaAgendada }) {
  return (
    <Card p="$3" borderWidth={1} borderColor={colors.border} bg={colors.surface}>
      <YStack gap="$2">
        <XStack justify="space-between" items="center">
          <Text fontSize={11} color={colors.textMuted} fontWeight="600">
            {formatDataHora(visita.data)}
          </Text>
          <YStack bg={colors.blueLight} px="$2" py="$1" rounded="$2">
            <Text fontSize={10} color={colors.blue} fontWeight="700">
              {statusLabel[visita.status].toUpperCase()}
            </Text>
          </YStack>
        </XStack>
        <Text fontSize={15} fontWeight="700" color={colors.text}>
          {visita.fazenda}
        </Text>
        <Text fontSize={13} color={colors.textMuted}>
          {visita.produtor}
          {visita.talhao ? ` • ${visita.talhao}` : ''}
        </Text>
        <YStack mt="$1">
          <YStack
            bg={colors.greenLight}
            px="$2"
            py="$1"
            rounded="$2"
            self="flex-start"
          >
            <Text fontSize={11} color={colors.greenDark} fontWeight="600">
              {tipoLabel[visita.tipo]}
            </Text>
          </YStack>
        </YStack>
      </YStack>
    </Card>
  );
}

const styles = StyleSheet.create({
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
  fabPlus: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function VisitasScreen() {
  const [salvas, setSalvas] = useState<VisitaSalva[]>([]);

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <YStack px="$4" py="$3" gap="$1">
        <Text fontSize={22} fontWeight="800" color={colors.text}>
          Visitas
        </Text>
        <Text fontSize={13} color={colors.textMuted}>
          {salvas.length} registradas • {mockProximasVisitas.length} agendadas
        </Text>
      </YStack>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 96, gap: 12 }}
      >
        <YStack gap="$3">
          {salvas.length > 0 && (
            <>
              <Text fontSize={12} fontWeight="700" color={colors.textMuted} mt="$2">
                REGISTRADAS
              </Text>
              {salvas.map((v) => (
                <CardSalva key={v.id} visita={v} />
              ))}
            </>
          )}

          <Text fontSize={12} fontWeight="700" color={colors.textMuted} mt="$2">
            PRÓXIMAS AGENDADAS
          </Text>
          {mockProximasVisitas.map((v) => (
            <CardAgendada key={v.id} visita={v} />
          ))}

          {salvas.length === 0 && (
            <YStack items="center" py="$6" gap="$2">
              <Paragraph fontSize={14} color={colors.textMuted} text="center">
                Você ainda não registrou nenhuma visita.{'\n'}Toque no botão{' '}
                <Text fontWeight="700" color={colors.green}>
                  +
                </Text>{' '}
                para começar.
              </Paragraph>
            </YStack>
          )}
        </YStack>
      </ScrollView>

      {/* FAB Nova Visita */}
      <Pressable
        onPress={() => router.push('/visita/nova')}
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}
        hitSlop={8}
      >
        <View style={styles.fabPlus}>
          <Text style={{ color: colors.white, fontSize: 30, fontWeight: '300', lineHeight: 32 }}>
            +
          </Text>
        </View>
      </Pressable>
    </SafeAreaView>
  );
}
