# AGENTS.md — Mais Jiu

Guia rápido para agentes de código trabalharem neste projeto.

## Padrões de código (obrigatório)

Todo código escrito neste projeto **deve** seguir os padrões obrigatórios:

- [`.cursor/rules/code-standards.md`](.cursor/rules/code-standards.md) — padrões de codificação (TypeScript).
- [`.cursor/rules/database.md`](.cursor/rules/database.md) — workflow de banco (Supabase/Postgres): validar queries via MCP/CLI, `EXPLAIN ANALYZE`, índices por cláusula `WHERE` e uso do banco como sensor de feedback.
- [`.cursor/rules/tests.md`](.cursor/rules/tests.md) — testes automatizados com Jest (unidade + integração), AAA/GWT, testes independentes e mocks para dependências externas; sem E2E por hora.
- [`.cursor/rules/logs.md`](.cursor/rules/logs.md) — gravar a saída de todo processo em `logs/`, ler o log em qualquer problema e usá-lo como sensor de feedback.

Leia-as antes de implementar qualquer task. Versões `.mdc` equivalentes existem
na mesma pasta para clientes que exigem essa extensão (ex.: Cursor).

## Skills (obrigatório)

Ao implementar o app (Expo/React Native + Supabase), **use** as skills abaixo,
disponíveis em `.agents/skills/`:

**React Native / Expo**

- [`.agents/skills/building-native-ui/SKILL.md`](.agents/skills/building-native-ui/SKILL.md) — construir UI com Expo Router: navegação, tabs nativas, estilização, componentes, animações e padrões de tela.
- [`.agents/skills/vercel-react-native-skills/SKILL.md`](.agents/skills/vercel-react-native-skills/SKILL.md) — boas práticas de performance em RN: listas, animações, estado, imagens e navegação nativa.

**Supabase / Postgres**

- [`.agents/skills/supabase/SKILL.md`](.agents/skills/supabase/SKILL.md) — Database, Auth, RLS, migrations, CLI/MCP e integrações `supabase-js`.
- [`.agents/skills/supabase-postgres-best-practices/SKILL.md`](.agents/skills/supabase-postgres-best-practices/SKILL.md) — performance e boas práticas de Postgres: schema, índices e queries.

Leia a skill relevante **antes** de codar a área correspondente (UI de tela →
building-native-ui; performance RN → vercel-react-native-skills; schema/RLS/query
→ skills de Supabase).

## Visão geral

O **Mais Jiu** é um aplicativo de retenção e estudo para Jiu-Jitsu, posicionado como
ferramenta de **estudo ativo** (preview antes da aula + revisão depois da aula), com
conteúdo da "Semana Atual" publicado no início da semana e reativação manual via
WhatsApp pelo professor (operação concierge).

O repositório tem duas partes:

1. **`prototipo/`** — protótipo high-fidelity estático (HTML/CSS/JS vanilla) que
   é a **fonte de verdade visual** do app Expo (ADR-007); também referência de
   seed do piloto. Servido como site estático.
2. **App real (a ser implementado)** — cliente mobile em **React Native + Expo**
   (TypeScript) sobre **Supabase** (BaaS). Não há backend próprio em Go; o stack é
   **TypeScript-only** (cliente Expo + SQL/políticas no Supabase).

- **Tipo de projeto:** app mobile (RN/Expo) + protótipo estático de referência
- **Stack do app:** TypeScript · React Native + Expo (Expo Router) · `supabase-js`
- **Backend/dados:** Supabase gerenciado — Postgres + Auth + PostgREST + Storage,
  com segurança por **RLS** (sem API custom)
- **Protótipo:** HTML5, CSS3, JavaScript (vanilla), sem dependências

## Arquitetura e decisões técnicas

Toda a especificação técnica vive em
[`.compozy/tasks/bjj-retention-app/`](`.compozy/tasks/bjj-retention-app/`):

- [`_prd.md`](.compozy/tasks/bjj-retention-app/_prd.md) — requisitos de produto (MVP).
- [`_techspec.md`](.compozy/tasks/bjj-retention-app/_techspec.md) — arquitetura, schema
  relacional, interfaces TypeScript (`Week`, `VideoWithTags`, `Tag`,
  `ContentRepository`), endpoints PostgREST, testes e sequenciamento de build.
