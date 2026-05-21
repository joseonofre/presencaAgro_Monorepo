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
  fazendasProximas,
  mockFazendas,
  mockPragas,
  nivelLabel,
  talhoesDeFazenda,
  type Fazenda,
  type FotoOcorrencia,
  type NivelInfestacao,
  type OcorrenciaTalhao,
  type Talhao,
  type VisitaSalva,
} from '@/data/mocks';
import { saveVisita } from '@/data/storage';
import { colors } from '@/theme/colors';

// ─── Tipos ────────────────────────────────────────────────────────────

type Step =
  | 'boot'
  | 'fazenda'
  | 'talhao'
  | 'praga_pergunta'
  | 'praga_selecao'
  | 'nivel'
  | 'fotos'
  | 'recomendacao'
  | 'mais_talhao'
  | 'confirmar'
  | 'done';

type ChatItem =
  | { kind: 'bot'; texto: string }
  | { kind: 'user'; texto: string; choice?: boolean }
  | { kind: 'evidence'; label: string; geo?: string }
  | { kind: 'divider'; texto: string };

interface CurrentTalhao {
  talhaoId?: string;
  talhaoNome?: string;
  identificouPraga?: boolean;
  pragaId?: string;
  pragaNomeCustom?: string;
  nivel?: NivelInfestacao;
  fotos: FotoOcorrencia[];
  recomendacao: string;
}

interface State {
  step: Step;
  stepsAnteriores: Step[];
  historico: ChatItem[];

  fazendaId?: string;
  fazendaNome?: string;
  ocorrencias: OcorrenciaTalhao[];
  current: CurrentTalhao;

  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsCapturadoEm?: string;
}

type Action =
  | { type: 'push'; items: ChatItem[]; proximoStep: Step; patchState?: Partial<State>; patchCurrent?: Partial<CurrentTalhao> }
  | { type: 'back' }
  | { type: 'set-gps'; latitude: number; longitude: number }
  | { type: 'add-foto'; foto: FotoOcorrencia }
  | { type: 'remove-foto'; index: number }
  | { type: 'set-current'; patch: Partial<CurrentTalhao> }
  | { type: 'finalize-current'; items: ChatItem[]; proximoStep: Step };

const emptyCurrent: CurrentTalhao = { fotos: [], recomendacao: '' };

const initialState: State = {
  step: 'boot',
  stepsAnteriores: [],
  historico: [],
  ocorrencias: [],
  current: emptyCurrent,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'push':
      return {
        ...state,
        ...(action.patchState ?? {}),
        current: action.patchCurrent ? { ...state.current, ...action.patchCurrent } : state.current,
        historico: [...state.historico, ...action.items],
        stepsAnteriores: [...state.stepsAnteriores, state.step],
        step: action.proximoStep,
      };
    case 'back': {
      if (state.stepsAnteriores.length === 0) return state;
      const proximosAnteriores = state.stepsAnteriores.slice(0, -1);
      const anterior = state.stepsAnteriores[state.stepsAnteriores.length - 1];
      const recortar = state.step === 'fotos' ? 3 : 2;
      return {
        ...state,
        step: anterior,
        stepsAnteriores: proximosAnteriores,
        historico: state.historico.slice(0, -recortar),
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
    case 'finalize-current': {
      const c = state.current;
      if (!c.talhaoId || !c.talhaoNome || c.identificouPraga === undefined) return state;
      const pragaNome = c.pragaId
        ? mockPragas.find((p) => p.id === c.pragaId)?.nome
        : c.pragaNomeCustom;
      const novaOcorrencia: OcorrenciaTalhao = {
        talhaoId: c.talhaoId,
        talhaoNome: c.talhaoNome,
        identificouPraga: c.identificouPraga,
        pragaId: c.pragaId,
        pragaNome,
        nivelInfestacao: c.nivel,
        fotos: c.fotos,
        recomendacao: c.recomendacao.trim() || undefined,
      };
      return {
        ...state,
        ocorrencias: [...state.ocorrencias, novaOcorrencia],
        current: emptyCurrent,
        historico: [...state.historico, ...action.items],
        stepsAnteriores: [...state.stepsAnteriores, state.step],
        step: action.proximoStep,
      };
    }
  }
}

function subtituloDoStep(state: State): string {
  if (state.step === 'boot') return 'Detectando localização…';
  if (state.fazendaNome) {
    const completos = state.ocorrencias.length;
    return completos > 0
      ? `${state.fazendaNome} • ${completos} talhão${completos > 1 ? 'es' : ''} registrado${completos > 1 ? 's' : ''}`
      : state.fazendaNome;
  }
  return 'Monitoramento de pragas';
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
            {
              kind: 'bot',
              texto:
                'Vou te ajudar a registrar uma visita de monitoramento de pragas. Em qual fazenda você está?',
            },
          ],
          proximoStep: 'fazenda',
        });
      }, 400);
    })();
  }, []);

  function handleVoltar() {
    if (state.stepsAnteriores.length === 0) {
      router.back();
    } else {
      dispatch({ type: 'back' });
    }
  }

  async function handleSalvar() {
    if (!state.fazendaId || state.ocorrencias.length === 0) return;
    setSalvando(true);
    try {
      const fazenda = mockFazendas.find((f) => f.id === state.fazendaId)!;
      const visita: VisitaSalva = {
        id: `v-${Date.now()}`,
        tipo: 'monitoramento_pragas',
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
          <Text fontSize={12} color={colors.textMuted} fontWeight="500">
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
            <Bubble key={i} item={item} />
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

function Bubble({ item }: { item: ChatItem }) {
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
    return (
      <XStack justify="flex-end">
        <YStack
          bg={item.choice ? colors.greenDark : colors.green}
          px="$3"
          py="$2"
          rounded="$5"
          maxW="80%"
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
  // evidence
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
    case 'talhao':
      return <QuickTalhao state={state} dispatch={dispatch} />;
    case 'praga_pergunta':
      return <QuickPragaPergunta state={state} dispatch={dispatch} />;
    case 'praga_selecao':
      return <QuickPragaSelecao dispatch={dispatch} />;
    case 'nivel':
      return <QuickNivel state={state} dispatch={dispatch} />;
    case 'fotos':
      return <QuickFotos state={state} dispatch={dispatch} />;
    case 'recomendacao':
      return <QuickRecomendacao state={state} dispatch={dispatch} />;
    case 'mais_talhao':
      return <QuickMaisTalhao state={state} dispatch={dispatch} />;
    case 'confirmar':
      return <QuickConfirmar onSalvar={onSalvar} salvando={salvando} />;
    case 'done':
      return null;
  }
}

// ─── Quick: componentes utilitários ──────────────────────────────────

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
  variant?: 'primary' | 'secondary' | 'danger';
  onPress: () => void;
  disabled?: boolean;
}) {
  const bg = variant === 'primary' ? colors.green : colors.surface;
  const fg =
    variant === 'primary' ? colors.white : variant === 'danger' ? colors.red : colors.green;
  const border = variant === 'danger' ? colors.red : colors.green;

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
        { kind: 'user', texto: f.nome, choice: true },
        { kind: 'bot', texto: `Por qual talhão da ${f.nome} você quer começar?` },
      ],
      proximoStep: 'talhao',
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

// ─── Step: Talhão (single, com filtro de já registrados) ─────────────

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
    dispatch({
      type: 'push',
      items: [
        { kind: 'user', texto: t.nome, choice: true },
        {
          kind: 'bot',
          texto: `Você identificou alguma praga no ${t.nome}?`,
        },
      ],
      proximoStep: 'praga_pergunta',
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
          Todos os talhões dessa fazenda já foram registrados nessa visita.
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
          {
            kind: 'bot',
            texto: `Qual sua recomendação técnica para o ${state.current.talhaoNome}?`,
          },
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
        { kind: 'user', texto: texto, choice: true },
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
      <RNScrollView
        style={{ maxHeight: 220 }}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
      >
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
      <QABtn
        label="+ Adicionar outra praga"
        variant="primary"
        onPress={() => setAdicionando(true)}
      />
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
        {
          kind: 'bot',
          texto: `Registre fotos da ocorrência no ${state.current.talhaoNome}. Cada foto será georreferenciada.`,
        },
      ],
      proximoStep: 'fotos',
      patchCurrent: { nivel: n },
    });
  }

  return (
    <QABarContainer>
      {niveis.map((n) => (
        <QABtn
          key={n.key}
          icon={n.emoji}
          label={nivelLabel[n.key]}
          onPress={() => escolher(n.key)}
        />
      ))}
    </QABarContainer>
  );
}

