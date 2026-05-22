# Wizard de Nova Visita

Documento descreve o fluxo conversacional usado em `src/app/visita/nova.tsx` para registrar uma visita técnica no campo. Cada visita cobre **uma fazenda** e **um tipo (travado após escolha)** com **N talhões** preenchidos um por vez, em série.

## Princípios de UX

- **Formato chat:** bubbles bot/usuário em scroll vertical contínuo, com histórico visível. Cada interação adiciona uma bubble de pergunta + uma de resposta.
- **Quick Actions fora do chat:** botões pill ficam em uma barra fixa abaixo do chat. Tocar avança o fluxo direto, sem botão "Continuar" intermediário.
- **Captura contextual:** GPS é capturado ao abrir o wizard e usado para ordenar fazendas por proximidade. Cada foto também captura GPS individual.
- **Fluxo serial por talhão:** escolhe um talhão, preenche tudo desse talhão, finaliza, e só depois o app pergunta se visitou outro talhão da mesma fazenda.
- **Resposta editável (✏️):** quase todas as bubbles de resposta podem ser refeitas via ícone ao lado. Exceções travadas: Fazenda e Tipo de Visita.
- **Voltar pede confirmação:** o botão "‹ Voltar" do header sempre abre alerta de descarte. Não navega step a step. Edição granular acontece via ✏️.
- **Pular em textareas:** campos de texto livre (adubação, observação, recomendação) têm botão "Pular" ao lado de "Continuar".

## Modelo de dados

Definido em `src/data/mocks.ts`:

```ts
interface OcorrenciaTalhao {
  talhaoId: string;
  talhaoNome: string;

  // Monitoramento de pragas
  identificouPraga?: boolean;
  pragaId?: string;
  pragaNome?: string;
  nivelInfestacao?: 'baixo' | 'medio' | 'alto' | 'critico';

  // Plantio
  cultura?: string;
  variedade?: string;
  dataPlantio?: string;       // ISO
  cicloDias?: number;
  adubacaoBase?: string;

  // Colheita
  dataColheita?: string;       // ISO
  produtividade?: number;       // sc/ha
  umidade?: number;             // %

  // Comum
  fotos: FotoOcorrencia[];
  recomendacao?: string;
  observacao?: string;

  // [legado — mantido em runtime para retrocompat com dados antigos do schema]
  dataPlantioEstimada?: string;
  cicloDiasEstimado?: number;
  janelaInicio?: string;
  janelaBase?: string;
  janelaFim?: string;
}

interface VisitaSalva {
  id: string;
  tipo: 'monitoramento_pragas' | 'plantio' | 'colheita';
  data: string;
  fazendaId: string;
  fazendaNome: string;
  ocorrencias: OcorrenciaTalhao[];
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

State é gerenciado por `useReducer` local em `nova.tsx`. Após **Fazenda → Tipo de Visita**, o fluxo se ramifica por tipo. Cada fluxo termina em **recomendação → mais_talhao → confirmar/salvar**.

```
                       boot
                        ↓
                      fazenda  [LOCKED]
                        ↓
                   tipo_visita  [LOCKED]
                        ↓
                     talhao  ←──────────────────────────┐
                        ↓                                │
        ┌───────────────┼──────────────────┐             │
        ↓               ↓                  ↓             │
  monitoramento     plantio            colheita          │
   _pragas                                                │
        │               │                  │             │
   praga_pergunta    cultura            cultura          │
   ├─Sim→praga_sel.  variedade          data_colheita    │
   │  →nivel→fotos   data_plantio       produtividade    │
   │                 ciclo_dias          umidade (skip)  │
   │                 fotos (skip)        fotos (skip)    │
   │                 adubacao_base       observacao      │
   │                  (skip)              (skip)         │
   │                                                     │
   └────────→ recomendacao (skip) ←──────────────────────│
                        ↓                                 │
              [finalize-current]                          │
                        ↓                                 │
                  mais_talhao                             │
                  ├─Sim─────────────────────────────────  │
                  └─Não                                   │
                        ↓                                 │
                   confirmar                              │
                        ↓                                 │
                     [save]                               │
