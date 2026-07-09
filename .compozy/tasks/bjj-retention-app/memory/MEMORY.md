# Workflow Memory

Keep only durable, cross-task context here. Do not duplicate facts that are obvious from the repository, PRD documents, or git history.

## Current State

- task_01: schema local validado (18 testes). Aplicação no projeto piloto Supabase (`snjaaejvwlkgmyvgrmro`) depende de token MCP/CLI, não disponível no ambiente automatizado.
- task_02: RLS e Auth configurados localmente; migration, testes unitários/integração e documentação de dashboard prontos.
- task_03: seed concierge e métricas implementados; validados localmente via `supabase db reset` e testes (49/49 pass, 96.29% coverage). Aplicação no piloto cloud ainda requer acesso service-role.
- task_04: scaffold Expo com Expo Router e shell de navegação concluído.
- task_05: design system (`app/src/theme/`) e componentes base (`app/src/components/`) implementados; 55 testes passando, cobertura 97.77% stmts / 90.24% branches.
- task_06: cliente Supabase, `ContentRepository` e LoginScreen implementados (dependência do dashboard).
- task_07: HomeScreen "Semana Atual" (AppHeader, WeekCard, Carousel c/ edge-fade, chips de tag, estados loading/empty/error) implementada; 107 testes, 96.62% stmts / 89.1% branches.
- task_08: PlayerScreen imersivo (`app/app/player/[id].tsx`) com expo-video, ReelsStage/Caption/Progress/Tag, estados loading/erro/retry, tag→busca; 140 testes, cobertura global 97% stmts / 88% branches.
- task_11: Deep links WhatsApp (`maisjiu://semana-atual`, `maisjiu://video/<id>`, `maisjiu://buscar?tag=`) com destino preservado através do login; configuração de scheme/intent filters, parser, store SecureStore, testes unitários/integração e docs de concierge implementados.

## Shared Decisions

- Testes de integração que rodam `supabase db reset` devem usar `--runInBand` (ou equivalente) para evitar conflito de remoção de container Docker quando múltiplas suítes executam em paralelo.
- `supabase/seed.sql` é aplicado automaticamente por `supabase db reset`. Qualquer teste de integração que insira tags ou vídeos com valores fixos deve usar nomes únicos ou limpar após si, para evitar conflitos de UNIQUE/PK com o seed.
- O código-fonte do app Expo fica no diretório `app/` (não na raiz). Componentes reutilizáveis, tema e ícones devem ficar em `app/src/` para aproveitar o path alias `@/` do `tsconfig.json`.
- `react-native-svg` foi adicionado em `app/package.json` para mapear os ícones inline do protótipo para componentes RN.
- `app/jest.config.js` coleta cobertura de `app/**/*.{ts,tsx}` e `src/**/*.{ts,tsx}`, excluindo arquivos `index.ts` de re-exportação pura.
- Sem `expo-linear-gradient`/`expo-blur` instalados: usar `react-native-svg` (presente) para gradientes/edge-fade nas telas.
- Testes de tela que usam `SafeAreaView` devem envolver o render com `<SafeAreaProvider initialMetrics={...}>` (jest não mede layout, senão os filhos não renderizam).
- O mock global de `@/src/lib/supabase` em `app/jest.setup.js` inclui um `from` encadeável/thenable (resolve `{data:null}`), permitindo montar telas com o repositório real em testes de router (navigation/tabs).

## Shared Learnings

- Componentes `Pressable` com `style` como função não devem ser usados como `View` estático: o React Native não avalia a função para `View`, então o estilo permanece como `[Function]`. Separar o caminho interativo (`Pressable` + função) do estático (`View` + array/objeto) evita surpresas de cobertura e renderização.
- Animated.Values armazenadas em `useRef` e acessadas via `.current` no corpo do componente/JSX disparam a regra `react-hooks/refs` do ESLint do Expo. Usar `useState(() => new Animated.Value(...))` para os valores animados e `useRef` apenas dentro de `useEffect` (timers) resolve o lint sem perder a estabilidade entre renders.
- Navegação programática com rotas dinâmicas no Expo Router (typed routes habilitado) exige type assertion para `Href` quando o `pathname` é construído em tempo de execução, ex.: `{ pathname: route.pathname, params: route.params } as Href`.
- `renderRouter(..., { initialUrl: '/(tabs)' }).getPathname()` reporta o índice das tabs como `/`, não como `/(tabs)`. Em testes de roteamento, verificar conteúdo da tela é mais confiável do que comparar pathname literais para a home.
- Em testes de integração que precisam de round-trip no `expo-secure-store` (salvar → ler → deletar), usar um `Map` em memória com implementações customizadas de `getItemAsync`/`setItemAsync`/`deleteItemAsync` mantém os testes determinísticos e independentes.

## Open Risks

- Aplicação manual no piloto ainda é necessária antes de task_03 (seed). RLS (task_02) só pode ser aplicado no piloto após o schema da task_01.
- `supabase db advisors` reporta dois WARN herdados da task_01 (`f_unaccent` com `search_path` mutável e extensão `unaccent` no schema `public`). Não são críticos para RLS, mas devem ser revisados antes do piloto.
- Aplicação do seed e provisionamento de contas no projeto piloto (`snjaaejvwlkgmyvgrmro`) dependem de acesso service-role (SQL editor ou CLI linkado), não disponível no ambiente automatizado.

## Handoffs
