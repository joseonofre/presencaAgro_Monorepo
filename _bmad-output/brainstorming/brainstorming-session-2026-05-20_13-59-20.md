---
stepsCompleted: [1, 2]
inputDocuments: []
session_topic: 'CRM Presença Agro — MVP multitenant com foco em Cliente > Fazenda(s) > Visita com histórico e relatório de resultados/aplicações/comparações'
session_goals: 'a) Funcionalidades/módulos do produto; b) Diferenciação vs TBDC; c) Jornada do consultor em campo; e) Oportunidades IA/automação; g) Exploração ampla'
selected_approach: 'ai-recommended'
techniques_used: ['SCAMPER', 'Role Playing + Cross-Pollination', 'First Principles Thinking']
ia_scope_refinement: 'IA de detecção visual de pragas por foto = FORA DO MVP. IA foca em: recomendações por histórico, previsão de janelas de ação, alertas de prazo, comparações entre safras.'
ideas_generated: []
context_file: 'N/A'
---

# Sessão de Brainstorming: CRM Presença Agro

**Data:** 2026-05-20  
**Facilitador:** Claude (BMAD Brainstorming)  
**Participante:** Onofre

---

## 📋 Visão da Sessão

### Tema Central
**CRM para agronegócio** — ecossistema integrado (app mobile + API + CRM web) com modelo multitenant, inspirado no TBDC, mas com diferenciação clara através de funcionalidades de histórico, análise e comparação lado-a-lado.

### Hierarquia de Dados (MVP)
```
Cliente (empresa agrícola)
  └─ Fazenda(s)
      └─ Visita (tipificada: plantio, avaliação, colheita, etc.)
          └─ Registro (histórico, aplicações, resultados)
```

### Objetivos da Sessão
1. **Funcionalidades** — mapa completo de módulos para MVP
2. **Diferenciação competitiva** — o que nos diferencia do TBDC e similares
3. **Jornada do consultor** — fluxo de campo, UX mobile, offline-first considerations
4. **Oportunidades de IA** — visão computacional, previsão, recomendações
5. **Exploração ampla** — ideação generativa antes de converger

### Restrições de Escopo (MVP)
- **Foco em histórico e análise** — cada visita gera dados que alimentam relatórios, comparações lado-a-lado e tendências
- **Multitenancy** — um usuário pode pertencer a várias empresas/clientes
- **Usuário primário** — consultor de revenda no campo + gestor no CRM web

---

## 🚀 Parâmetros de Sessão

- **Modo:** MVP primeiro (viável), mas exploração sem amarras
- **Quantidade de Ideias Alvo:** 100+
- **Duração:** Generativa (fase de ideação pura)
- **Anti-viés:** Rotação de domínios (funcional → UX → negócio → edge cases → IA/tech)

---

## Phase 1 — SCAMPER (23 ideias)

### Hierarquia de Dados Definida
```
Cliente > Fazenda > Talhão > Visita (tipificada)
```

### Tipos de Visita (MVP)
| Tipo | Campos-chave |
|---|---|
| Registro de Plantio | Cultura, semente (básico), talhão(s), data plantio, ciclo dias/meses, adubação de base |
| Aplicação / Manejo | Produto, dose, área, estágio, tipo |
| Avaliação de Plantio | Estágio fenológico, ocorrências, recomendação |
| Vistoria de Praga | Tipo, nível infestação, ponto controle, recomendação |
| Colheita | Produtividade real sc/ha, umidade, data real vs prevista |

### Decisões de Escopo (MVP)
- Receituário agronômico: fora do MVP
- IA de detecção de praga por foto: fora do MVP
- Portal do produtor (read-only): candidato pós-MVP

### Ideias Geradas — SCAMPER

