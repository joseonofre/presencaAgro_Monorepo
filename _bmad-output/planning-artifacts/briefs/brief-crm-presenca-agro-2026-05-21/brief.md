---
title: "Product Brief — CRM Presença Agro"
status: ready
created: 2026-05-21
updated: 2026-05-21
owner: Onofre
---

# Product Brief: CRM Presença Agro

## Resumo Executivo

**Presença Agro** é uma plataforma de inteligência longitudinal por talhão para o agronegócio brasileiro, voltada a consultores agronômicos de revendas agropecuárias e autônomos. Combina um app mobile offline-first (centro da operação no campo) com um CRM web (comando de gestão), ambos modelados em torno do **prontuário do talhão** — histórico estruturado de cada talhão ao longo de safras consecutivas, que alimenta comparativos automáticos e relatórios profissionais com a marca da revenda.

Hoje o consultor registra visitas em WhatsApp, caderno e planilha; fotos georreferenciadas se perdem, recomendações somem entre safras e o relatório técnico vira improviso. Concorrentes diretos (como TBDC) focam em operação; Presença Agro foca em **acúmulo de inteligência longitudinal** — quanto mais tempo o cliente usa, mais valioso fica o sistema *para ele especificamente*.

## O Problema

O consultor agronômico de revenda (RTV) opera em três frentes desconectadas:

- **No campo:** WhatsApp para fotos, caderno para notas, memória para histórico
- **No escritório:** planilha do Excel para controle de visitas, Word para relatórios mensais
- **Na cabeça do gestor:** "quem visitou o quê, e o que está pendente?"

Consequências reais:

- **Dado nasce empobrecido:** foto vai pro WhatsApp sem geolocalização estruturada; observação verbal vira texto livre transcrito pela assistente.
- **Histórico se perde:** o que foi recomendado na safra passada some quando muda a equipe ou o consultor esquece.
- **Relatório é tarefa, não consequência:** o consultor monta o documento do zero todo mês, gastando horas que poderiam virar visitas.
- **Comparativo entre safras é impossível:** sem dado estruturado por talhão, não dá pra responder "por que o Pivô 3 produziu menos esse ano?".
- **A revenda não enxerga o valor do consultor:** o dono não tem visibilidade do que o RTV faz na rua, nem material consolidado para reforçar o relacionamento com o produtor.

Para o **produtor (cliente final)**, isso significa serviço técnico fragmentado — relatórios atrasados, recomendações esquecidas e a sensação de que a revenda vende defensivo, não consultoria.

## A Solução

Um sistema em duas peças, com função clara para cada uma:

### App Mobile (centro da operação de campo)

Onde o trabalho acontece. O consultor abre o app na fazenda e tem:

- **Cadastro contextual via GPS:** "Você está em uma fazenda nova. Quer cadastrar agora?" — captura pin imediato, pede só nome da fazenda e do produtor. O resto do cadastro vira tarefa progressiva, preenchida quando o consultor tem tempo.
- **Visita tipificada com schema próprio:** 3 tipos na Fase 1 — Plantio, Previsão de Colheita e Monitoramento de Pragas. Cada um com campos estruturados curtos (não um formulário monolítico) em fluxo *Conversational Wizard* (estilo Typeform).
- **Foto georreferenciada como evidência:** captura automática, com pin no mapa do talhão e vínculo a uma ocorrência específica.
- **PDF do relatório de visita** com a marca da revenda — gerado e enviado pelo WhatsApp no mesmo dia.
- **Trabalho 100% offline-first:** sincronização automática quando o sinal voltar.

### CRM Web (comando de gestão e bastidor)

Onde o gestor da revenda enxerga a operação e onde acontece o trabalho que pede tela grande:

- **Demarcação precisa de talhões** (polígonos no mapa, com PostGIS).
- **Dashboard do gestor:** visitas realizadas vs. planejadas, cobertura de carteira, ranking de RTVs e faturamento por usuário.
- **Visualização das visitas da equipe** (leitura com filtros, sem edição).
- **Relatório consolidado mensal:** PDF white-label da carteira inteira.
- **Prontuário do Talhão:** visualização longitudinal com camadas (safras, intervenções, ocorrências, fotos georreferenciadas).
- **Comparativo lado-a-lado** (Fase 2): entre safras do mesmo talhão ou entre talhões da mesma safra.
- **Importação em massa** (CSV/KML) para onboarding inicial sem fricção.