// ─── Step: Fotos ──────────────────────────────────────────────────────

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

    const novaFoto: FotoOcorrencia = {
      uri: foto.uri,
      latitude,
      longitude,
      capturadoEm: new Date().toISOString(),
    };
    dispatch({ type: 'add-foto', foto: novaFoto });
    setCameraAberta(false);
  }

  function concluirFotos() {
    const pragaNome = state.current.pragaId
      ? mockPragas.find((p) => p.id === state.current.pragaId)?.nome
      : state.current.pragaNomeCustom;
    const ultima = fotos[fotos.length - 1];
    const geo =
      ultima && ultima.latitude !== undefined && ultima.longitude !== undefined
        ? `${ultima.latitude.toFixed(5)}, ${ultima.longitude.toFixed(5)}`
        : undefined;

    dispatch({
      type: 'push',
      items: [
        {
          kind: 'evidence',
          label: `${fotos.length} foto${fotos.length > 1 ? 's' : ''} de ${pragaNome ?? 'ocorrência'}`,
          geo,
        },
        {
          kind: 'bot',
          texto: `Qual sua recomendação técnica para o ${state.current.talhaoNome}?`,
        },
      ],
      proximoStep: 'recomendacao',
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
                  <Text style={{ color: colors.white, fontWeight: '700', fontSize: 12 }}>
                    ×
                  </Text>
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
            Precisamos de acesso à câmera para registrar a ocorrência.
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
          {fotos.length > 0 && (
            <QABtn
              label={`Concluir (${fotos.length} foto${fotos.length > 1 ? 's' : ''})`}
              variant="primary"
              onPress={concluirFotos}
            />
          )}
        </>
      )}
    </QABarContainer>
  );
}

// ─── Step: Recomendação ───────────────────────────────────────────────

function QuickRecomendacao({
  state,
  dispatch,
}: {
  state: State;
  dispatch: React.Dispatch<Action>;
}) {
  function confirmar() {
    const texto = state.current.recomendacao.trim();
    if (!texto) return;
    const talhaoNome = state.current.talhaoNome;

    dispatch({
      type: 'finalize-current',
      items: [
        { kind: 'user', texto: texto, choice: true },
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
        placeholder="Descreva sua recomendação técnica para esse talhão..."
        value={state.current.recomendacao}
        onChangeText={(texto) =>
          dispatch({ type: 'set-current', patch: { recomendacao: texto } })
        }
        textAlignVertical="top"
        bg={colors.surface}
        borderColor={colors.border}
      />
      <QABtn
        label="Concluir talhão"
        variant="primary"
        disabled={!state.current.recomendacao.trim()}
        onPress={confirmar}
      />
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
  bubbleBotShape: {
    borderTopLeftRadius: 4,
  },
  bubbleUserShape: {
    borderTopRightRadius: 4,
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
