# Wizard de Nova Visita — Monitoramento de Pragas

Documento descreve o fluxo conversacional usado em `src/app/visita/nova.tsx` para registrar uma visita de monitoramento de pragas no campo. A visita cobre **uma fazenda** e **N talhões** (preenchidos um por vez, em série).

## Princípios de UX

- **Formato chat:** bubbles bot/usuário em scroll vertical contínuo, com histórico visível. Cada interação adiciona pelo menos uma bubble de pergunta + uma de resposta.
- **Quick Actions fora do chat:** botões pill ficam em uma barra fixa abaixo do chat (não inline). Tocar avança o fluxo direto, sem botão "Continuar" intermediário.
- **Captura contextual:** GPS é capturado ao abrir o wizard e usado para ordenar fazendas por proximidade. Cada foto também captura GPS individual.
- **Fluxo serial por talhão:** o usuário escolhe um talhão, preenche todos os dados desse talhão, finaliza, e só depois o app pergunta se ele visitou outro talhão da mesma fazenda. Diferente de multi-select no início.
- **Ramificação por "identificou praga":** se "Não", pula os passos de praga/nível/fotos e vai direto para a recomendação do talhão.

## Modelo de dados

Definido em `src/data/mocks.ts`:

```ts
interface OcorrenciaTalhao {
  talhaoId: string;
  talhaoNome: string;
  identificouPraga: boolean;
  pragaId?: string;          // se selecionou da lista
  pragaNome?: string;         // pode ser custom (texto livre)
  nivelInfestacao?: 'baixo' | 'medio' | 'alto' | 'critico';
  fotos: FotoOcorrencia[];    // cada uma com lat/lon próprios
  recomendacao?: string;
}

interface VisitaSalva {
  id: string;
  tipo: 'monitoramento_pragas' | 'plantio' | 'previsao_colheita';
  data: string;
  fazendaId: string;
  fazendaNome: string;
  ocorrencias: OcorrenciaTalhao[];   // 1+ talhões visitados
  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsCapturadoEm?: string;
}

interface FotoOcorrencia {
  uri: string;
  latitude?: number;
  longitude?: number;
  capturadoEm: string;
}
```

## State machine

State é gerenciado por `useReducer` local em `nova.tsx`.

```
       ┌────────┐
       │  boot  │  (GPS + saudação)
       └───┬────┘
           ↓
       ┌────────┐
       │fazenda │  (lista próximas + "Selecionar outra")
       └───┬────┘
           ↓
       ┌────────┐ ←──────────────────┐
       │talhao  │  (single-select,   │
       └───┬────┘   exclui já regs)  │
           ↓                          │
   ┌───────────────┐                  │
   │praga_pergunta │                  │
   └──┬─────────┬──┘                  │
      │ Sim     │ Não                 │
      ↓         │                      │
 ┌─────────┐    │                      │
 │praga_   │    │                      │
 │selecao  │    │                      │
 └────┬────┘    │                      │
      ↓         │                      │
 ┌─────────┐    │                      │
 │ nivel   │    │                      │
 └────┬────┘    │                      │
      ↓         │                      │
 ┌─────────┐    │                      │
 │ fotos   │    │                      │
 └────┬────┘    │                      │
      ↓         ↓                      │
   ┌─────────────────┐                  │
   │  recomendacao   │                  │
   └────────┬────────┘                  │
            ↓ (finalize-current)        │
   ┌─────────────────┐                  │
   │  mais_talhao    │                  │
   └──┬───────────┬──┘                  │
      │ Sim       │ Não                 │
      └───────────┼─────────────────────┘
                  ↓
            ┌──────────┐
            │ confirmar│  (Salvar visita)
            └──────────┘
```

## State shape

```ts
interface State {
  step: Step;
  stepsAnteriores: Step[];   // pilha para "Voltar"
  historico: ChatItem[];      // bubbles renderizados

  fazendaId?: string;
  fazendaNome?: string;

  ocorrencias: OcorrenciaTalhao[];   // talhões já completos
  current: CurrentTalhao;            // talhão em preenchimento

  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsCapturadoEm?: string;
}

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
```

A separação `current` vs `ocorrencias` é o coração do fluxo serial: cada talhão é construído em `current` e migrado pra `ocorrencias[]` quando o usuário finaliza a recomendação.

## Actions principais