```

## State shape

```ts
interface State {
  step: Step;
  stepsAnteriores: Step[];   // pilha de navegação (não consumida por "Voltar", mas pelo histórico)
  historico: ChatItem[];      // bubbles renderizados

  fazendaId?: string;
  fazendaNome?: string;
  tipoVisita?: TipoVisita;    // travado após escolha

  ocorrencias: OcorrenciaTalhao[];   // talhões já finalizados
  current: CurrentTalhao;            // talhão em preenchimento

  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsCapturadoEm?: string;
}

interface CurrentTalhao {
  talhaoId?: string;
  talhaoNome?: string;
  // monitoramento
  identificouPraga?: boolean;
  pragaId?: string;
  pragaNomeCustom?: string;
  nivel?: NivelInfestacao;
  // plantio
  cultura?: string;
  variedade?: string;
  dataPlantio?: string;
  cicloDias?: number;
  adubacaoBase?: string;
  // previsão
  dataPlantioEstimada?: string;
  cicloDiasEstimado?: number;
  // comum
  fotos: FotoOcorrencia[];
  observacao: string;
  recomendacao: string;
}
```

A separação `current` vs `ocorrencias` é o coração do fluxo serial: cada talhão é construído em `current` e migrado pra `ocorrencias[]` quando o usuário finaliza a recomendação.

## Eventos especiais no chat

- **Bubble bot:** pergunta ou confirmação do app (esquerda, branco com borda).
- **Bubble user:** resposta do consultor (direita, verde). Variante `choice` (verde-escuro) marca seleção via quick action.
- **Bubble locked:** resposta que **não pode ser editada** (Fazenda, Tipo de Visita). Sem ícone ✏️ ao lado.
- **Evidence card:** card especial com thumbnail genérico de câmera + label + geo, exibido após concluir fotos de um talhão.
- **Divider:** separador `─── PIVÔ 01 REGISTRADO ───` entre talhões. Marca o final de uma ocorrência.

## Edição de respostas

Cada bubble user editável guarda um `EditSnapshot` que captura o `State` antes daquela resposta. Tocar no ícone ✏️ ao lado de uma bubble:

1. Abre `Alert.alert` de confirmação ("Editar essa resposta? Você vai perder o que preencheu depois.")
2. Se confirmar, dispatcha `edit-from` com o snapshot
3. O reducer restaura o estado completo (step, stepsAnteriores, current, fazenda, tipo, ocorrencias) e trunca o `historico` até o ponto anterior à resposta editada
4. O usuário re-responde do step daquele ponto

**Exceções (locked = true):**
- Bubble user da escolha de **Fazenda**
- Bubble user da escolha de **Tipo de Visita**

Essas duas são decisões estruturais. Mudá-las invalidaria todo o resto do fluxo, então o app força o usuário a sair (Voltar) e começar uma nova visita.

## Voltar do wizard

O botão "‹ Voltar" no header **não navega step a step**. Ele:

- Se não há progresso (sem fazenda, sem tipo, sem talhão em construção, sem ocorrências) → `router.back()` direto.
- Caso contrário → `Alert.alert("Sair da visita? Você vai perder os dados preenchidos.")` com opções Cancelar / Sair.

Edição granular acontece via ✏️ nas bubbles. Não via "Voltar".

## Subtitle dinâmico do header

- `boot` → "Detectando localização…"
- após escolher fazenda → nome da fazenda
- após escolher tipo → `"Plantio • Fazenda Boa Esperança"`
- após finalizar talhões → `"Plantio • Fazenda Boa Esperança • 2 talhões"`

## Pular em textareas

Campos de texto livre têm botão "Pular" ao lado de "Continuar":

- **`adubacao_base`** (Plantio): pular ⇒ campo fica `undefined` na ocorrência.
- **`observacao`** (Previsão de colheita): pular ⇒ campo fica `undefined`.
- **`recomendacao`** (todos os tipos): pular ⇒ campo fica `undefined`. A resposta aparece no chat como `(pulado)`.

Fotos também podem ser puladas no fluxo de Plantio/Previsão (em Monitoramento são obrigatórias).

## Filtragem de talhões disponíveis

No step `talhao`, a lista exclui talhões já presentes em `ocorrencias[]`. Evita o usuário cadastrar duas ocorrências para o mesmo talhão na mesma visita.

No step `mais_talhao`, se todos os talhões da fazenda foram registrados, o app esconde "Sim, outro talhão" e mostra apenas "Finalizar visita".

## Persistência

- Visitas são salvas no `AsyncStorage` sob a chave `@presenca-agro/visitas`.
- `storage.ts` implementa migration leve para suportar dados de versões anteriores do schema (campos flat → arrays → ocorrencias[]).
- A intenção é trocar AsyncStorage por PowerSync + SQLite local quando o backend Nest.js estiver de pé.

## GPS

- Capturado uma vez ao abrir o wizard (foreground permission, accuracy Balanced).
- Usado para ordenar fazendas por proximidade no step `fazenda` (helper `fazendasProximas()` em `mocks.ts` usa Haversine).
- Recapturado a cada foto tirada — `latitude`/`longitude` ficam em cada `FotoOcorrencia` individualmente.

## Colheita: campos quantitativos

A tipologia `colheita` registra o evento real de colheita. Os campos numéricos coletados são:

- **dataColheita** (ISO) — input `DD/MM/AAAA` com atalho "Usar hoje".
- **produtividade** (sc/ha) — aceita decimais (`,` ou `.`). Obrigatório.
- **umidade** (%) — aceita decimais. Pode ser pulado.

Esses dados alimentam o histórico longitudinal por talhão (Prontuário do Talhão no CRM web futuro) para comparativos entre safras.

> **Nota de migração:** o tipo anterior `previsao_colheita`, com cálculo de janela (`janelaInicio`/`janelaBase`/`janelaFim` ± 7 dias da data prevista), foi removido. Dados salvos antes da troca são mapeados automaticamente pelo `storage.ts` (`normalizarTipo`) e os campos legados continuam permitidos no schema para leitura. O fluxo atual não os preenche.

## Câmera

- `expo-camera` (CameraView).
- Abre como sheet de 480px no lugar dos quick actions. Botão shutter custom centralizado, botão fechar (×) no canto superior direito.
- Após tirar foto, fecha o sheet automaticamente — usuário toca "Outra foto" para abrir de novo.
- Fotos ficam em strip horizontal scrollável, cada uma com botão "×" para remover.

## Limitações conhecidas

- **Sem rascunho persistente:** se o app fechar no meio do wizard, o progresso é perdido. Persistência de draft é roadmap.
- **Editar talhão já finalizado:** ✏️ aparece nas bubbles do talhão atual. Talhões já em `ocorrencias[]` (acima do divider) não têm controle de edição direta — usuário precisaria descartar e recomeçar a visita.
- **Apenas 1 fazenda por visita:** intencional. Se o consultor visitar outra fazenda, é outra visita.
- **Data como texto livre:** o input de data aceita formato `DD/MM/AAAA` mas não tem date picker nativo ainda. Botão "Usar hoje" disponível.

## Onde mexer

| Quer mudar... | Edite... |
|---|---|
| Adicionar/remover step | `Step` type + `ActiveArea` switch + `subtituloDoStep` |
| Mudar pergunta do bot | string nos `items` do `dispatch({ type: 'push', ... })` |
| Adicionar campo na ocorrência | `OcorrenciaTalhao` em `mocks.ts` + `CurrentTalhao` em `nova.tsx` + step novo + `finalize-current` |
| Mudar fluxo (ordem dos steps) | `proximoStep` nos dispatches + `proximoStepAposTalhao()` |
| Marcar bubble como locked | adicionar `locked: true` no item user dentro do `push` |
| Mudar regra de edição | snapshot em `takeSnapshot()` + reducer `edit-from` |
| Adicionar nova tipologia (ex: Colheita real) | `TipoVisita` em `mocks.ts` + `QuickTipoVisita` + steps específicos + `proximoStepAposTalhao()` |
