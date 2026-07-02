# MVP: App de Retenção e Estudo para Jiu-Jitsu — Task List

## Tasks

| # | Title | Status | Complexity | Dependencies |
|---|-------|--------|------------|--------------|
| 01 | Provisionar Supabase — schema relacional, extensões e índices | pending | high | — |
| 02 | Políticas RLS e configuração Supabase Auth | pending | medium | task_01 |
| 03 | Seed concierge e scripts SQL de métricas | pending | medium | task_02 |
| 04 | Scaffold Expo com Expo Router e shell de navegação | pending | medium | — |
| 05 | Design system e componentes base de UI | pending | medium | task_04 |
| 06 | Cliente Supabase, ContentRepository e tela de login | pending | medium | task_02, task_05 |
| 07 | Dashboard "Semana Atual" com carrossel horizontal | pending | medium | task_03, task_06 |
| 08 | Player vertical imersivo com decomposição "De → Para" | pending | high | task_07 |
| 09 | Registro de visualizações aos 50% do playhead | pending | medium | task_02, task_08 |
| 10 | Biblioteca e busca por tags com chips | pending | medium | task_06, task_08 |
| 11 | Deep linking WhatsApp com destino preservado no login | pending | medium | task_06, task_07 |

## Contexto

Projeto **greenfield** no app mobile: sem Expo, migrations ou `package.json` no repositório. O protótipo HTML/CSS em `prototipo/` é a **fonte de verdade visual** do app Expo (ADR-007) — cada tela tem um HTML de referência que é a própria tela a reproduzir (`login.html`, `home.html`, `player.html`, `search.html`), além de referência de seed. Tipos de task: defaults do Compozy (`frontend`, `infra`, etc.) — sem `.compozy/config.toml` customizado.

Testes unitários (Jest + React Native Testing Library) ficam **embutidos em cada task**, conforme TechSpec — sem task dedicada só a testes.

### Supabase (projeto e MCP)

O projeto Supabase **já foi criado**. Setup do MCP e `project_ref` estão documentados em [`mcp-supabase-setup.md`](../../../mcp-supabase-setup.md) (raiz do repositório).

| Item | Valor |
|------|-------|
| `project_ref` | `snjaaejvwlkgmyvgrmro` |
| MCP URL | `https://mcp.supabase.com/mcp?project_ref=snjaaejvwlkgmyvgrmro` |
| Autenticação MCP | Ver `mcp-supabase-setup.md` (OpenCode: `opencode mcp auth supabase`) |

Tasks **01–03** e **06** devem usar esse projeto; preferir MCP Supabase (`execute_sql`, advisors) quando disponível no agente.

## Descrições

### 01 — Provisionar Supabase — schema relacional, extensões e índices

Aplica o schema no projeto existente (`project_ref` em [`mcp-supabase-setup.md`](../../../mcp-supabase-setup.md)): `profiles`, `weeks`, `videos`, `tags`, `video_tags`, `video_views` (incl. `from_position`, `to_positions`, `steps`). Habilita extensão `unaccent` e índices conforme TechSpec. **ADR-004, ADR-006.**

### 02 — Políticas RLS e configuração Supabase Auth

Define políticas RLS (leitura de conteúdo; insert/read de `video_views` apenas do próprio usuário). Desabilita signup/recovery. **ADR-005.**

### 03 — Seed concierge e scripts SQL de métricas

Insere semana piloto, 8 vídeos com metadados técnicos e tags do protótipo; provisiona contas de teste. Documenta queries SQL para métricas primária (distintos), secundária (total), distribuição, recorrência e split pré/pós-aula (seg/ter). **ADR-001, ADR-006.**

### 04 — Scaffold Expo com Expo Router e shell de navegação

Inicializa app Expo (TypeScript, Android-first). Configura Expo Router: Login → Tabs (Início/Buscar) → Player imersivo sem tab bar. **ADR-003.**

### 05 — Design system e componentes base de UI

Implementa tokens de `prototipo/design.md` (`theme/`) e componentes: Button, Input, Field, Tag, Snackbar, IconButton, StateView, Caption. Respeita constraints (accent pink limitado, peso máx. 600, bordas vs sombras). Componentes extraídos dos HTMLs de referência (login/home/player/search). **ADR-007.**

### 06 — Cliente Supabase, ContentRepository e tela de login

Integra `supabase-js` com sessão persistente (~1 mês via SecureStore). Implementa contrato `ContentRepository` e LoginScreen com estados de erro/credenciais inválidas. LoginScreen reproduz `prototipo/login.html`. **ADR-004, ADR-005, ADR-007.**

### 07 — Dashboard "Semana Atual" com carrossel horizontal

HomeScreen: saudação do perfil, WeekCard, carrossel de VideoCards 9:16 com edge-fade e peek do 3º card, chips exploratórios de tags. Estados: sem semana, skeleton, offline, erro. Reproduz `prototipo/home.html`. **ADR-002, ADR-007.**

### 08 — Player vertical imersivo com decomposição "De → Para"

PlayerScreen com `expo-video`, scrims, legenda expansível (2 passos colapsados + "Ver mais"), decomposição posicional (múltiplos destinos), tags clicáveis → busca. Metadados opcionais ausentes exibem só título/tags. Reproduz `prototipo/player.html`. **ADR-006, ADR-007.**

### 09 — Registro de visualizações aos 50% do playhead

Dispara `recordView` uma vez por sessão de reprodução quando playhead ≥ 50%. Não conta abrir card nem scrub manual. Insert em `video_views` via RLS. **ADR-001.**

### 10 — Biblioteca e busca por tags com chips

SearchScreen: input pill, chips de `listTags`, filtro normalizado (case/accent-insensitive via `unaccent`), feed vertical com FeedItem, empty state, navegação para player. Reproduz `prototipo/search.html`. **ADR-007.**

### 11 — Deep linking WhatsApp com destino preservado no login

Rotas `scheme://semana-atual` e `scheme://video/:id`. Em cold start ou sessão expirada, guarda destino, exibe login e navega ao destino original após autenticar.

## Cadeia de dependências

```
01 Schema
 └─► 02 RLS/Auth
      └─► 03 Seed ──────────────┐
                                ▼
04 Expo scaffold                07 Dashboard ◄── 06 Auth/Repository ◄── 05 Design system ◄── 04
 └─► 05 ──► 06 ────────────────┘         │
                                           ▼
                                        08 Player
                                           │
                     ┌─────────────────────┼─────────────────────┐
                     ▼                     ▼                     ▼
                  09 Views              10 Tag search         11 Deep links
```

**Paralelismo possível:** tasks 01–03 (infra Supabase) em paralelo com 04–05 (scaffold + UI).

## Notas de decomposição

- **Task 03** inclui scripts SQL de métricas (item 10 do Build Order do TechSpec), pois é operação concierge out-of-app.
- **Task 05** separada de **04** para evitar mega-task (>7 arquivos: theme + ~8 componentes + scaffold).
- **Task 09** separada de **08** porque a lógica de 50% tem regras de negócio e testes próprios, mas depende do player funcional.