- `push` — adiciona items ao histórico, avança step, opcionalmente patcheia state ou current.
- `back` — volta um step na pilha, remove os últimos 2-3 items do histórico.
- `set-current` — atualiza campos do talhão em construção (idempotente, sem avançar step).
- `add-foto` / `remove-foto` — manipula `current.fotos`.
- `finalize-current` — valida `current`, move para `ocorrencias[]`, reseta `current`, avança step.
- `set-gps` — registra coordenadas iniciais do wizard.

## Eventos especiais no chat

- **Bubble bot:** pergunta ou confirmação do app (esquerda, branco com borda).
- **Bubble user:** resposta do consultor (direita, verde). Variante `choice` (verde-escuro) marca seleção via quick action.
- **Evidence card:** card especial com thumbnail genérico de câmera + label + geo. Mostrado quando o consultor conclui a etapa de fotos de um talhão.
- **Divider:** separador `─── PIVÔ 01 REGISTRADO ───` entre talhões. Marca visualmente que um talhão foi finalizado e o próximo está começando.

## Subtitle dinâmico

O header tem subtitle que muda conforme o progresso:

- `boot` → "Detectando localização…"
- antes de escolher fazenda → "Monitoramento de pragas"
- depois de escolher fazenda → nome da fazenda
- depois do primeiro talhão registrado → `"Fazenda Boa Esperança • 1 talhão registrado"`
- N talhões registrados → `"... • N talhões registrados"`

## Filtragem de talhões disponíveis

No step `talhao`, a lista é filtrada para excluir talhões já presentes em `ocorrencias[]`. Isso evita o usuário cadastrar duas ocorrências para o mesmo talhão na mesma visita.

No step `mais_talhao`, se todos os talhões da fazenda já foram registrados, o app esconde a opção "Sim, outro talhão" e mostra apenas "Finalizar visita".

## Persistência

- Visitas são salvas no `AsyncStorage` sob a chave `@presenca-agro/visitas`.
- `storage.ts` implementa migration leve para suportar dados de versões anteriores do schema (campos flat singular → arrays → ocorrencias[]).
- A intenção é trocar AsyncStorage por PowerSync + SQLite local quando o backend Nest.js estiver de pé.

## GPS

- Capturado uma vez ao abrir o wizard (foreground permission, accuracy Balanced).
- Usado para ordenar fazendas por proximidade no step `fazenda` (helper `fazendasProximas()` em `mocks.ts` usa Haversine).
- Recapturado a cada foto tirada — `latitude`/`longitude` ficam em cada `FotoOcorrencia` individualmente.

## Câmera

- Implementada com `expo-camera` (CameraView).
- Abre como sheet de 480px no lugar dos quick actions. Botão de shutter custom centralizado, botão de fechar (×) no canto superior direito.
- Após tirar foto, fecha o sheet automaticamente — usuário toca "Outra foto" para abrir de novo.
- Fotos ficam em strip horizontal scrollável no quick actions, cada uma com botão "×" para remover.

## "Voltar"

O botão "Voltar" no header (`backBtn`) tem comportamento contextual:

- Se `stepsAnteriores` está vazio → `router.back()` (sai do wizard).
- Senão → volta um step e remove os últimos items do histórico de chat.

Limitação conhecida: voltar **depois** de finalizar um talhão (já estando no step `mais_talhao` ou além) não restaura o `current` do talhão recém-finalizado. O fluxo trata cada talhão como uma unidade atômica. Para corrigir um talhão já finalizado, o consultor precisaria descartar e começar a visita de novo (uma feature futura: "editar talhão" na tela de confirmação).

## Limitações conhecidas

- **Sem rascunho persistente:** se o app fechar no meio do wizard, o progresso é perdido. Persistência de draft é roadmap.
- **Edição de talhão já finalizado:** não implementado. Ver seção "Voltar" acima.
- **Apenas 1 fazenda por visita:** intencional. Se o consultor visitar outra fazenda, é outra visita.
- **Apenas tipo `monitoramento_pragas`:** as outras 2 tipologias (Plantio, Previsão de colheita) ainda não foram implementadas neste wizard.

## Onde mexer

| Quer mudar... | Edite... |
|---|---|
| Adicionar/remover step | `Step` type + `ActiveArea` switch + `subtituloDoStep` |
| Mudar pergunta do bot | string nos `items` do `dispatch({ type: 'push', ... })` |
| Adicionar campo na ocorrência | `OcorrenciaTalhao` em `mocks.ts` + `CurrentTalhao` em `nova.tsx` + step novo + `finalize-current` |
| Mudar fluxo (ordem dos steps) | `proximoStep` nos dispatches |
| Adicionar nova tipologia (ex: Plantio) | Outra rota `visita/plantio.tsx` ou parametrizar `nova.tsx` por tipo |