- [`_tasks.md`](.compozy/tasks/bjj-retention-app/_tasks.md) — breakdown de tasks.
- [`adrs/`](.compozy/tasks/bjj-retention-app/adrs/) — Architecture Decision Records.

**Resumo das ADRs (leia antes de tocar na área correspondente):**

- [ADR-001](.compozy/tasks/bjj-retention-app/adrs/adr-001.md) — **Concierge Enxuto**:
  exatamente as telas previstas, view-tracking invisível e reativação manual por
  WhatsApp. Sem painel admin; conteúdo/contas entram via SQL.
- [ADR-002](.compozy/tasks/bjj-retention-app/adrs/adr-002.md) — **Estudo ativo**:
  conteúdo publicado no início da semana (preview + revisão sobre o mesmo conteúdo).
- [ADR-003](.compozy/tasks/bjj-retention-app/adrs/adr-003.md) — **Cliente React
  Native + Expo** (TypeScript, base única iOS/Android, Expo Router, deep link do
  WhatsApp). Rejeitados PWA, Flutter, nativo separado.
- [ADR-004](.compozy/tasks/bjj-retention-app/adrs/adr-004.md) — **Supabase como
  BaaS, sem backend Go** (desvio explícito da convenção Go do template; stack
  TypeScript-only). Rejeitados Go+Postgres, Firebase.
- [ADR-005](.compozy/tasks/bjj-retention-app/adrs/adr-005.md) — **Supabase Auth
  (e-mail+senha) + RLS**, signup desativado, contas pré-criadas, senhas hasheadas
  pelo Auth (nunca em texto). Isolamento por aluno no nível do banco.
- [ADR-006](.compozy/tasks/bjj-retention-app/adrs/adr-006.md) — **Metadados de
  técnica por vídeo**: `from_position` (texto), `to_positions` (text[], um ou
  muitos), `steps` (text[], ordenado), exibidos na legenda expansível do player
  ("De → Para" + passo a passo; colapsada mostra 2 passos + "Ver mais"). Campos
  opcionais; posições são texto livre no MVP (tabela `positions` fica p/ Fase 3).
- [ADR-007](.compozy/tasks/bjj-retention-app/adrs/adr-007.md) — **Protótipo como
  fonte de verdade visual**: `prototipo/` + `prototipo/design.md` são o design
  source of truth do app Expo; as 4 telas devem reproduzir tokens, componentes,
  interações e anti-padrões definidos lá (accent pink só na seta "De → Para",
  peso máx. 600, bordas em vez de sombras, barra de progresso branca, etc.).
  Desvios exigem justificativa.

## Modelo de dados (Postgres/Supabase)

Definido em [`_techspec.md`](.compozy/tasks/bjj-retention-app/_techspec.md) §Data
Models. Tabelas: `profiles`, `weeks`, `videos` (com `from_position`,
`to_positions text[]`, `steps text[]`), `tags`, `video_tags`, `video_views` (log
de eventos de visualização — base da métrica de sucesso).

- **View event:** registrado quando o playhead atinge **50%** da duração, **uma vez
  por playback** (não em card open nem em scrub manual). `user_id` vem do JWT via
  RLS `with check (user_id = auth.uid())`.
- **Busca por tag:** case- e acento-insensível via extensão `unaccent` envolvida em
  função `IMMUTABLE` `f_unaccent(text)`, com índice funcional
  `lower(f_unaccent(nome_tag))`.
- **Métricas (SQL, admin):** primária = média de vídeos **distintos** por aluno por
  semana; secundária = total de views (re-watch incluído), distribuição, recorrência,
  uso da busca e split pré/pós-aula por heurística de weekday (Seg/Ter = pré-aula).

## Supabase (piloto)

O projeto Supabase **já existe** — schema, RLS, seed e SQL de métricas são aplicados
a esta instância (não é criação greenfield):

