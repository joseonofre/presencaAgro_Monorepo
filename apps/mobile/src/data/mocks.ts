export type TipoVisita = 'plantio' | 'colheita' | 'monitoramento_pragas';

export type StatusVisita = 'agendada' | 'em_andamento' | 'realizada';

export type NivelInfestacao = 'baixo' | 'medio' | 'alto' | 'critico';

export interface Fazenda {
  id: string;
  nome: string;
  produtor: string;
  municipio: string;
  estado: string;
  latitude: number;
  longitude: number;
}

export interface Talhao {
  id: string;
  fazendaId: string;
  nome: string;
  area_ha: number;
  cultura_atual?: string;
}

export interface Praga {
  id: string;
  nome: string;
  cultura_alvo: string[];
}

export interface FotoOcorrencia {
  uri: string;
  latitude?: number;
  longitude?: number;
  capturadoEm: string;
}

/**
 * Praga identificada num talhão. Cada praga carrega suas próprias fotos —
 * a evidência fotográfica é por praga, não pelo talhão inteiro.
 */
export interface PragaOcorrencia {
  pragaId?: string;
  pragaNome: string;
  nivelInfestacao?: NivelInfestacao;
  fotos: FotoOcorrencia[];
}

export interface VisitaAgendada {
  id: string;
  tipo: TipoVisita;
  status: StatusVisita;
  data: string;
  fazenda: string;
  produtor: string;
  talhao?: string;
}

/**
 * Ocorrência num talhão dentro de uma visita.
 * Os campos opcionais são preenchidos conforme o tipo de visita escolhido.
 */
export interface OcorrenciaTalhao {
  talhaoId: string;
  talhaoNome: string;

  // Monitoramento de pragas
  identificouPraga?: boolean;
  // Cada talhão pode ter várias pragas, cada uma com fotos próprias.
  pragas?: PragaOcorrencia[];

  // [legado] schema antigo guardava uma única praga por talhão — mantido p/ retrocompat.
  pragaId?: string;
  pragaNome?: string;
  nivelInfestacao?: NivelInfestacao;

  // Plantio
  cultura?: string;
  variedade?: string;
  dataPlantio?: string; // ISO ou texto livre
  cicloDias?: number;
  adubacaoBase?: string;

  // Colheita
  dataColheita?: string;       // ISO
  produtividade?: number;       // sc/ha
  umidade?: number;             // %

  // [legado — schemas anteriores tinham previsão de colheita; mantido p/ retrocompat]
  dataPlantioEstimada?: string;
  cicloDiasEstimado?: number;
  janelaInicio?: string;
  janelaBase?: string;
  janelaFim?: string;

  // Fotos no nível do talhão — usadas em Plantio/Colheita (e como legado p/ monitoramento).
  fotos: FotoOcorrencia[];
  recomendacao?: string;
  observacao?: string;
}

/**
 * Pragas de um talhão, normalizando o legado: se a ocorrência ainda usa o
 * formato antigo (uma praga + fotos no talhão), converte para PragaOcorrencia[].
 */
export function pragasDoTalhao(o: OcorrenciaTalhao): PragaOcorrencia[] {
  if (o.pragas && o.pragas.length > 0) return o.pragas;
  if (o.pragaNome) {
    return [
      {
        pragaId: o.pragaId,
        pragaNome: o.pragaNome,
        nivelInfestacao: o.nivelInfestacao,
        fotos: o.fotos ?? [],
      },
    ];
  }
  return [];
}

const ordemNivel: Record<NivelInfestacao, number> = {
  baixo: 0,
  medio: 1,
  alto: 2,
  critico: 3,
};

/** Nível de infestação mais alto entre as pragas de um talhão (ou undefined). */
export function nivelMaisAltoDoTalhao(o: OcorrenciaTalhao): NivelInfestacao | undefined {
  const niveis = pragasDoTalhao(o)
    .map((p) => p.nivelInfestacao)
    .filter((n): n is NivelInfestacao => n !== undefined);
  if (niveis.length === 0) return undefined;
  return niveis.reduce((a, b) => (ordemNivel[b] > ordemNivel[a] ? b : a));
}

export const CULTURAS_DISPONIVEIS = [
  'Soja',
  'Milho',
  'Algodão',
  'Café',
  'Cana-de-açúcar',
  'Feijão',
  'Trigo',
  'Sorgo',
] as const;

