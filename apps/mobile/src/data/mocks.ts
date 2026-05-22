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

  // Comum a todas as tipologias
  fotos: FotoOcorrencia[];
  recomendacao?: string;
  observacao?: string;
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