| Item | Valor |
|------|-------|
| `project_ref` | `snjaaejvwlkgmyvgrmro` |
| MCP URL | `https://mcp.supabase.com/mcp?project_ref=snjaaejvwlkgmyvgrmro` |

- Setup MCP/OAuth em [`mcp-supabase-setup.md`](mcp-supabase-setup.md) (raiz do repo).
  Prefira Supabase MCP (`execute_sql`, advisors) quando disponível.
- O app Expo usa a URL pública + anon key via env (`.env`/EAS secrets). **Nunca**
  commite chaves de serviço.
- Admin concierge (inserção de conteúdo, contas, métricas) usa a **service role**
  fora do app, via editor SQL do Supabase.
- **Testes de integração nunca rodam contra o piloto** — use `supabase start`
  (CLI + Docker, reset por run via `supabase db reset`) ou um projeto cloud de teste
  dedicado como fallback.

## Telas do app (4 telas, 2-tab bottom nav)

- **Login** — Supabase Auth e-mail+senha (signup/recuperação desativados).
- **Início (tab)** — Dashboard "Semana Atual": saudação de `profiles`, bloco da
  semana corrente (`current_date between data_inicio and data_fim`) e carrossel
  horizontal de cards verticais ordenados por `ordem`.
- **Buscar (tab)** — Biblioteca: chips de tags (`listTags`) + busca livre
  (case/acentuação insensível) → feed vertical via junction `video_tags`/`tags`.
- **Player** — Player vertical imersivo (`expo-video`, sem black bars), título,
  tags clicáveis e legenda expansível com "De → Para" (um ou vários destinos) +
  passos numerados. Insere em `video_views` aos 50% do playhead.
- **Deep link WhatsApp** (`scheme://semana-atual` ou `scheme://video/:id`): quando
  não autenticado (incl. cold start), guarda o destino, mostra login e retoma após
  autenticar.

## Estrutura do repositório

```
.
├── AGENTS.md
├── mcp-supabase-setup.md      # Setup MCP/OAuth do Supabase
├── prototipo/                 # Protótipo high-fidelity estático (referência de design/seed)
│   ├── index.html             # Launcher
│   ├── login.html             # Tela de login
│   ├── home.html              # Dashboard "O Agora"
│   ├── player.html            # Player vertical + seed de técnica (De → Para + passos)
│   ├── search.html            # Biblioteca / busca
│   ├── css/app.css            # Estilos globais
│   └── js/                    # (vazio — JS inline nas páginas)
├── .compozy/tasks/bjj-retention-app/
│   ├── _prd.md                # PRD
│   ├── _techspec.md           # TechSpec (arquitetura, schema, interfaces, testes)
│   ├── _tasks.md              # Breakdown de tasks
│   ├── adrs/                  # ADR-001..006
│   └── task_NN.md             # Tasks individuais
├── .cursor/rules/             # Padrões obrigatórios (code, database, tests, logs)
├── .agents/skills/            # Skills de RN/Expo e Supabase/Postgres
└── logs/                      # Saída de processos (sensor de feedback)
```

## Como rodar

### Protótipo estático (`prototipo/`)

Serve a pasta com qualquer servidor local na porta `8080` (padrão sugerido):

```bash
# Python
python3 -m http.server 8080 -d prototipo
# ou Node
npx serve prototipo -p 8080
# ou PHP
php -S localhost:8080 -t prototipo
```

Acesse: http://localhost:8080 (launcher) ou diretamente `/login.html`,
`/home.html`, `/player.html`, `/search.html`.

### App Expo (RN/Expo, TypeScript)

> O app ainda não foi scaffoldado. Após o scaffold (task_04), os comandos abaixo
> passam a valer. Siga o sequenciamento de build em
> [`_techspec.md`](.compozy/tasks/bjj-retention-app/_techspec.md) §Development
> Sequencing.

Variáveis de ambiente do Supabase (URL + anon key) via `.env`/EAS secrets;
**nunca** commite service-role.