export interface VisitaSalva {
  id: string;
  tipo: TipoVisita;
  data: string;
  fazendaId: string;
  fazendaNome: string;
  ocorrencias: OcorrenciaTalhao[];
  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsCapturadoEm?: string;
}

export const tipoLabel: Record<TipoVisita, string> = {
  plantio: 'Plantio',
  colheita: 'Colheita',
  monitoramento_pragas: 'Monitoramento de pragas',
};

export const statusLabel: Record<StatusVisita, string> = {
  agendada: 'Agendada',
  em_andamento: 'Em andamento',
  realizada: 'Realizada',
};

export const nivelLabel: Record<NivelInfestacao, string> = {
  baixo: 'Baixo',
  medio: 'Médio',
  alto: 'Alto',
  critico: 'Crítico',
};

export const nivelColor = {
  baixo: '$green10',
  medio: '$yellow10',
  alto: '$orange10',
  critico: '$red10',
} as const;

// ─── Fazendas mockadas (coordenadas aproximadas em MT) ───────────────

export const mockFazendas: Fazenda[] = [
  {
    id: 'f1',
    nome: 'Fazenda Boa Esperança',
    produtor: 'Antônio Pereira',
    municipio: 'Lucas do Rio Verde',
    estado: 'MT',
    latitude: -13.0497,
    longitude: -55.9117,
  },
  {
    id: 'f2',
    nome: 'Sítio São João',
    produtor: 'Maria Aparecida',
    municipio: 'Sorriso',
    estado: 'MT',
    latitude: -12.5453,
    longitude: -55.7197,
  },
  {
    id: 'f3',
    nome: 'Fazenda Três Marias',
    produtor: 'João Carlos',
    municipio: 'Nova Mutum',
    estado: 'MT',
    latitude: -13.8262,
    longitude: -56.085,
  },
  {
    id: 'f4',
    nome: 'Fazenda Cerrado Verde',
    produtor: 'Roberto Andrade',
    municipio: 'Diamantino',
    estado: 'MT',
    latitude: -14.4086,
    longitude: -56.436,
  },
];

// ─── Talhões mockados ────────────────────────────────────────────────

export const mockTalhoes: Talhao[] = [
  { id: 't1', fazendaId: 'f1', nome: 'Pivô 01', area_ha: 120, cultura_atual: 'Soja' },
  { id: 't2', fazendaId: 'f1', nome: 'Pivô 02', area_ha: 110, cultura_atual: 'Soja' },
  { id: 't3', fazendaId: 'f1', nome: 'Pivô 03', area_ha: 95, cultura_atual: 'Milho safrinha' },
  { id: 't4', fazendaId: 'f2', nome: 'Talhão Norte', area_ha: 80, cultura_atual: 'Soja' },
  { id: 't5', fazendaId: 'f2', nome: 'Talhão Sul', area_ha: 65, cultura_atual: 'Soja' },
  { id: 't6', fazendaId: 'f3', nome: 'Pivô 01', area_ha: 140, cultura_atual: 'Algodão' },
  { id: 't7', fazendaId: 'f3', nome: 'Pivô 02', area_ha: 130, cultura_atual: 'Algodão' },
  { id: 't8', fazendaId: 'f4', nome: 'Talhão A', area_ha: 200, cultura_atual: 'Soja' },
  { id: 't9', fazendaId: 'f4', nome: 'Talhão B', area_ha: 175, cultura_atual: 'Soja' },
];

export function talhoesDeFazenda(fazendaId: string): Talhao[] {
  return mockTalhoes.filter((t) => t.fazendaId === fazendaId);
}

// ─── Pragas comuns ───────────────────────────────────────────────────

export const mockPragas: Praga[] = [
  { id: 'p1', nome: 'Ferrugem asiática', cultura_alvo: ['Soja'] },
  { id: 'p2', nome: 'Lagarta-da-soja', cultura_alvo: ['Soja'] },
  { id: 'p3', nome: 'Percevejo marrom', cultura_alvo: ['Soja', 'Milho'] },
  { id: 'p4', nome: 'Mosca-branca', cultura_alvo: ['Soja', 'Algodão'] },
  { id: 'p5', nome: 'Mofo branco', cultura_alvo: ['Soja'] },
  { id: 'p6', nome: 'Bicudo do algodoeiro', cultura_alvo: ['Algodão'] },
  { id: 'p7', nome: 'Cigarrinha do milho', cultura_alvo: ['Milho'] },
  { id: 'p8', nome: 'Helicoverpa', cultura_alvo: ['Soja', 'Milho', 'Algodão'] },
];

