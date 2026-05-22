# Deferred Work

Trabalho identificado mas adiado durante sessões de quick-dev. Cada item é um objetivo independentemente entregável.

## 2026-05-21 — Split do pedido "telas iniciais do app"

Pedido original cobria 3 objetivos. Escolhido começar pelo **Goal A (auth)**. Os abaixo ficaram diferidos:

### Goal B — Shell logado (home + drawer)
- Reorganizar a home logada com áreas que realmente fazem sentido para o app (hoje a home em `src/app/(drawer)/(tabs)/index.tsx` é orientada a "nova visita / agenda / minhas visitas").
- Popular o drawer (`src/app/(drawer)/_layout.tsx`) com os itens reais do app, apontando para áreas existentes (incluindo Clientes do Goal C).
- **Acoplamento:** depende de A definir o estado "logado" e idealmente de C existir para o item "Clientes" do drawer ter destino.

### Goal C — CRM hierárquico: Clientes → Fazendas → Talhões
- Listagem + cadastro de clientes.
- Dentro do cliente: listar e cadastrar fazendas.
- Dentro da fazenda: visualizar talhões.
- Já existem tipos/mocks parciais em `src/data/mocks.ts` (`Fazenda`, `Talhao`, `mockFazendas`, `mockTalhoes`, `talhoesDeFazenda`). Falta o conceito de **Cliente** (no brief = produtor/cliente final) como entidade própria acima de Fazenda.
- **Premissa:** protótipo navegável com mocks/AsyncStorage, sem backend real.
