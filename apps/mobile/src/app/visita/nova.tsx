import { CameraView, useCameraPermissions, type CameraCapturedPicture } from 'expo-camera';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useReducer, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView as RNScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input, Paragraph, Spinner, Text, XStack, YStack } from 'tamagui';

import { BackIcon } from '@/components/TabIcons';
import {
  CULTURAS_DISPONIVEIS,
  fazendasProximas,
  mockFazendas,
  mockPragas,
  nivelLabel,
  talhoesDeFazenda,
  tipoLabel,
  type Fazenda,
  type FotoOcorrencia,
  type NivelInfestacao,
  type OcorrenciaTalhao,
  type PragaOcorrencia,
  type Talhao,
  type TipoVisita,
  type VisitaSalva,
} from '@/data/mocks';
import { saveVisita } from '@/data/storage';
import { colors } from '@/theme/colors';

// ─── Tipos ────────────────────────────────────────────────────────────

type Step =
  | 'boot'
  | 'fazenda'
  | 'tipo_visita'
  | 'talhao'
  // Monitoramento de pragas
  | 'praga_pergunta'
  | 'praga_selecao'
  | 'nivel'
  | 'mais_praga'
  // Plantio
  | 'cultura'
  | 'variedade'
  | 'data_plantio'
  | 'ciclo_dias'
  | 'adubacao_base'
  // Colheita
  | 'data_colheita'
  | 'produtividade'
  | 'umidade'
  | 'observacao'
  // Comum
  | 'fotos'
  | 'recomendacao'
  | 'mais_talhao'
  | 'confirmar';

interface EditSnapshot {
  step: Step;
  stepsAnteriores: Step[];
  current: CurrentTalhao;
  fazendaId?: string;
  fazendaNome?: string;
  tipoVisita?: TipoVisita;
  ocorrencias: OcorrenciaTalhao[];
  historicoLen: number;
}

type ChatItem =
  | { kind: 'bot'; texto: string }
  | { kind: 'user'; texto: string; choice?: boolean; locked?: boolean; editSnapshot?: EditSnapshot }
  | { kind: 'evidence'; label: string; geo?: string }
  | { kind: 'divider'; texto: string };

interface CurrentTalhao {
  talhaoId?: string;
  talhaoNome?: string;
  // Monitoramento — pragas já finalizadas neste talhão
  identificouPraga?: boolean;
  pragas: PragaOcorrencia[];
  // Praga em andamento (sendo capturada agora)
  pragaId?: string;
  pragaNomeCustom?: string;
  nivel?: NivelInfestacao;
  // Plantio
  cultura?: string;
  variedade?: string;
  dataPlantio?: string;
  cicloDias?: number;
  adubacaoBase?: string;
  // Colheita
  dataColheita?: string;
  produtividade?: number;
  umidade?: number;
  // Comum
  fotos: FotoOcorrencia[];
  observacao: string;
  recomendacao: string;
}

interface State {
  step: Step;
  stepsAnteriores: Step[];
  historico: ChatItem[];

  fazendaId?: string;
  fazendaNome?: string;
  tipoVisita?: TipoVisita;
  ocorrencias: OcorrenciaTalhao[];
  current: CurrentTalhao;

  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsCapturadoEm?: string;
}

type Action =
  | { type: 'push'; items: ChatItem[]; proximoStep: Step; patchState?: Partial<State>; patchCurrent?: Partial<CurrentTalhao> }
  | { type: 'set-gps'; latitude: number; longitude: number }
  | { type: 'add-foto'; foto: FotoOcorrencia }
  | { type: 'remove-foto'; index: number }
  | { type: 'set-current'; patch: Partial<CurrentTalhao> }
  | { type: 'finalize-praga'; items: ChatItem[]; proximoStep: Step }
  | { type: 'finalize-current'; items: ChatItem[]; proximoStep: Step }
  | { type: 'edit-from'; snapshot: EditSnapshot };

const emptyCurrent: CurrentTalhao = { pragas: [], fotos: [], observacao: '', recomendacao: '' };

const initialState: State = {
  step: 'boot',
  stepsAnteriores: [],
  historico: [],
  ocorrencias: [],
  current: emptyCurrent,
};