// ─── Clientes (produtor + suas fazendas) ─────────────────────────────

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  fazendaIds: string[];
}

export const mockClientes: Cliente[] = [
  {
    id: 'c1',
    nome: 'Antônio Pereira',
    telefone: '(65) 98765-4321',
    email: 'antonio@boaesperanca.agr.br',
    fazendaIds: ['f1'],
  },
  {
    id: 'c2',
    nome: 'Maria Aparecida',
    telefone: '(66) 99123-5678',
    email: 'maria@sitiosaojoao.com.br',
    fazendaIds: ['f2'],
  },
  {
    id: 'c3',
    nome: 'João Carlos',
    telefone: '(65) 98234-9876',
    email: 'joao@tresmarias.agr.br',
    fazendaIds: ['f3'],
  },
  {
    id: 'c4',
    nome: 'Roberto Andrade',
    telefone: '(65) 99876-5432',
    email: 'roberto@cerradoverde.com',
    fazendaIds: ['f4'],
  },
];

/** Total de talhões e área (ha) de uma fazenda, somando os talhões mockados. */
export function statsFazenda(fazendaId: string): { talhoes: number; areaHa: number } {
  const talhoes = mockTalhoes.filter((t) => t.fazendaId === fazendaId);
  return {
    talhoes: talhoes.length,
    areaHa: talhoes.reduce((acc, t) => acc + t.area_ha, 0),
  };
}

// ─── Pedidos de insumos ──────────────────────────────────────────────

export type StatusPedido = 'pendente' | 'aprovado' | 'cancelado';

export const statusPedidoLabel: Record<StatusPedido, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  cancelado: 'Cancelado',
};

export interface Pedido {
  id: string;
  clienteNome: string;
  fazendaNome: string;
  responsavel: string;
  local: string;
  valor: number;
  status: StatusPedido;
}

export const mockPedidos: Pedido[] = [
  {
    id: 'pd1',
    clienteNome: 'Antônio Pereira',
    fazendaNome: 'Fazenda Boa Esperança',
    responsavel: 'Carlos Mendes',
    local: 'Armazém Principal',
    valor: 15450,
    status: 'pendente',
  },
  {
    id: 'pd2',
    clienteNome: 'Maria Aparecida',
    fazendaNome: 'Sítio São João',
    responsavel: 'Ana Paula Silva',
    local: 'Depósito Fazenda',
    valor: 28750,
    status: 'aprovado',
  },
  {
    id: 'pd3',
    clienteNome: 'João Carlos',
    fazendaNome: 'Fazenda Três Marias',
    responsavel: 'Roberto Costa',
    local: 'Galpão Central',
    valor: 12300,
    status: 'cancelado',
  },
  {
    id: 'pd4',
    clienteNome: 'Roberto Andrade',
    fazendaNome: 'Fazenda Cerrado Verde',
    responsavel: 'Marcos Ferreira',
    local: 'Base de Operações',
    valor: 42890,
    status: 'pendente',
  },
];

export function formatBRL(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ─── Próximas visitas agendadas (Home) ───────────────────────────────

export const mockProximasVisitas: VisitaAgendada[] = [
  {
    id: '1',
    tipo: 'monitoramento_pragas',
    status: 'agendada',
    data: '2026-05-22T08:00:00',
    fazenda: 'Fazenda Boa Esperança',
    produtor: 'Antônio Pereira',
    talhao: 'Pivô 03',
  },
  {
    id: '2',
    tipo: 'colheita',
    status: 'agendada',
    data: '2026-05-22T14:30:00',
    fazenda: 'Sítio São João',
    produtor: 'Maria Aparecida',
    talhao: 'Talhão Norte',
  },
  {
    id: '3',
    tipo: 'plantio',
    status: 'agendada',
    data: '2026-05-23T07:30:00',
    fazenda: 'Fazenda Três Marias',
    produtor: 'João Carlos',
    talhao: 'Pivô 01',
  },
];

// ─── Distância (Haversine) ───────────────────────────────────────────

const RAIO_TERRA_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function distanciaKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return RAIO_TERRA_KM * c;
}

export function fazendasProximas(
  latitude: number,
  longitude: number,
  limite = 3,
): Array<Fazenda & { distanciaKm: number }> {
  return mockFazendas
    .map((f) => ({
      ...f,
      distanciaKm: distanciaKm(latitude, longitude, f.latitude, f.longitude),
    }))
    .sort((a, b) => a.distanciaKm - b.distanciaKm)
    .slice(0, limite);
}