### Modelo de adoção bottom-up

O consultor individual contrata por iniciativa própria para se diferenciar profissionalmente, vira champion interno e leva a ferramenta ao dono da revenda — que então absorve o pagamento de toda a equipe de RTVs.

## O Que Torna Isso Diferente

Cinco diferenciadores reais, listados por força do moat:

1. **Prontuário do Talhão como ativo acumulado.** O talhão é a unidade de análise longitudinal — não a fazenda, não a visita. Cada safra alimenta o histórico. Em 2-3 anos o cliente não consegue sair: o valor está no estoque de safras comparáveis que ele acumulou. Esse é o fosso defensável real, não uma feature.

2. **PDF como produto de marca da revenda.** O relatório carrega a identidade visual da revenda — não do Presença Agro. A revenda entrega laudo técnico profissional ao produtor e se posiciona como serviço de consultoria, não vendedora de defensivo.

3. **Cadastro contextual via GPS** ("você está numa fazenda nova?"). O app reage ao contexto do campo em vez de exigir mais um formulário. Pouquíssimos apps brasileiros fazem isso bem.

4. **Loop completo da safra** (plantio → previsão → pragas) em vez de captura genérica. Dados estruturados por tipologia geram comparativos automáticos — o relatório emerge do ciclo, não é tarefa manual.

5. **Offline-first robusto via PowerSync** — sincronização real com resolução de conflitos, não cache esperto. Em fazenda de Mato Grosso sem sinal, o app continua útil.

**O que NÃO é moat:** o CRM em si (TBDC tem), o app em si (outros têm), o PDF bonito isolado (copiável em uma sprint) e a IA — que não está no MVP e nem deveria ser o pitch principal.

## Quem Isso Serve

### Usuário Primário: Consultor Agronômico (RTV de revenda)

> *Júnior, 32 anos, trabalha numa revenda em Lucas do Rio Verde/MT. Atende 40 produtores, faz 10-15 visitas por semana e dirige 800 km/semana. Usa WhatsApp com cada produtor, anota numa caderneta e monta o relatório no Word à noite. Sente que entrega menos valor técnico do que poderia — e que a revenda não enxerga.*

O que ele precisa:
- Capturar visita rápido no campo, sem digitar muito.
- Não perder informação entre uma visita e outra.
- Entregar relatório profissional sem ficar até 23h.
- Ter o histórico do talhão na mão quando o produtor pergunta "e aquela ferrugem do ano passado?".

### Usuário Secundário (comprador-pagador): Dono / Gestor de Revenda

> *Carlos, dono de revenda média (15 RTVs, 300 produtores ativos). Quer que sua equipe seja vista como técnica, não comercial. Hoje não tem visibilidade do que cada RTV faz na rua — só quando uma venda entra no ERP.*

O que ele precisa:
- Visibilidade da operação de campo (visitas, cobertura, equipe).
- Material consolidado para mostrar valor agregado ao produtor.
- Diferenciação competitiva contra revendas que só vendem produto.
- Retenção de cliente via serviço, não via preço.

### Usuário Secundário: Consultor Autônomo (ICP secundário, freemium controlado)

> *Roberta, agrônoma autônoma, atende 8 produtores como serviço próprio. Quer parecer profissional como uma equipe grande.*

O que ela precisa:
- Caderno digital com PDF bonito.
- Sem complexidade de equipe — usuário solo.
- Preço baixo, self-service.

### Quem NÃO é o foco

- **Produtor rural (cliente final):** beneficiário invisível na Fase 1. O portal read-only para o produtor é candidato à Fase 3.
- **Cooperativa / grande corporação agro:** a complexidade de venda B2B enterprise está fora do MVP.

## Critérios de Sucesso

### Sinais de produto (usuário ama)
- O piloto continua usando o app **sem ser cobrado** após as 4 primeiras semanas.
- O piloto indica a ferramenta para outro consultor sem ser solicitado.
- 50%+ das visitas reais do piloto entram no app (em vez de ficar no caderno).
- Tempo de geração do relatório por visita: < 5 minutos (vs. 30-60 min hoje no Word).

