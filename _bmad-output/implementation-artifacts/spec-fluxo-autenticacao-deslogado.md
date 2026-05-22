---
title: 'Fluxo de autenticação deslogado (landing + login + cadastro + esqueci senha)'
type: 'feature'
created: '2026-05-21'
status: 'in-review'
baseline_commit: 'b18ce9315fb63448bd0228cbb535af0777ba8d6a'
context:
  - '{project-root}/apps/mobile/AGENTS.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** O app abre direto na área logada (`(drawer)`), sem porta de entrada. Não existe apresentação do produto para quem chega deslogado, nem telas de login, cadastro ou recuperação de senha — e o botão "Sair" do drawer não faz nada.

**Approach:** Criar uma área pública `(auth)` (landing de apresentação + login + cadastro + esqueci senha) e um gate de autenticação na raiz que decide entre área pública e `(drawer)` conforme o estado de auth. Auth é **mock** (consistente com o protótipo atual): persiste um flag/usuário em AsyncStorage, sem backend real. O "Sair" passa a limpar o estado e voltar à landing.

## Boundaries & Constraints

**Always:**
- Manter o estilo visual atual: tema `@/theme/colors`, `LogoFull`, `SafeAreaView`, componentes Tamagui (`YStack`/`XStack`/`Text`/`Card`/`Input`/`Button`).
- Auth como serviço único (`useAuth`) com estados `loading | authed | guest`; persistência em AsyncStorage no padrão de `src/data/storage.ts`.
- Enquanto o estado de auth carrega, não piscar a tela errada (mostrar splash/vazio até resolver).
- Textos em Português BR.

**Ask First:**
- Integrar Better-Auth / qualquer backend real de autenticação.
- Adicionar dependências novas (libs de form, validação, etc.).
- Mexer no conteúdo das telas logadas (home/tabs/perfil) — isso é o Goal B diferido.

**Never:**
- Implementar Goals B (shell logado) e C (CRM clientes/fazendas/talhões) — estão em `deferred-work.md`.
- Validação/segurança real de senha (hash, força, rate-limit). É protótipo.
- Login social, OTP, biometria.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| App abre deslogado | Sem auth no AsyncStorage | Após o load, mostra a landing `(auth)/index` | N/A |
| App reabre logado | Flag de auth presente | Vai direto à home logada `(drawer)`, sem passar pela landing | N/A |
| Login válido | E-mail + senha não vazios | `signIn` autentica, gate redireciona à home logada | N/A |
| Login inválido | Campo vazio ou e-mail malformado | Não autentica; erro inline ("Preencha e-mail e senha" / "E-mail inválido") | Mensagem inline, sem navegar |
| Cadastro válido | Nome + e-mail + senha preenchidos | `signUp` cria conta mock, autentica e vai à home logada | N/A |
| Esqueci senha | E-mail preenchido + enviar | Confirmação mock ("Se houver conta, enviamos o link"); não navega para área logada | Inline se e-mail vazio/inválido |
| Logout | Logado, toca "Sair" no drawer | `signOut` limpa AsyncStorage; gate volta à landing | N/A |

</frozen-after-approval>

## Code Map

- `src/app/_layout.tsx` -- raiz; hoje Stack com `(drawer)` + modal `visita/nova`. Recebe o AuthProvider e o gate.
- `src/app/(drawer)/_layout.tsx` -- drawer logado; botão "Sair" (hoje noop) será ligado ao `signOut`.
- `src/data/storage.ts` -- padrão de AsyncStorage (chave `@presenca-agro/...`, try/catch) espelhado pela persistência de auth.
- `src/theme/colors.ts` (paleta), `src/components/Logo.tsx` (`LogoFull`), `src/app/(drawer)/(tabs)/index.tsx` (layout SafeAreaView + Tamagui de referência).

## Tasks & Acceptance

**Execution:**
- [x] `src/auth/AuthContext.tsx` -- novo: `AuthProvider` + hook `useAuth` expondo `{ status, user, signIn(email,senha), signUp({nome,email,senha}), signOut() }`; carrega/persiste em AsyncStorage (`@presenca-agro/auth`), espelhando o try/catch de `storage.ts`. Mock: aceita credenciais não vazias e e-mail bem formado.
- [x] `src/app/_layout.tsx` -- editar: envolver a árvore no `AuthProvider`; gate que mostra splash enquanto `status==='loading'` e roteia `(auth)` (guest) vs `(drawer)` + modal `visita/nova` (authed). Verificar a API de rotas protegidas do **Expo SDK 56** antes de codar (ver AGENTS.md).
- [x] `src/app/(auth)/_layout.tsx` -- novo: Stack com `headerShown:false` para as telas públicas.
- [x] `src/app/(auth)/index.tsx` -- novo: landing de apresentação (LogoFull, headline + subtítulo do produto a partir do brief, botões "Entrar" → `/login` e "Criar conta" → `/cadastro`).
- [x] `src/app/(auth)/login.tsx` -- novo: form e-mail/senha com erro inline, chama `signIn`; links "Esqueci a senha" → `/esqueci-senha` e "Criar conta" → `/cadastro`.
- [x] `src/app/(auth)/cadastro.tsx` -- novo: form nome/e-mail/senha, chama `signUp`; link voltar para `/login`.
- [x] `src/app/(auth)/esqueci-senha.tsx` -- novo: form e-mail; ao enviar exibe mensagem de confirmação mock; link voltar para `/login`.
- [x] `src/app/(drawer)/_layout.tsx` -- editar: ligar o botão "Sair" ao `signOut` do `useAuth`.

**Acceptance Criteria:**
- Given um usuário deslogado abre o app, when o estado de auth termina de carregar, then ele vê a landing de apresentação e não a home logada.
- Given a sessão mock já está salva, when o app é reaberto, then ele abre direto na home logada sem flicker da landing.
- Given o usuário está logado, when toca "Sair" no drawer, then o estado é limpo e ele retorna à landing.
- Given navegação entre telas públicas, when toca os links (Entrar / Criar conta / Esqueci a senha / voltar), then chega à tela correspondente sem erro.

## Design Notes

- Persistência de auth: espelhar `storage.ts` — chave `@presenca-agro/auth`, `JSON.stringify` de `{ user }`, try/catch com `console.warn`. `status` arranca em `loading`, vira `authed`/`guest` após ler o storage no mount.
- Gate: preferir rotas protegidas nativas do Expo Router SDK 56 (`Stack.Protected` com `guard`) se disponível na versão; caso contrário, redirect via `useRouter`/`useSegments` em efeito. **Confirmar a API exata na doc versionada (v56) antes de implementar** (AGENTS.md exige).
- Validação mock de e-mail: regex simples `/^\S+@\S+\.\S+$/`. Senha: apenas não vazia.

## Verification

**Commands:**
- `pnpm --filter @presenca-agro/mobile type-check` -- expected: sem erros de tipo.
- `pnpm --filter @presenca-agro/mobile lint` -- expected: sem erros de lint.

**Manual checks:**
- Rodar `pnpm --filter @presenca-agro/mobile start`: app deslogado abre na landing; login mock leva à home; "Sair" volta à landing; reabrir mantém logado.