function takeSnapshot(state: State): EditSnapshot {
  return {
    step: state.step,
    stepsAnteriores: state.stepsAnteriores,
    current: state.current,
    fazendaId: state.fazendaId,
    fazendaNome: state.fazendaNome,
    tipoVisita: state.tipoVisita,
    ocorrencias: state.ocorrencias,
    historicoLen: state.historico.length,
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'push': {
      const snapshot = takeSnapshot(state);
      const itemsComSnapshot = action.items.map((item) => {
        if (item.kind === 'user' && !item.locked && !item.editSnapshot) {
          return { ...item, editSnapshot: snapshot };
        }
        return item;
      });
      return {
        ...state,
        ...(action.patchState ?? {}),
        current: action.patchCurrent
          ? { ...state.current, ...action.patchCurrent }
          : state.current,
        historico: [...state.historico, ...itemsComSnapshot],
        stepsAnteriores: [...state.stepsAnteriores, state.step],
        step: action.proximoStep,
      };
    }
    case 'set-gps':
      return {
        ...state,
        gpsLatitude: action.latitude,
        gpsLongitude: action.longitude,
        gpsCapturadoEm: new Date().toISOString(),
      };
    case 'add-foto':
      return {
        ...state,
        current: { ...state.current, fotos: [...state.current.fotos, action.foto] },
      };
    case 'remove-foto':
      return {
        ...state,
        current: {
          ...state.current,
          fotos: state.current.fotos.filter((_, i) => i !== action.index),
        },
      };
    case 'set-current':
      return { ...state, current: { ...state.current, ...action.patch } };
    case 'finalize-praga': {
      // Move a praga em andamento (com suas fotos) para current.pragas e limpa o buffer.
      const c = state.current;
      const pragaNome =
        (c.pragaId ? mockPragas.find((p) => p.id === c.pragaId)?.nome : c.pragaNomeCustom) ?? '';
      const novaPraga: PragaOcorrencia = {
        pragaId: c.pragaId,
        pragaNome,
        nivelInfestacao: c.nivel,
        fotos: c.fotos,
      };
      const snapshot = takeSnapshot(state);
      const itemsComSnapshot = action.items.map((item) =>
        item.kind === 'user' && !item.locked && !item.editSnapshot
          ? { ...item, editSnapshot: snapshot }
          : item,
      );
      return {
        ...state,
        current: {
          ...c,
          pragas: [...c.pragas, novaPraga],
          pragaId: undefined,
          pragaNomeCustom: undefined,
          nivel: undefined,
          fotos: [],
        },
        historico: [...state.historico, ...itemsComSnapshot],
        stepsAnteriores: [...state.stepsAnteriores, state.step],
        step: action.proximoStep,
      };
    }
    case 'finalize-current': {
      const c = state.current;
      if (!c.talhaoId || !c.talhaoNome) return state;

      const novaOcorrencia: OcorrenciaTalhao = {
        talhaoId: c.talhaoId,
        talhaoNome: c.talhaoNome,
        // monitoramento — pragas (cada uma com suas fotos)
        identificouPraga: c.identificouPraga,
        pragas: c.pragas.length > 0 ? c.pragas : undefined,
        // plantio
        cultura: c.cultura,
        variedade: c.variedade,
        dataPlantio: c.dataPlantio,
        cicloDias: c.cicloDias,
        adubacaoBase: c.adubacaoBase?.trim() || undefined,
        // colheita
        dataColheita: c.dataColheita,
        produtividade: c.produtividade,
        umidade: c.umidade,
        // comum
        fotos: c.fotos,
        observacao: c.observacao.trim() || undefined,
        recomendacao: c.recomendacao.trim() || undefined,
      };
      const snapshot = takeSnapshot(state);
      const itemsComSnapshot = action.items.map((item) => {
        if (item.kind === 'user' && !item.locked && !item.editSnapshot) {
          return { ...item, editSnapshot: snapshot };
        }
        return item;
      });
      return {
        ...state,
        ocorrencias: [...state.ocorrencias, novaOcorrencia],
        current: emptyCurrent,
        historico: [...state.historico, ...itemsComSnapshot],
        stepsAnteriores: [...state.stepsAnteriores, state.step],
        step: action.proximoStep,
      };
    }
    case 'edit-from': {
      const s = action.snapshot;
      return {
        ...state,
        step: s.step,
        stepsAnteriores: s.stepsAnteriores,
        current: s.current,
        fazendaId: s.fazendaId,
        fazendaNome: s.fazendaNome,
        tipoVisita: s.tipoVisita,
        ocorrencias: s.ocorrencias,
        historico: state.historico.slice(0, s.historicoLen),
      };
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────

function subtituloDoStep(state: State): string {
  if (state.step === 'boot') return 'Detectando localização…';
  if (state.tipoVisita && state.fazendaNome) {
    const completos = state.ocorrencias.length;
    const tipo = tipoLabel[state.tipoVisita];
    return completos > 0
      ? `${tipo} • ${state.fazendaNome} • ${completos} talhã${completos > 1 ? 'es' : 'o'}`
      : `${tipo} • ${state.fazendaNome}`;
  }
  if (state.fazendaNome) return state.fazendaNome;
  return 'Nova visita';
}

function proximoStepAposTalhao(tipo: TipoVisita): Step {
  switch (tipo) {
    case 'monitoramento_pragas':
      return 'praga_pergunta';
    case 'plantio':
      return 'cultura';
    case 'colheita':
      return 'cultura';
  }
}

function formatDataBR(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Tela ─────────────────────────────────────────────────────────────

export default function NovaVisitaScreen() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [salvando, setSalvando] = useState(false);
  const scrollRef = useRef<RNScrollView | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        try {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          dispatch({
            type: 'set-gps',
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        } catch (error) {
          console.warn('[gps] Falha ao capturar posição:', error);
        }
      }
      setTimeout(() => {
        dispatch({
          type: 'push',
          items: [
            { kind: 'bot', texto: 'Olá, Onofre! 👋' },
            { kind: 'bot', texto: 'Vou te ajudar a registrar uma visita. Em qual fazenda você está?' },
          ],
          proximoStep: 'fazenda',
        });
      }, 400);
    })();
  }, []);

  function handleVoltar() {
    const algumProgresso =
      state.fazendaId !== undefined ||
      state.tipoVisita !== undefined ||
      state.ocorrencias.length > 0 ||
      state.current.talhaoId !== undefined;
    if (!algumProgresso) {
      router.back();
      return;
    }
    Alert.alert(
      'Sair da visita?',
      'Você vai perder os dados preenchidos até agora.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ],
    );
  }

  function handleEdit(snapshot: EditSnapshot, texto: string) {
    Alert.alert(
      'Editar resposta?',
      `Você vai voltar pra "${texto}" e perder o que preencheu depois.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Editar',
          style: 'destructive',
          onPress: () => dispatch({ type: 'edit-from', snapshot }),
        },
      ],
    );
  }

  async function handleSalvar() {
    if (!state.fazendaId || !state.tipoVisita || state.ocorrencias.length === 0) return;
    setSalvando(true);
    try {
      const fazenda = mockFazendas.find((f) => f.id === state.fazendaId)!;
      const visita: VisitaSalva = {
        id: `v-${Date.now()}`,
        tipo: state.tipoVisita,
        data: new Date().toISOString(),
        fazendaId: fazenda.id,
        fazendaNome: fazenda.nome,
        ocorrencias: state.ocorrencias,
        gpsLatitude: state.gpsLatitude,
        gpsLongitude: state.gpsLongitude,
        gpsCapturadoEm: state.gpsCapturadoEm,
      };
      await saveVisita(visita);
      router.replace('/visitas');
    } catch (error) {
      console.warn('[save] Falha ao salvar visita:', error);
      Alert.alert('Erro', 'Não consegui salvar a visita. Tenta de novo.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <XStack
        px="$4"
        py="$3"
        items="center"
        gap="$3"
        bg={colors.surface}
        borderBottomWidth={1}
        borderBottomColor={colors.border}
      >
        <Pressable onPress={handleVoltar} hitSlop={12}>
          <View style={styles.backBtn}>
            <BackIcon color={colors.text} size={20} />
          </View>
        </Pressable>
        <YStack flex={1}>
          <Text fontSize={16} fontWeight="700" color={colors.text}>
            Nova visita
          </Text>
          <Text fontSize={12} color={colors.textMuted} fontWeight="500" numberOfLines={1}>
            {subtituloDoStep(state)}
          </Text>
        </YStack>
      </XStack>

      <RNScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        <YStack gap="$2">
          {state.historico.map((item, i) => (
            <Bubble key={i} item={item} onEdit={handleEdit} />
          ))}
          {state.step === 'boot' && <Spinner color={colors.green} />}
        </YStack>
      </RNScrollView>

      <ActiveArea
        state={state}
        dispatch={dispatch}
        onSalvar={handleSalvar}
        salvando={salvando}
      />
    </SafeAreaView>
  );
}

// ─── Bubbles ──────────────────────────────────────────────────────────

function Bubble({
  item,
  onEdit,
}: {
  item: ChatItem;
  onEdit: (snapshot: EditSnapshot, texto: string) => void;
}) {
  if (item.kind === 'bot') {
    return (
      <XStack maxW="80%">
        <YStack
          bg={colors.surface}
          px="$3"
          py="$2"
          rounded="$5"
          borderWidth={1}
          borderColor={colors.border}
          style={styles.bubbleBotShape}
        >
          <Text fontSize={14} color={colors.text} lineHeight={20}>
            {item.texto}
          </Text>
        </YStack>
      </XStack>
    );
  }
  if (item.kind === 'user') {
    const editavel = !!item.editSnapshot && !item.locked;
    return (
      <XStack justify="flex-end" items="center" gap="$2">
        {editavel && (
          <Pressable
            onPress={() => onEdit(item.editSnapshot!, item.texto)}
            hitSlop={10}
            style={styles.editBtn}
          >
            <Text style={{ fontSize: 14 }}>✏️</Text>
          </Pressable>
        )}
        <YStack
          bg={item.choice ? colors.greenDark : colors.green}
          px="$3"
          py="$2"
          rounded="$5"
          maxW="78%"
          style={styles.bubbleUserShape}
        >
          <Text fontSize={14} color={colors.white} lineHeight={20}>
            {item.texto}
          </Text>
        </YStack>
      </XStack>
    );
  }
  if (item.kind === 'divider') {
    return (
      <XStack items="center" gap="$2" py="$2">
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        <Text fontSize={11} color={colors.textMuted} fontWeight="700">
          {item.texto}
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      </XStack>
    );
  }
  return (
    <XStack maxW="80%">
      <XStack
        bg={colors.surface}
        p="$2"
        rounded="$4"
        borderWidth={1}
        borderColor={colors.border}
        gap="$3"
        items="center"
      >
        <YStack
          width={56}
          height={56}
          rounded="$3"
          bg={colors.greenLight}
          items="center"
          justify="center"
        >
          <Text fontSize={24}>📷</Text>
        </YStack>
        <YStack flex={1} gap="$1">
          <Text fontSize={13} fontWeight="700" color={colors.text}>
            {item.label}
          </Text>
          {item.geo && (
            <Text fontSize={11} color={colors.textMuted}>
              📍 {item.geo}
            </Text>
          )}
        </YStack>
      </XStack>
    </XStack>
  );
}

// ─── Active Area ─────────────────────────────────────────────────────

function ActiveArea({
  state,
  dispatch,
  onSalvar,
  salvando,
}: {
  state: State;
  dispatch: React.Dispatch<Action>;
  onSalvar: () => void;
  salvando: boolean;
}) {
  switch (state.step) {
    case 'boot':
      return null;
    case 'fazenda':
      return <QuickFazenda state={state} dispatch={dispatch} />;
    case 'tipo_visita':
      return <QuickTipoVisita dispatch={dispatch} />;
    case 'talhao':
      return <QuickTalhao state={state} dispatch={dispatch} />;
    case 'praga_pergunta':
      return <QuickPragaPergunta state={state} dispatch={dispatch} />;
    case 'praga_selecao':
      return <QuickPragaSelecao dispatch={dispatch} />;
    case 'nivel':
      return <QuickNivel state={state} dispatch={dispatch} />;
    case 'mais_praga':
      return <QuickMaisPraga state={state} dispatch={dispatch} />;
    case 'cultura':
      return <QuickCultura state={state} dispatch={dispatch} />;
    case 'variedade':
      return <QuickVariedade state={state} dispatch={dispatch} />;
    case 'data_plantio':
      return <QuickDataPlantio state={state} dispatch={dispatch} />;
    case 'ciclo_dias':
      return <QuickCiclo state={state} dispatch={dispatch} />;
    case 'data_colheita':
      return <QuickDataColheita state={state} dispatch={dispatch} />;
    case 'produtividade':
      return <QuickProdutividade state={state} dispatch={dispatch} />;
    case 'umidade':
      return <QuickUmidade state={state} dispatch={dispatch} />;
    case 'adubacao_base':
      return <QuickAdubacaoBase state={state} dispatch={dispatch} />;
    case 'observacao':
      return <QuickObservacao state={state} dispatch={dispatch} />;
    case 'fotos':
      return <QuickFotos state={state} dispatch={dispatch} />;
    case 'recomendacao':
      return <QuickRecomendacao state={state} dispatch={dispatch} />;
    case 'mais_talhao':
      return <QuickMaisTalhao state={state} dispatch={dispatch} />;
    case 'confirmar':
      return <QuickConfirmar onSalvar={onSalvar} salvando={salvando} />;
  }
}

// ─── Quick: utilitários ──────────────────────────────────────────────

function QABarContainer({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.qaBar}>
      <YStack gap="$2">{children}</YStack>
    </View>
  );
}

function QABtn({
  label,
  icon,
  variant = 'secondary',
  onPress,
  disabled,
}: {
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  onPress: () => void;
  disabled?: boolean;
}) {
  const bg =
    variant === 'primary' ? colors.green : variant === 'ghost' ? 'transparent' : colors.surface;
  const fg =
    variant === 'primary' ? colors.white : variant === 'danger' ? colors.red : colors.green;
  const border = variant === 'danger' ? colors.red : variant === 'ghost' ? colors.border : colors.green;

  return (
    <Pressable onPress={onPress} disabled={disabled}>
      {({ pressed }) => (
        <View
          style={[
            styles.qaBtn,
            {
              backgroundColor: bg,
              borderColor: border,
              opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
            },
          ]}
        >
          {icon && <Text style={{ marginRight: 6, fontSize: 14 }}>{icon}</Text>}
          <Text style={{ color: fg, fontWeight: '600', fontSize: 13.5 }}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

// ─── Step: Fazenda ────────────────────────────────────────────────────

function QuickFazenda({
  state,
  dispatch,
}: {
  state: State;
  dispatch: React.Dispatch<Action>;
}) {
  const [verTodas, setVerTodas] = useState(false);
  const proximas =
    state.gpsLatitude !== undefined && state.gpsLongitude !== undefined
      ? fazendasProximas(state.gpsLatitude, state.gpsLongitude, 3)
      : null;
  const lista: Array<Fazenda & { distanciaKm?: number }> =
    verTodas || !proximas ? mockFazendas.map((f) => ({ ...f })) : proximas;

  function escolher(f: Fazenda) {
    dispatch({
      type: 'push',
      items: [
        // Fazenda fica LOCKED: não pode editar
        { kind: 'user', texto: f.nome, choice: true, locked: true },
        { kind: 'bot', texto: 'Qual o tipo de visita?' },
      ],
      proximoStep: 'tipo_visita',
      patchState: { fazendaId: f.id, fazendaNome: f.nome },
    });
  }

  return (
    <QABarContainer>
      {!verTodas && proximas && (
        <Text fontSize={11} color={colors.textMuted} fontWeight="700" mb="$1">
          FAZENDAS PRÓXIMAS
        </Text>
      )}
      {lista.map((f) => (
        <QABtn
          key={f.id}
          label={
            f.distanciaKm !== undefined
              ? `${f.nome} • ${f.distanciaKm < 1 ? Math.round(f.distanciaKm * 1000) + ' m' : f.distanciaKm.toFixed(1) + ' km'}`
              : f.nome
          }
          icon="🌾"
          onPress={() => escolher(f)}
        />
      ))}
      {!verTodas && proximas && (
        <QABtn
          label="Selecionar outra fazenda"
          icon="🔍"
          variant="primary"
          onPress={() => setVerTodas(true)}
        />
      )}
    </QABarContainer>
  );
}

// ─── Step: Tipo de Visita (LOCKED) ────────────────────────────────────

function QuickTipoVisita({ dispatch }: { dispatch: React.Dispatch<Action> }) {
  function escolher(tipo: TipoVisita) {
    const proximaPergunta =
      tipo === 'monitoramento_pragas'
        ? 'Por qual talhão você quer começar?'
        : 'Por qual talhão você quer começar?';
    dispatch({
      type: 'push',
      items: [
        // Tipo fica LOCKED
        { kind: 'user', texto: tipoLabel[tipo], choice: true, locked: true },
        { kind: 'bot', texto: proximaPergunta },
      ],
      proximoStep: 'talhao',
      patchState: { tipoVisita: tipo },
    });
  }

  return (
    <QABarContainer>
      <QABtn label={tipoLabel.monitoramento_pragas} icon="🐛" variant="primary" onPress={() => escolher('monitoramento_pragas')} />
      <QABtn label={tipoLabel.plantio} icon="🌱" onPress={() => escolher('plantio')} />
      <QABtn label={tipoLabel.colheita} icon="🌾" onPress={() => escolher('colheita')} />
    </QABarContainer>
  );
}

// ─── Step: Talhão ─────────────────────────────────────────────────────

function QuickTalhao({
  state,
  dispatch,
}: {
  state: State;
  dispatch: React.Dispatch<Action>;
}) {
  const todos: Talhao[] = state.fazendaId ? talhoesDeFazenda(state.fazendaId) : [];
  const idsJaRegistrados = new Set(state.ocorrencias.map((o) => o.talhaoId));
  const disponiveis = todos.filter((t) => !idsJaRegistrados.has(t.id));

  function escolher(t: Talhao) {
    const proximo = state.tipoVisita ? proximoStepAposTalhao(state.tipoVisita) : 'praga_pergunta';
    const proximaPergunta =
      state.tipoVisita === 'monitoramento_pragas'
        ? `Você identificou alguma praga no ${t.nome}?`
        : `Qual a cultura plantada no ${t.nome}?`;
    dispatch({
      type: 'push',
      items: [
        { kind: 'user', texto: t.nome, choice: true },
        { kind: 'bot', texto: proximaPergunta },
      ],
      proximoStep: proximo,
      patchCurrent: { talhaoId: t.id, talhaoNome: t.nome },
    });
  }

  return (
    <QABarContainer>
      <Text fontSize={11} color={colors.textMuted} fontWeight="700" mb="$1">
        ESCOLHA UM TALHÃO
      </Text>
      {disponiveis.length === 0 ? (
        <Paragraph fontSize={13} color={colors.textMuted}>
          Todos os talhões dessa fazenda já foram registrados.
        </Paragraph>
      ) : (
        disponiveis.map((t) => (
          <QABtn
            key={t.id}
            label={`${t.nome} • ${t.area_ha} ha${t.cultura_atual ? ` • ${t.cultura_atual}` : ''}`}
            onPress={() => escolher(t)}
          />
        ))
      )}
    </QABarContainer>
  );
}

// ─── Step: Praga (pergunta) ───────────────────────────────────────────

function QuickPragaPergunta({
  state,
  dispatch,
}: {
  state: State;
  dispatch: React.Dispatch<Action>;
}) {
  function escolher(identificou: boolean) {
    if (identificou) {
      dispatch({
        type: 'push',
        items: [
          { kind: 'user', texto: 'Sim', choice: true },
          { kind: 'bot', texto: 'Qual praga foi identificada?' },
        ],
        proximoStep: 'praga_selecao',
        patchCurrent: { identificouPraga: true },
      });
    } else {
      dispatch({
        type: 'push',
        items: [
          { kind: 'user', texto: 'Não', choice: true },
          { kind: 'bot', texto: `Qual sua recomendação técnica para o ${state.current.talhaoNome}?` },
        ],
        proximoStep: 'recomendacao',
        patchCurrent: {
          identificouPraga: false,
          pragaId: undefined,
          pragaNomeCustom: undefined,
          nivel: undefined,
          fotos: [],
        },
      });
    }
  }

  return (
    <QABarContainer>
      <XStack gap="$2">
        <View style={{ flex: 1 }}>
          <QABtn label="Sim" icon="📝" variant="primary" onPress={() => escolher(true)} />
        </View>
        <View style={{ flex: 1 }}>
          <QABtn label="Não" icon="✅" onPress={() => escolher(false)} />
        </View>
      </XStack>
    </QABarContainer>
  );
}

// ─── Step: Praga (seleção) ────────────────────────────────────────────

function QuickPragaSelecao({ dispatch }: { dispatch: React.Dispatch<Action> }) {
  const [adicionando, setAdicionando] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [pragaCustom, setPragaCustom] = useState('');

  const filtradas = filtro.trim()
    ? mockPragas.filter((p) => p.nome.toLowerCase().includes(filtro.trim().toLowerCase()))
    : mockPragas;

  function escolher(pragaId: string, nome: string) {
    dispatch({
      type: 'push',
      items: [
        { kind: 'user', texto: nome, choice: true },
        { kind: 'bot', texto: 'Qual o nível de infestação?' },
      ],
      proximoStep: 'nivel',
      patchCurrent: { pragaId, pragaNomeCustom: undefined },
    });
  }

  function confirmarCustom() {
    const texto = pragaCustom.trim();
    if (!texto) return;
    dispatch({
      type: 'push',
      items: [
        { kind: 'user', texto, choice: true },
        { kind: 'bot', texto: 'Qual o nível de infestação?' },
      ],
      proximoStep: 'nivel',
      patchCurrent: { pragaId: undefined, pragaNomeCustom: texto },
    });
    setAdicionando(false);
    setPragaCustom('');
  }

  if (adicionando) {
    return (
      <QABarContainer>
        <Text fontSize={11} color={colors.textMuted} fontWeight="700">
          NOME DA PRAGA
        </Text>
        <Input
          value={pragaCustom}
          onChangeText={setPragaCustom}
          placeholder="Ex.: Cigarrinha-verde"
          autoFocus
          bg={colors.surface}
          borderColor={colors.border}
        />
        <XStack gap="$2">
          <View style={{ flex: 1 }}>
            <QABtn label="Cancelar" onPress={() => setAdicionando(false)} />
          </View>
          <View style={{ flex: 1 }}>
            <QABtn
              label="Usar essa praga"
              variant="primary"
              disabled={!pragaCustom.trim()}
              onPress={confirmarCustom}
            />
          </View>
        </XStack>
      </QABarContainer>
    );
  }

  return (
    <QABarContainer>
      <Input
        value={filtro}
        onChangeText={setFiltro}
        placeholder="Buscar praga..."
        bg={colors.surface}
        borderColor={colors.border}
      />
      <RNScrollView style={{ maxHeight: 220 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
        <YStack gap="$2">
          {filtradas.map((p) => (
            <QABtn
              key={p.id}
              label={`${p.nome} (${p.cultura_alvo.join(', ')})`}
              onPress={() => escolher(p.id, p.nome)}
            />
          ))}
        </YStack>
      </RNScrollView>
      <QABtn label="+ Adicionar outra praga" variant="primary" onPress={() => setAdicionando(true)} />
    </QABarContainer>
  );
}

// ─── Step: Nível ──────────────────────────────────────────────────────

function QuickNivel({
  state,
  dispatch,
}: {
  state: State;
  dispatch: React.Dispatch<Action>;
}) {
  const niveis: Array<{ key: NivelInfestacao; emoji: string }> = [
    { key: 'baixo', emoji: '🟢' },
    { key: 'medio', emoji: '🟡' },
    { key: 'alto', emoji: '🟠' },
    { key: 'critico', emoji: '🔴' },
  ];

  function escolher(n: NivelInfestacao) {
    dispatch({
      type: 'push',
      items: [
        { kind: 'user', texto: nivelLabel[n], choice: true },
        { kind: 'bot', texto: `Registre fotos da ocorrência no ${state.current.talhaoNome}. Cada foto será georreferenciada.` },
      ],
      proximoStep: 'fotos',
      patchCurrent: { nivel: n },
    });
  }

  return (
    <QABarContainer>
      {niveis.map((n) => (
        <QABtn key={n.key} icon={n.emoji} label={nivelLabel[n.key]} onPress={() => escolher(n.key)} />
      ))}
    </QABarContainer>
  );
}

// ─── Step: Mais pragas no talhão? ─────────────────────────────────────

function QuickMaisPraga({
  state,
  dispatch,
}: {
  state: State;
  dispatch: React.Dispatch<Action>;
}) {
  function sim() {
    dispatch({
      type: 'push',
      items: [
        { kind: 'user', texto: 'Sim, outra praga', choice: true },
        { kind: 'bot', texto: 'Qual praga foi identificada?' },
      ],
      proximoStep: 'praga_selecao',
    });
  }

  function nao() {
    dispatch({
      type: 'push',
      items: [
        { kind: 'user', texto: 'Não', choice: true },
        { kind: 'bot', texto: `Qual sua recomendação técnica para o ${state.current.talhaoNome}?` },
      ],
      proximoStep: 'recomendacao',
    });
  }

  return (
    <QABarContainer>
      <XStack gap="$2">
        <View style={{ flex: 1 }}>
          <QABtn label="Sim, outra praga" icon="🐛" variant="primary" onPress={sim} />
        </View>
        <View style={{ flex: 1 }}>
          <QABtn label="Não" icon="✅" onPress={nao} />
        </View>
      </XStack>
    </QABarContainer>
  );
}

// ─── Step: Cultura (Plantio + Previsão) ──────────────────────────────

function QuickCultura({
  state,
  dispatch,
}: {
  state: State;
  dispatch: React.Dispatch<Action>;
}) {
  const [adicionando, setAdicionando] = useState(false);
  const [custom, setCustom] = useState('');

  function escolher(cultura: string) {
    const proximoStep: Step =
      state.tipoVisita === 'plantio' ? 'variedade' : 'data_colheita';
    const proximaPergunta =
      state.tipoVisita === 'plantio'
        ? 'Qual a variedade ou semente utilizada?'
        : 'Qual a data da colheita? (DD/MM/AAAA)';
    dispatch({
      type: 'push',
      items: [
        { kind: 'user', texto: cultura, choice: true },
        { kind: 'bot', texto: proximaPergunta },
      ],
      proximoStep,
      patchCurrent: { cultura },
    });
  }

  function confirmarCustom() {
    const texto = custom.trim();
    if (!texto) return;
    escolher(texto);
    setAdicionando(false);
    setCustom('');
  }

  if (adicionando) {
    return (
      <QABarContainer>
        <Text fontSize={11} color={colors.textMuted} fontWeight="700">
          CULTURA
        </Text>
        <Input
          value={custom}
          onChangeText={setCustom}
          placeholder="Ex.: Girassol"
          autoFocus
          bg={colors.surface}
          borderColor={colors.border}
        />
        <XStack gap="$2">
          <View style={{ flex: 1 }}>
            <QABtn label="Cancelar" onPress={() => setAdicionando(false)} />
          </View>
          <View style={{ flex: 1 }}>
            <QABtn label="Usar" variant="primary" disabled={!custom.trim()} onPress={confirmarCustom} />
          </View>
        </XStack>
      </QABarContainer>
    );
  }

  return (
    <QABarContainer>
      {CULTURAS_DISPONIVEIS.map((c) => (
        <QABtn key={c} label={c} onPress={() => escolher(c)} />
      ))}
      <QABtn label="+ Outra cultura" variant="primary" onPress={() => setAdicionando(true)} />
    </QABarContainer>
  );
}

// ─── Step: Variedade (Plantio) ───────────────────────────────────────

function QuickVariedade({
  state,
  dispatch,
}: {
  state: State;
  dispatch: React.Dispatch<Action>;
}) {
  const [valor, setValor] = useState(state.current.variedade ?? '');

  function confirmar() {
    const texto = valor.trim();
    if (!texto) return;
    dispatch({
      type: 'push',
      items: [
        { kind: 'user', texto, choice: true },
        { kind: 'bot', texto: 'Qual a data do plantio? (DD/MM/AAAA)' },
      ],
      proximoStep: 'data_plantio',
      patchCurrent: { variedade: texto },
    });
  }

  return (
    <QABarContainer>
      <Input
        value={valor}
        onChangeText={setValor}
        placeholder="Ex.: TMG 7062 IPRO"
        bg={colors.surface}
        borderColor={colors.border}
      />
      <QABtn label="Continuar" variant="primary" disabled={!valor.trim()} onPress={confirmar} />
    </QABarContainer>
  );
}

// ─── Helpers de data ─────────────────────────────────────────────────

function parseDataBR(input: string): string {
  const m = input.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return input;
  const [, d, mo, y] = m;
  const date = new Date(Number(y), Number(mo) - 1, Number(d));
  if (Number.isNaN(date.getTime())) return input;
  return date.toISOString();
}

function hojeBR() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

// ─── Step: Data de plantio ───────────────────────────────────────────

function QuickDataPlantio({
  state,
  dispatch,
}: {
  state: State;
  dispatch: React.Dispatch<Action>;
}) {
  const [valor, setValor] = useState(state.current.dataPlantio ?? '');

  function confirmar(textoFinal: string) {
    const iso = parseDataBR(textoFinal);
    dispatch({
      type: 'push',
      items: [
        { kind: 'user', texto: textoFinal, choice: true },
        { kind: 'bot', texto: 'Qual o ciclo da cultura? (em dias)' },
      ],
      proximoStep: 'ciclo_dias',
      patchCurrent: { dataPlantio: iso },
    });
  }

  return (
    <QABarContainer>
      <Input
        value={valor}
        onChangeText={setValor}
        placeholder="DD/MM/AAAA"
        keyboardType="numbers-and-punctuation"
        bg={colors.surface}
        borderColor={colors.border}
      />
      <XStack gap="$2">
        <View style={{ flex: 1 }}>
          <QABtn
            label="Usar hoje"
            onPress={() => {
              const h = hojeBR();
              setValor(h);
              confirmar(h);
            }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <QABtn label="Continuar" variant="primary" disabled={!valor.trim()} onPress={() => confirmar(valor)} />
        </View>
      </XStack>
    </QABarContainer>
  );
}

// ─── Step: Ciclo em dias (Plantio) ────────────────────────────────────

function QuickCiclo({
  state,
  dispatch,
}: {
  state: State;
  dispatch: React.Dispatch<Action>;
}) {
  const [valor, setValor] = useState(
    state.current.cicloDias !== undefined ? String(state.current.cicloDias) : '',
  );

  function confirmar() {
    const n = Number(valor.trim());
    if (!Number.isFinite(n) || n <= 0) return;
    dispatch({
      type: 'push',
      items: [
        { kind: 'user', texto: `${n} dias`, choice: true },
        { kind: 'bot', texto: 'Tire fotos do plantio (opcional).' },
      ],
      proximoStep: 'fotos',
      patchCurrent: { cicloDias: n },
    });
  }

  return (
    <QABarContainer>
      <Input
        value={valor}
        onChangeText={setValor}
        placeholder="Ex.: 110"
        keyboardType="number-pad"
        bg={colors.surface}
        borderColor={colors.border}
      />
      <QABtn
        label="Continuar"
        variant="primary"
        disabled={!valor.trim() || !Number.isFinite(Number(valor.trim())) || Number(valor.trim()) <= 0}
        onPress={confirmar}
      />
    </QABarContainer>
  );
}

// ─── Step: Data da colheita ──────────────────────────────────────────

function QuickDataColheita({
  state,
  dispatch,
}: {
  state: State;
  dispatch: React.Dispatch<Action>;
}) {
  const [valor, setValor] = useState(state.current.dataColheita ?? '');

  function confirmar(textoFinal: string) {
    const iso = parseDataBR(textoFinal);
    dispatch({
      type: 'push',
      items: [
        { kind: 'user', texto: textoFinal, choice: true },
        { kind: 'bot', texto: 'Qual a produtividade? (em sacas por hectare)' },
      ],
      proximoStep: 'produtividade',
      patchCurrent: { dataColheita: iso },
    });
  }

  return (
    <QABarContainer>
      <Input
        value={valor}
        onChangeText={setValor}
        placeholder="DD/MM/AAAA"
        keyboardType="numbers-and-punctuation"
        bg={colors.surface}
        borderColor={colors.border}
      />
      <XStack gap="$2">
        <View style={{ flex: 1 }}>
          <QABtn
            label="Usar hoje"
            onPress={() => {
              const h = hojeBR();
              setValor(h);
              confirmar(h);
            }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <QABtn label="Continuar" variant="primary" disabled={!valor.trim()} onPress={() => confirmar(valor)} />
        </View>
      </XStack>
    </QABarContainer>
  );
}

// ─── Step: Produtividade (sc/ha) ─────────────────────────────────────

function QuickProdutividade({
  state,
  dispatch,
}: {
  state: State;
  dispatch: React.Dispatch<Action>;
}) {
  const [valor, setValor] = useState(
    state.current.produtividade !== undefined ? String(state.current.produtividade) : '',
  );

  function confirmar() {
    const n = Number(valor.replace(',', '.').trim());
    if (!Number.isFinite(n) || n <= 0) return;
    dispatch({
      type: 'push',
      items: [
        { kind: 'user', texto: `${n} sc/ha`, choice: true },
        { kind: 'bot', texto: 'Qual a umidade do grão? (em %)' },
      ],
      proximoStep: 'umidade',
      patchCurrent: { produtividade: n },
    });
  }

  return (
    <QABarContainer>
      <Input
        value={valor}
        onChangeText={setValor}
        placeholder="Ex.: 65"
        keyboardType="decimal-pad"
        bg={colors.surface}
        borderColor={colors.border}
      />
      <QABtn
        label="Continuar"
        variant="primary"
        disabled={!valor.trim() || !Number.isFinite(Number(valor.replace(',', '.').trim())) || Number(valor.replace(',', '.').trim()) <= 0}
        onPress={confirmar}
      />
    </QABarContainer>
  );
}

// ─── Step: Umidade (%) ───────────────────────────────────────────────

function QuickUmidade({
  state,
  dispatch,
}: {
  state: State;
  dispatch: React.Dispatch<Action>;
}) {
  const [valor, setValor] = useState(
    state.current.umidade !== undefined ? String(state.current.umidade) : '',
  );

  function confirmar(pular: boolean) {
    if (pular) {
      dispatch({
        type: 'push',
        items: [
          { kind: 'user', texto: '(pulado)', choice: true },
          { kind: 'bot', texto: 'Tire fotos da colheita (opcional).' },
        ],
        proximoStep: 'fotos',
      });
      return;
    }
    const n = Number(valor.replace(',', '.').trim());
    if (!Number.isFinite(n) || n < 0) return;
    dispatch({
      type: 'push',
      items: [
        { kind: 'user', texto: `${n}%`, choice: true },
        { kind: 'bot', texto: 'Tire fotos da colheita (opcional).' },
      ],
      proximoStep: 'fotos',
      patchCurrent: { umidade: n },
    });
  }

  return (
    <QABarContainer>
      <Input
        value={valor}
        onChangeText={setValor}
        placeholder="Ex.: 13.5"
        keyboardType="decimal-pad"
        bg={colors.surface}
        borderColor={colors.border}
      />
      <XStack gap="$2">
        <View style={{ flex: 1 }}>
          <QABtn label="Pular" onPress={() => confirmar(true)} />
        </View>
        <View style={{ flex: 1 }}>
          <QABtn
            label="Continuar"
            variant="primary"
            disabled={!valor.trim() || !Number.isFinite(Number(valor.replace(',', '.').trim())) || Number(valor.replace(',', '.').trim()) < 0}
            onPress={() => confirmar(false)}
          />
        </View>
      </XStack>
    </QABarContainer>
  );
}

// ─── Step: Adubação de base (Plantio, com Pular) ─────────────────────

function QuickAdubacaoBase({
  state,
  dispatch,
}: {
  state: State;
  dispatch: React.Dispatch<Action>;
}) {
  const [valor, setValor] = useState(state.current.adubacaoBase ?? '');

  function avancar(texto: string | null) {
    const t = texto ?? '';
    dispatch({
      type: 'push',
      items: [
        { kind: 'user', texto: t || '(pulado)', choice: true },
        { kind: 'bot', texto: `Qual sua recomendação técnica para o ${state.current.talhaoNome}?` },
      ],
      proximoStep: 'recomendacao',
      patchCurrent: { adubacaoBase: t || undefined },
    });
  }

  return (
    <QABarContainer>
      <Input
        multiline
        numberOfLines={4}
        minH={100}
        placeholder="Adubação de base utilizada (NPK, dosagem, etc.)"
        value={valor}
        onChangeText={setValor}
        textAlignVertical="top"
        bg={colors.surface}
        borderColor={colors.border}
      />
      <XStack gap="$2">
        <View style={{ flex: 1 }}>
          <QABtn label="Pular" onPress={() => avancar(null)} />
        </View>
        <View style={{ flex: 1 }}>
          <QABtn label="Continuar" variant="primary" disabled={!valor.trim()} onPress={() => avancar(valor)} />
        </View>
      </XStack>
    </QABarContainer>
  );
}

// ─── Step: Observação (Previsão de colheita, com Pular) ──────────────

function QuickObservacao({
  state,
  dispatch,
}: {
  state: State;
  dispatch: React.Dispatch<Action>;
}) {
  const [valor, setValor] = useState(state.current.observacao);

  function avancar(texto: string | null) {
    const t = texto ?? '';
    dispatch({
      type: 'push',
      items: [
        { kind: 'user', texto: t || '(pulado)', choice: true },
        { kind: 'bot', texto: `Qual sua recomendação técnica para o ${state.current.talhaoNome}?` },
      ],
      proximoStep: 'recomendacao',
      patchCurrent: { observacao: t },
    });
  }

  return (
    <QABarContainer>
      <Input
        multiline
        numberOfLines={4}
        minH={100}
        placeholder="Observações sobre o estágio da cultura..."
        value={valor}
        onChangeText={setValor}
        textAlignVertical="top"
        bg={colors.surface}
        borderColor={colors.border}
      />
      <XStack gap="$2">
        <View style={{ flex: 1 }}>
          <QABtn label="Pular" onPress={() => avancar(null)} />
        </View>
        <View style={{ flex: 1 }}>
          <QABtn label="Continuar" variant="primary" disabled={!valor.trim()} onPress={() => avancar(valor)} />
        </View>
      </XStack>
    </QABarContainer>
  );
}

// ─── Step: Fotos (comum) ──────────────────────────────────────────────

function QuickFotos({
  state,
  dispatch,
}: {
  state: State;
  dispatch: React.Dispatch<Action>;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraAberta, setCameraAberta] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const fotos = state.current.fotos;
  const obrigatorio = state.tipoVisita === 'monitoramento_pragas';

  async function tirarFoto() {
    if (!cameraRef.current) return;
    const foto = (await cameraRef.current.takePictureAsync({
      quality: 0.7,
    })) as CameraCapturedPicture | undefined;
    if (!foto) return;

    let latitude: number | undefined;
    let longitude: number | undefined;
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      latitude = loc.coords.latitude;
      longitude = loc.coords.longitude;
    } catch {
      // sem geo específico
    }

    dispatch({
      type: 'add-foto',
      foto: { uri: foto.uri, latitude, longitude, capturadoEm: new Date().toISOString() },
    });
    setCameraAberta(false);
  }

  // Plantio/Colheita: as fotos ficam no nível do talhão e o fluxo segue normal.
  function avancarSemFotos() {
    const proximo: Step = state.tipoVisita === 'plantio' ? 'adubacao_base' : 'observacao';
    const pergunta =
      state.tipoVisita === 'plantio'
        ? 'Como foi a adubação de base?'
        : 'Alguma observação sobre a colheita?';
    dispatch({
      type: 'push',
      items: [
        { kind: 'user', texto: '(sem fotos)', choice: true },
        { kind: 'bot', texto: pergunta },
      ],
      proximoStep: proximo,
    });
  }

  function concluirFotos() {
    const ultima = fotos[fotos.length - 1];
    const geo =
      ultima && ultima.latitude !== undefined && ultima.longitude !== undefined
        ? `${ultima.latitude.toFixed(5)}, ${ultima.longitude.toFixed(5)}`
        : undefined;
    const pragaNome = state.current.pragaId
      ? mockPragas.find((p) => p.id === state.current.pragaId)?.nome
      : state.current.pragaNomeCustom;

    // Monitoramento: as fotos pertencem à praga atual → finaliza a praga e pergunta se há outra.
    if (state.tipoVisita === 'monitoramento_pragas') {
      dispatch({
        type: 'finalize-praga',
        items: [
          {
            kind: 'evidence',
            label: `${fotos.length} foto${fotos.length > 1 ? 's' : ''} de ${pragaNome ?? 'praga'}`,
            geo,
          },
          { kind: 'bot', texto: `Você identificou outra praga no ${state.current.talhaoNome}?` },
        ],
        proximoStep: 'mais_praga',
      });
      return;
    }

    if (fotos.length === 0) {
      avancarSemFotos();
      return;
    }
    const proximo: Step = state.tipoVisita === 'plantio' ? 'adubacao_base' : 'observacao';
    const pergunta =
      state.tipoVisita === 'plantio'
        ? 'Como foi a adubação de base?'
        : 'Alguma observação sobre a colheita?';
    const labelTipo = state.current.cultura ?? (state.tipoVisita === 'plantio' ? 'plantio' : 'cultura');

    dispatch({
      type: 'push',
      items: [
        { kind: 'evidence', label: `${fotos.length} foto${fotos.length > 1 ? 's' : ''} de ${labelTipo}`, geo },
        { kind: 'bot', texto: pergunta },
      ],
      proximoStep: proximo,
    });
  }

  if (cameraAberta) {
    return (
      <View style={styles.cameraSheet}>
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
        <View style={styles.cameraOverlay}>
          <Pressable onPress={() => setCameraAberta(false)} style={styles.cameraClose}>
            <Text style={{ color: colors.white, fontSize: 22 }}>×</Text>
          </Pressable>
          <Pressable onPress={tirarFoto} style={styles.shutter} hitSlop={12} />
        </View>
      </View>
    );
  }

  return (
    <QABarContainer>
      {fotos.length > 0 && (
        <RNScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$2" pr="$2">
            {fotos.map((f, i) => (
              <View key={f.uri} style={{ position: 'relative' }}>
                <Image source={{ uri: f.uri }} style={styles.thumbStrip} />
                <Pressable
                  onPress={() => dispatch({ type: 'remove-foto', index: i })}
                  style={styles.removeThumb}
                  hitSlop={8}
                >
                  <Text style={{ color: colors.white, fontWeight: '700', fontSize: 12 }}>×</Text>
                </Pressable>
              </View>
            ))}
          </XStack>
        </RNScrollView>
      )}

      {!permission ? (
        <Spinner color={colors.green} />
      ) : !permission.granted ? (
        <>
          <Paragraph fontSize={13} color={colors.textMuted}>
            Precisamos de acesso à câmera para registrar fotos.
          </Paragraph>
          <QABtn label="Permitir câmera" variant="primary" onPress={requestPermission} />
        </>
      ) : (
        <>
          <QABtn
            label={fotos.length === 0 ? '📷 Tirar foto' : '📷 Outra foto'}
            variant={fotos.length === 0 ? 'primary' : 'secondary'}
            onPress={() => setCameraAberta(true)}
          />
          {fotos.length > 0 ? (
            <QABtn
              label={`Concluir (${fotos.length} foto${fotos.length > 1 ? 's' : ''})`}
              variant="primary"
              onPress={concluirFotos}
            />
          ) : !obrigatorio ? (
            <QABtn label="Pular fotos" onPress={avancarSemFotos} />
          ) : null}
        </>
      )}
    </QABarContainer>
  );
}

// ─── Step: Recomendação (com Pular) ──────────────────────────────────

function QuickRecomendacao({
  state,
  dispatch,
}: {
  state: State;
  dispatch: React.Dispatch<Action>;
}) {
  function avancar(texto: string | null) {
    const t = texto ?? '';
    const talhaoNome = state.current.talhaoNome;
    dispatch({
      type: 'finalize-current',
      items: [
        { kind: 'user', texto: t || '(pulado)', choice: true },
        { kind: 'divider', texto: `${talhaoNome} REGISTRADO` },
        {
          kind: 'bot',
          texto: `Pronto, o ${talhaoNome} foi registrado. Você visitou outro talhão na ${state.fazendaNome}?`,
        },
      ],
      proximoStep: 'mais_talhao',
    });
  }

  return (
    <QABarContainer>
      <Input
        multiline
        numberOfLines={4}
        minH={100}
        placeholder="Descreva sua recomendação técnica..."
        value={state.current.recomendacao}
        onChangeText={(texto) => dispatch({ type: 'set-current', patch: { recomendacao: texto } })}
        textAlignVertical="top"
        bg={colors.surface}
        borderColor={colors.border}
      />
      <XStack gap="$2">
        <View style={{ flex: 1 }}>
          <QABtn label="Pular" onPress={() => avancar(null)} />
        </View>
        <View style={{ flex: 1 }}>
          <QABtn
            label="Concluir talhão"
            variant="primary"
            disabled={!state.current.recomendacao.trim()}
            onPress={() => avancar(state.current.recomendacao)}
          />
        </View>
      </XStack>
    </QABarContainer>
  );
}

// ─── Step: Mais Talhão ────────────────────────────────────────────────

function QuickMaisTalhao({
  state,
  dispatch,
}: {
  state: State;
  dispatch: React.Dispatch<Action>;
}) {
  const todos = state.fazendaId ? talhoesDeFazenda(state.fazendaId) : [];
  const idsJaRegistrados = new Set(state.ocorrencias.map((o) => o.talhaoId));
  const restantes = todos.filter((t) => !idsJaRegistrados.has(t.id));

  function sim() {
    dispatch({
      type: 'push',
      items: [
        { kind: 'user', texto: 'Sim, outro talhão', choice: true },
        { kind: 'bot', texto: 'Qual o próximo talhão?' },
      ],
      proximoStep: 'talhao',
    });
  }

  function nao() {
    dispatch({
      type: 'push',
      items: [
        { kind: 'user', texto: 'Não, finalizar visita', choice: true },
        {
          kind: 'bot',
          texto: `Visita pronta com ${state.ocorrencias.length} talhão${state.ocorrencias.length > 1 ? 'es' : ''}. Toque em salvar pra concluir.`,
        },
      ],
      proximoStep: 'confirmar',
    });
  }

  if (restantes.length === 0) {
    return (
      <QABarContainer>
        <Paragraph fontSize={13} color={colors.textMuted} mb="$1">
          Todos os talhões dessa fazenda já foram registrados.
        </Paragraph>
        <QABtn label="✅ Finalizar visita" variant="primary" onPress={nao} />
      </QABarContainer>
    );
  }

  return (
    <QABarContainer>
      <XStack gap="$2">
        <View style={{ flex: 1 }}>
          <QABtn label="Sim, outro talhão" icon="➕" variant="primary" onPress={sim} />
        </View>
        <View style={{ flex: 1 }}>
          <QABtn label="Não, finalizar" icon="✅" onPress={nao} />
        </View>
      </XStack>
    </QABarContainer>
  );
}

// ─── Step: Confirmar ──────────────────────────────────────────────────

function QuickConfirmar({
  onSalvar,
  salvando,
}: {
  onSalvar: () => void;
  salvando: boolean;
}) {
  return (
    <QABarContainer>
      <QABtn
        label={salvando ? 'Salvando...' : '✅ Salvar visita'}
        variant="primary"
        disabled={salvando}
        onPress={onSalvar}
      />
    </QABarContainer>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatContent: {
    padding: 16,
    paddingBottom: 24,
  },
  bubbleBotShape: { borderTopLeftRadius: 4 },
  bubbleUserShape: { borderTopRightRadius: 4 },
  editBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qaBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  qaBtn: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  cameraSheet: {
    height: 480,
    position: 'relative',
    backgroundColor: colors.black,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 32,
  },
  cameraClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.white,
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  thumbStrip: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: colors.bg,
  },
  removeThumb: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