### Sinais de validação (mercado quer)
- 3 pilotos ativos pagantes (mesmo que simbolicamente) em 90 dias a partir do início do uso.
- 1 conversa formal com dono de revenda interessado em absorver o pagamento da equipe.
- NPS dos pilotos ≥ 40 após 60 dias de uso.

### Sinais de Vision (longo prazo)
- 10 revendas pagantes ao final do ano 1.
- Acúmulo de pelo menos 2 safras completas em ≥ 30 talhões reais.
- Primeiro relatório comparativo lado-a-lado (Fase 2) usado em decisão real de produtor.

`[ASSUMPTION]` Os números acima são metas iniciais e devem ser revistos após as 4 primeiras semanas de discovery com o piloto, especialmente NPS e percentual de visitas capturadas.

## Escopo

### Fase 1 — App + Backend (foco principal)

**No escopo:**
- App mobile (Expo + PowerSync) com captura offline-first.
- Cadastro contextual e progressivo de Cliente, Fazenda e Talhão (via GPS quando aplicável).
- 3 tipologias de visita: **Plantio**, **Previsão de Colheita** e **Monitoramento de Pragas**.
- Foto georreferenciada como evidência estruturada.
- Geração de PDF com template fixo white-label (logo, cor e nome da revenda).
- Envio direto pelo WhatsApp.
- Convite de usuários via link mágico (Deep Link com Branch.io ou Firebase Dynamic Links).
- Autenticação com Better-Auth, modelo `User` global + `Membership` por organização.
- Multitenancy lógica via Postgres RLS + `tenant_id`.
- Billing com Stripe: 2 SKUs binários — *Empresa* (R$/seat) e *Solo* (R$/usuário ou freemium).

**Fora do escopo da Fase 1:**
- Comparativo lado-a-lado (Fase 2).
- Tipologia "Aplicação/Cobertura de Adubo" (cortada).
- Tipologia "Colheita" como evento (cortada na Fase 1; pode entrar como parte de Previsão de Colheita).
- IA de recomendação (Fase 3).
- IA de visão computacional para detecção de pragas (fora do roadmap).
- Editor visual de template de PDF (Fase 3).
- Portal read-only do produtor (Fase 3).
- Integração com receituário agronômico (Fase 3).
- Integração com ERP da revenda.

### Fase 1.5 — CRM Web mínimo

**No escopo:**
- Demarcação de talhões com polígono no mapa.
- Dashboard do gestor (visitas realizadas vs. planejadas, cobertura, ranking de RTVs).
- Visualização das visitas da equipe (filtros, sem edição).
- Relatório consolidado mensal (PDF white-label da carteira).
- Importação CSV de clientes e fazendas.

**Fora:** análise multicamada, comparativos avançados e editor visual de PDF.

### Fase 2 — Comparativo e Análise

- Prontuário do Talhão com timeline navegável.
- Comparativo lado-a-lado (Swipe Compare no mobile, painel multicoluna no web).
- Calendário com SLA por fazenda e alertas progressivos.
- Inbox de Captura (visitas iniciadas no mobile, finalizadas no web).
- Modo Briefing pré-visita.

### Fase 3 — Inteligência e Ecossistema

- IA narrativa de comparativo entre safras.
- Recomendações baseadas no histórico local do talhão.
- Portal read-only do produtor.
- Editor visual de template de PDF.
- Integração com ferramentas externas (receituário, ERP, clima).

## Stack Técnica

### Mobile
- **Expo** (React Native, sem código nativo no MVP).
- **PowerSync** para sincronização offline-first (Postgres → SQLite no device).
- **NativeWind** ou **Tamagui** para estilização.
- **XState** para máquina de estados do Conversational Wizard.
- **expo-image-manipulator** para compressão de fotos.
- **expo-task-manager** + **expo-background-fetch** para upload em background.

### Backend
- **Nest.js** (TypeScript).
- **Prisma** ORM.
- **Postgres** com **PostGIS** (geo) e **RLS** (isolamento por `tenant_id`).
- **Better-Auth** para identidade global e membership por organização.
- **Cloudflare R2** (compatível com S3) para storage de fotos.
- **BullMQ** para filas (geração de PDF, processamento de thumbnails, notificações).
- **Stripe** para billing (sem Connect).
- **Puppeteer** para geração de PDF (templates HTML/CSS por tenant).