```bash
# Instalar dependências (apenas após scaffold; não rode sem necessidade)
bun install

# Servidor de desenvolvimento (Android-first — abra um emulator antes)
bunx expo start         # ou: npx expo start
# Pressione 'a' para abrir no Android emulator, 'i' para iOS

# Build de desenvolvimento (EAS — requer login no Expo)
bunx eas build --profile development --platform android

# Build interno de piloto (APK distribuível via WhatsApp)
bunx eas build --profile preview --platform android

# Lint e typecheck (rodar antes de commitar)
bun run lint
bun run typecheck       # ou: bunx tsc --noEmit

# Testes
bun test                # Jest + React Native Testing Library (unitários)
bun run test:integration # Jest + Supabase local (requer `supabase start` + Docker)
```

**Supabase local (para testes de integração RLS):**

```bash
# Pré-requisito: Docker rodando + Supabase CLI instalada
supabase start          # sobe Postgres + Auth + PostgREST em containers
supabase db reset       # reset por run (reaplica migrations + seed.sql)
supabase stop           # ao terminar
```

### Stack de testes (conforme TechSpec §Testing Approach)

- **Unitários:** Jest + React Native Testing Library sobre lógica crítica
  (`recordView`, `searchVideosByTag`, `listTags`, seleção de semana, navegação de
  tags), com `supabase-js` mockado no boundary do `ContentRepository`.
- **Integração (data/RLS):** Jest + Supabase local (`supabase start`, CLI+Docker),
  seed via `supabase/seed.sql`, reset por run. Fallback: projeto cloud de teste
  dedicado. **Nunca o piloto `snjaaejvwlkgmyvgrmro`.**
- **E2E (UI):** diferido para a Fase 2; o fluxo completo é coberto por smoke manual
  no piloto.

## Portas

- **Padrão sugerida:** `8080` (protótipo estático)
- Qualquer porta livre pode ser usada ao subir o servidor local.

## Notas para agentes

- **Fonte da verdade técnica:** [`_techspec.md`](.compozy/tasks/bjj-retention-app/_techspec.md)
  e os [ADRs](.compozy/tasks/bjj-retention-app/adrs/) — consulte antes de decidir
  arquitetura, schema, auth ou UX do player. Não contradiga um ADR sem justificar.
- **Fonte da verdade visual:** [`prototipo/`](prototipo) + [`prototipo/design.md`](prototipo/design.md)
  (ADR-007). As 4 telas do app Expo devem reproduzir tokens, componentes,
  interações e anti-padrões definidos lá. Cada tela tem um HTML de referência
  **que é a própria tela** a reproduzir:
  - Login → [`prototipo/login.html`](prototipo/login.html)
  - Início (Dashboard "Semana Atual") → [`prototipo/home.html`](prototipo/home.html)
  - Buscar (Biblioteca) → [`prototipo/search.html`](prototipo/search.html)
  - Player (imersivo) → [`prototipo/player.html`](prototipo/player.html)

  Leia `design.md` **antes** de codar qualquer tela (UI → skill
  `building-native-ui`). Desvios exigem justificativa.
- Siga sempre [`.cursor/rules/code-standards.md`](.cursor/rules/code-standards.md),
  [`.cursor/rules/database.md`](.cursor/rules/database.md),
  [`.cursor/rules/tests.md`](.cursor/rules/tests.md) e
  [`.cursor/rules/logs.md`](.cursor/rules/logs.md).
- Stack **TypeScript-only** (ADR-004): não introduza backend Go nem API custom;
  dados/segurança via `supabase-js` + RLS.
- Auth (ADR-005): signup/recuperação desativados; contas pré-criadas via admin;
  senhas nunca em texto.
- Player (ADR-006): `expo-video` para `.mp4`/HLS; URL genérica em `url_video`
  (sem upload in-app). "De → Para" + passos na legenda expansível; campos opcionais.
- View event: dispara aos 50% do playhead, uma vez por playback (não em card open
  nem scrub).
- Não execute `npm install` ou adicione `package.json` sem necessidade.
- No protótipo, o JS está inline nas páginas HTML e os estilos em
  `prototipo/css/app.css`.
- Métricas e conteúdo são operados em modo concierge via editor SQL do Supabase
  (service role, fora do app).