**[SCAMPER-S #1]**: Visita como Evento Tipificado com Schema Próprio
_Conceito_: Em vez de "atividade genérica", cada tipo de visita tem campos estruturados próprios. Um "Registro de Plantio" nasce com campos fixos: cultura, semente, talhão, data, ciclo, adubação de base.
_Novidade_: Dados estruturados geram histórico comparável automaticamente — elimina o campo "observações livres" como repositório primário.

**[SCAMPER-S #2]**: Talhão como Unidade de Análise Longitudinal ("Prontuário do Talhão")
_Conceito_: O talhão é a unidade mínima de análise — não a fazenda. Acumula histórico de safras para comparação lado a lado de insumos vs resultados.
_Novidade_: Em vez de relatório da fazenda, o sistema gera a "ficha do talhão" — similar ao prontuário médico de um paciente.

**[SCAMPER-S #3]**: Talhão com Identidade Persistente + Alias por Safra
_Conceito_: Nome canônico permanente (ex: "Pivô 01") + alias temporário por safra (ex: "Soja 25/26"). Sistema mantém vínculo histórico pelo ID, não pelo nome.
_Novidade_: Resolve o problema real de campo onde o produtor chama o talhão pelo que está plantado, sem quebrar histórico comparativo.

**[SCAMPER-S #4]**: Previsão de Colheita como Janela com Cenários
_Conceito_: Consultor informa ciclo da cultura (dias/meses). Sistema calcula 3 cenários no calendário: otimista, base e conservador. Consultor fixa o cenário escolhido.
_Novidade_: Colheita no calendário não é um ponto — é um bloco visual com margem de erro, mostrando incerteza de forma honesta.

**[SCAMPER-S #5]**: Taxonomia de Tipos de Visita como Schema Central
_Conceito_: Cada tipo de visita é uma entidade com campos próprios. A produtividade real registrada na colheita fecha o ciclo e cruza automaticamente com o plantio do mesmo talhão/safra.
_Novidade_: Relatório comparativo nasce automaticamente ao fechar a safra, sem trabalho manual extra.

**[SCAMPER-C #6]**: Safra como Objeto Vivo (Combinação de Visitas)
_Conceito_: O registro de plantio instancia uma Safra automaticamente. Avaliações, aplicações e colheita se vinculam a ela. Relatório final gerado ao fechar com a visita de colheita.
_Novidade_: Elimina relatório como tarefa — ele emerge naturalmente do ciclo de visitas.

**[SCAMPER-C #7]**: Foto como Evidência Estruturada (não anexo livre)
_Conceito_: Fotos vinculadas a uma ocorrência específica com geolocalização automática. No relatório, aparece com localização, data/hora e ocorrência associada.
_Novidade_: A foto vira prova técnica rastreável — documento profissional, não álbum sem contexto.

**[SCAMPER-C #8]**: Relatório em Dois Níveis — Visita e Safra
_Conceito_: (1) Relatório de Visita — snapshot do dia, enviável ao produtor imediatamente. (2) Relatório de Safra — consolidado de todo o ciclo ao fechar a colheita.
_Novidade_: Consultor tem entregável profissional no mesmo dia da visita — diferenciador de serviço.

**[SCAMPER-C #9]**: Comparativo Lado a Lado como Relatório de Decisão
_Conceito_: Relatório com talhões em colunas paralelas — mesmo talhão entre safras ou talhões diferentes na mesma safra. Métricas: produtividade, insumos, pragas, aplicações.
_Novidade_: Produtor responde "valeu mudar a semente no Pivô 02?" com dados reais, não intuição.

**[SCAMPER-C #10]**: Oportunidade Comercial Originada de Visita (Acoplamento Fraco)
_Conceito_: Consultor abre uma "oportunidade" referenciando a visita técnica. Venda fica no módulo comercial com link para a visita de origem.
_Novidade_: Separa chapéu técnico do comercial, mas mantém rastreabilidade. Gestor vê conversão de visitas técnicas em vendas.

**[SCAMPER-C #11]**: Módulo de Comparação como Ferramenta de Análise Autônoma
_Conceito_: Área dedicada onde consultor seleciona 2+ registros (talhão + safra) livremente. Suporta longitudinal (mesmo talhão, safras diferentes) e transversal (talhões diferentes, mesma safra).
_Novidade_: Comparação ad-hoc como pivot table agrícola — análise que o consultor precisa na hora.

**[SCAMPER-C #12]**: IA como Analista de Dados Agrícolas
_Conceito_: IA recebe dados estruturados dos talhões selecionados e gera: narrativa comparativa em linguagem natural, gráficos das métricas principais, insights não óbvios nos números.
_Novidade_: Consultor entrega laudo com linguagem de consultoria. A IA escreve, o consultor assina o conhecimento.

**[SCAMPER-C #13]**: Gráficos Automáticos por Tipo de Dado
_Conceito_: Cada tipo de dado gera o gráfico mais adequado: produtividade → barras; evolução temporal → linha; pragas por talhão → mapa; custo vs produtividade → scatter ROI.
_Novidade_: Sem configuração de gráficos — sistema escolhe a visualização correta pelo contexto, como Google Sheets automático com conhecimento agronômico.

**[SCAMPER-C #14]**: PDF como Produto de Marca da Revenda
_Conceito_: Relatório comparativo exportado em PDF com identidade visual da revenda. Inclui tabela, gráficos, narrativa da IA e espaço para observações do consultor. Enviável ou usado em apresentação presencial.
_Novidade_: Software vira ferramenta de posicionamento de marca — a revenda entrega laudo técnico profissional que concorrentes não replicam.

**[SCAMPER-A #15]**: Calendário de Campo como CRM de Retenção
_Conceito_: Sistema rastreia tempo desde última visita por fazenda/talhão com alertas visuais: verde (ok), amarelo (atenção), vermelho (crítico). Consultor vê de relance quais fazendas precisam de atenção.
_Novidade_: Adapta "customer health score" dos SaaS CRMs para contexto de campo. Métrica é presença física, não engajamento digital.

**[SCAMPER-A #16]**: Calendário Unificado — Visitas + Colheitas + Alertas
_Conceito_: Um calendário com três camadas: visitas agendadas/realizadas, janelas de colheita de todos talhões ativos, alertas de fazendas sem visita há X dias.
_Novidade_: Resolve fragmentação que hoje vive em 3 ferramentas: Google Calendar + planilha + WhatsApp.

**[SCAMPER-A #17]**: Frequência de Visita como SLA da Fazenda
_Conceito_: Cada fazenda tem SLA configurado (semanal/quinzenal/mensal/bimestral/anual). Alerta progressivo: aviso antecipado, urgente (no prazo), crítico (vencido). SLA editável.
_Novidade_: Adapta SLA de suporte técnico para gestão de carteira de campo — consultor gerencia compromissos, não só agenda.

**[SCAMPER-A #18]**: Calendário em Dois Níveis — Consultor e Gestor
_Conceito_: Consultor: agenda pessoal com visitas por fazenda. Gestor: painel consolidado de toda equipe com SLAs vencidos, visitas agendadas por consultor, distribuição de carga.
_Novidade_: Gestor não pergunta "você visitou?" — vê em tempo real. Consultor recebe alerta antes do prazo, não cobrança depois.

**[SCAMPER-A #19]**: Visita Agendada vs Realizada como Estados Distintos
_Conceito_: Estados: Agendada → Em andamento (check-in via app) → Realizada (dados preenchidos). SLA renova só em "Realizada" — agendar não conta.
_Novidade_: Elimina visitas "fantasma" agendadas mas nunca executadas que inflam métricas e escondem fazendas em risco.

**[SCAMPER-M #20]**: Histórico como Motor de Recomendação (IA)
_Conceito_: Com 2+ safras no mesmo talhão, IA identifica padrões e gera alertas contextualizados no momento certo do ciclo. Recomendação baseada no histórico da fazenda específica.
_Novidade_: Sistema aprende com o histórico local, não dados genéricos. Recomendação com contexto real da propriedade.

**[SCAMPER-M #21]**: Multitenant com Empresa Própria como Caso Natural
_Conceito_: Usuário pertence a N Empresas com papel em cada (Admin/Gestor/Consultor). Freelancer cria sua própria empresa e é Admin dela. Troca de contexto na interface ao fazer login.
_Novidade_: Não existe "modo freelancer" — é o mesmo modelo aplicado a escala 1. Simplifica código e expande mercado endereçável sem custo extra.

**[SCAMPER-E #22]**: Sem Pipeline de Vendas como Tela Principal
_Conceito_: Tela principal do consultor é o calendário de campo + fazendas com alerta. Venda é consequência da visita técnica, não o centro da ferramenta.
_Novidade_: Reforça identidade do consultor como técnico que gera vendas, não vendedor com agenda técnica.

**[SCAMPER-R #23]**: Portal Read-Only para o Produtor
_Conceito_: Acesso read-only para o produtor ver histórico das suas fazendas, relatórios enviados e janelas de colheita — sem poder editar.
_Novidade_: Transparência como argumento de venda da revenda. Candidato forte para pós-MVP.

---

## Próximas Etapas: Seleção de Técnica

Agora vamos escolher como vamos gerar ideias. Você prefere:

**[1] Técnicas Selecionadas pelo Usuário**  
Você navega nossa biblioteca e escolhe quais técnicas usar (ex: SCAMPER, Mapa Mental, Analogia, etc.)

**[2] Técnicas Recomendadas pela IA**  
Baseado no seu escopo e objetivos, eu sugiro um combo otimizado de técnicas

**[3] Seleção Aleatória**  
Descubra técnicas inesperadas — às vezes o caos criativo funciona

**[4] Fluxo Progressivo**  
Começamos amplo (geração livre), depois progressivamente focamos em validação e síntese

Qual abordagem combina com seu estilo? (Digite 1, 2, 3 ou 4)