### CRM Web
- **React + Vite + TypeScript**.
- **TanStack Router** (roteamento type-safe com loaders aninhados).
- **TanStack Query** (cache de servidor).
- **TanStack Store** (estado de UI global — tenant ativo, filtros).
- **Tailwind 4**.
- **Mapbox GL JS** para mapas.

### Estrutura do repositório (Monorepo Turborepo)
```
apps/
  mobile/    (Expo)
  web/       (Vite + React + TanStack)
  api/       (NestJS)
packages/
  types/     (gerado do Prisma)
  schemas/   (Zod, compartilhado)
  sdk/       (cliente API gerado do OpenAPI)
  domain/    (regras de negócio puras)
```

### Infraestrutura inicial
- **Railway** ou **Fly.io** (sem Kubernetes no MVP).
- Postgres com `wal_level=logical` (requisito do PowerSync).
- CI/CD via GitHub Actions.

## Riscos Conhecidos

1. **Mercado contra TBDC e similares:** brigar feature-vs-feature é guerra de atrito perdida. O posicionamento "infraestrutura de inteligência longitudinal por talhão" depende de comunicação clara — não pode ser pitchado como "mais um CRM".
2. **Cemitério de cadastros:** se a Fase 1 não capturar visita de verdade em campo, o produto vira sistema vazio. A escolha de app-first com offline-first robusto mitiga o risco, mas exige discovery real com o piloto desde o dia 1.
3. **Dispersão de ICP (revenda + autônomo simultâneo):** decisão consciente. Mitigação: autônomo é freemium controlado, com zero esforço comercial. Se atender autônomo consumir mais de 10% do tempo, cortar.
4. **Multi-tenant e LGPD:** o consultor que atende múltiplas revendas não pode ver dado da revenda A quando está na B. O RLS resolve tecnicamente, mas o produto precisa deixar o tenant ativo visualmente óbvio (cor de header, logo, eventual confirmação ao trocar).
5. **Discovery N=1:** apenas 1 piloto identificado, com risco de viés de confirmação. Mitigação: buscar 2-3 consultores externos em paralelo nas primeiras 4 semanas.
6. **Identidade do talhão entre safras:** o talhão muda de forma (subdivide, junta, vira pasto). O schema precisa versionar identidade canônica e alias por safra desde o dia 1.
7. **Schema migration no celular:** migrations apenas aditivas em produção, force-update gate por schema version e backup antes de cada migration. O PowerSync simplifica mas não elimina o problema.
8. **Custo de PowerSync por MAU:** acima do free tier (1k MAU), aproximadamente US$ 0,40/MAU. O modelo de preço precisa absorver esse custo.

## Vision (2-3 anos)

Em 2-3 anos, Presença Agro é a **infraestrutura padrão de inteligência longitudinal** para revendas agropecuárias de pequeno e médio porte no Brasil. Cada talhão monitorado tem 3-5 safras acumuladas no sistema, gerando comparativos automáticos que tornam a recomendação técnica defensável com dado real, não intuição. O PDF white-label fica tão associado à marca da revenda quanto o uniforme do RTV.

A revenda que usa Presença Agro tem:
- **Retenção 2x maior** de produtor — ele não quer perder o histórico acumulado do talhão.
- **Up-sell de serviços técnicos** — consultoria como linha de receita, não apenas venda de defensivo.
- **Diferenciação visível** contra revendas que só vendem produto.

O produtor passa a perceber a revenda como **parceira técnica**, não fornecedora. O portal read-only do produtor (Fase 3) consolida essa percepção, e a IA narrativa (Fase 3) gera laudos comparativos que o consultor assina — a tecnologia escreve, o consultor agrega expertise. Não substitui o consultor; potencializa.

**Sinais de que a Vision se realizou:**
- Revendas citam "Presença Agro" como diferencial comercial em propostas para o produtor.
- Concorrentes lançam clones do prontuário do talhão (validação por imitação).
- Cooperativas procuram a empresa para integração ou white-label.
- Surge o primeiro caso de produtor que troca de revenda mas mantém o histórico via portal.
