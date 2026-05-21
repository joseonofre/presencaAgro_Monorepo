import AsyncStorage from '@react-native-async-storage/async-storage';

import type { FotoOcorrencia, OcorrenciaTalhao, VisitaSalva } from './mocks';

const STORAGE_KEY = '@presenca-agro/visitas';

/**
 * Migra registros salvos em versões anteriores do schema para o formato atual.
 * Trata 3 gerações de modelo:
 *  - v1: talhaoId/talhaoNome (singular) + fotoUri única
 *  - v2: talhaoIds[]/talhaoNomes[] + fotos[]
 *  - v3 (atual): ocorrencias[OcorrenciaTalhao]
 */
function migrar(raw: unknown): VisitaSalva | null {
  if (!raw || typeof raw !== 'object') return null;
  const v = raw as Record<string, unknown>;
  if (typeof v.id !== 'string') return null;

  // Caso já esteja no formato atual:
  if (Array.isArray(v.ocorrencias)) {
    return {
      id: v.id,
      tipo: (v.tipo as VisitaSalva['tipo']) ?? 'monitoramento_pragas',
      data: typeof v.data === 'string' ? v.data : new Date().toISOString(),
      fazendaId: typeof v.fazendaId === 'string' ? v.fazendaId : '',
      fazendaNome: typeof v.fazendaNome === 'string' ? v.fazendaNome : '',
      ocorrencias: v.ocorrencias as OcorrenciaTalhao[],
      gpsLatitude: typeof v.gpsLatitude === 'number' ? v.gpsLatitude : undefined,
      gpsLongitude: typeof v.gpsLongitude === 'number' ? v.gpsLongitude : undefined,
      gpsCapturadoEm: typeof v.gpsCapturadoEm === 'string' ? v.gpsCapturadoEm : undefined,
    };
  }

  // v1/v2: campos flat → reduz a uma única OcorrenciaTalhao (ou várias se talhaoIds[]).
  const talhaoIds = Array.isArray(v.talhaoIds)
    ? (v.talhaoIds as string[])
    : typeof v.talhaoId === 'string'
      ? [v.talhaoId]
      : [];
  const talhaoNomes = Array.isArray(v.talhaoNomes)
    ? (v.talhaoNomes as string[])
    : typeof v.talhaoNome === 'string'
      ? [v.talhaoNome]
      : [];

  const fotos = Array.isArray(v.fotos)
    ? (v.fotos as FotoOcorrencia[])
    : typeof v.fotoUri === 'string'
      ? [
          {
            uri: v.fotoUri,
            latitude: typeof v.fotoLatitude === 'number' ? v.fotoLatitude : undefined,
            longitude: typeof v.fotoLongitude === 'number' ? v.fotoLongitude : undefined,
            capturadoEm: typeof v.data === 'string' ? v.data : new Date().toISOString(),
          },
        ]
      : [];

  const identificouPraga =
    typeof v.pragaIdentificada === 'boolean'
      ? v.pragaIdentificada
      : Boolean(v.pragaId || v.pragaNome);

  const ocorrencias: OcorrenciaTalhao[] = talhaoIds.length
    ? talhaoIds.map((tid, i) => ({
        talhaoId: tid,
        talhaoNome: talhaoNomes[i] ?? tid,
        identificouPraga,
        pragaId: typeof v.pragaId === 'string' ? v.pragaId : undefined,
        pragaNome: typeof v.pragaNome === 'string' ? v.pragaNome : undefined,
        nivelInfestacao: v.nivelInfestacao as OcorrenciaTalhao['nivelInfestacao'],
        // Toda a galeria fica vinculada ao primeiro talhão (modelo antigo não diferenciava).
        fotos: i === 0 ? fotos : [],
        recomendacao: typeof v.recomendacao === 'string' ? v.recomendacao : undefined,
      }))
    : [];

  return {
    id: v.id,
    tipo: (v.tipo as VisitaSalva['tipo']) ?? 'monitoramento_pragas',
    data: typeof v.data === 'string' ? v.data : new Date().toISOString(),
    fazendaId: typeof v.fazendaId === 'string' ? v.fazendaId : '',
    fazendaNome: typeof v.fazendaNome === 'string' ? v.fazendaNome : '',
    ocorrencias,
    gpsLatitude: typeof v.gpsLatitude === 'number' ? v.gpsLatitude : undefined,
    gpsLongitude: typeof v.gpsLongitude === 'number' ? v.gpsLongitude : undefined,
    gpsCapturadoEm: typeof v.gpsCapturadoEm === 'string' ? v.gpsCapturadoEm : undefined,
  };
}

export async function getVisitas(): Promise<VisitaSalva[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.map(migrar).filter((v): v is VisitaSalva => v !== null);
  } catch (error) {
    console.warn('[storage] Falha ao ler visitas:', error);
    return [];
  }
}

export async function saveVisita(visita: VisitaSalva): Promise<void> {
  const atuais = await getVisitas();
  const proximas = [visita, ...atuais];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(proximas));
}

export async function clearVisitas(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
