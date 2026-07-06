: Task Memory: task_05.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

Implementar tokens de design (`theme/`) e componentes base (`Button`, `Input`, `Field`, `Tag`, `Snackbar`, `IconButton`, `StateView`, `Caption`) fielmente ao protótipo high-fidelity, com testes unitários e de integração e cobertura >=80%.

## Important Decisions

- Componentes e tema foram criados em `app/src/` porque o scaffold Expo (task_04) colocou o app no diretório `app/`. O path alias `@/` aponta para `./*`, então imports como `@/src/theme/colors` funcionam.
- `react-native-svg@15.15.4` foi instalado via `bunx expo install react-native-svg` para permitir mapear os SVGs inline do protótipo para componentes RN em `app/src/components/icons/`.
- `app/jest.config.js` foi atualizado para incluir `src/**/*.{ts,tsx}` no `collectCoverageFrom` e excluir `src/**/index.ts` (re-exports puros), garantindo que os novos módulos entrem na métrica de cobertura.

## Learnings

- `Pressable` com `style` como função não funciona quando renderizado como `View` (caso do `Tag` sem `onPress`). Foi necessário separar os caminhos: `View` recebe array/objeto de estilos; `Pressable` recebe a função com estado `pressed`.
- Animated.Value em `useRef` + acesso `.current` no corpo/JSX dispara a regra `react-hooks/refs` do ESLint do Expo. A solução foi usar `useState(() => new Animated.Value(...))` para os valores animados e manter `useRef` apenas para timers dentro de `useEffect`.

## Files / Surfaces

- `app/src/theme/colors.ts`, `spacing.ts`, `typography.ts`, `motion.ts`, `index.ts`
- `app/src/components/Button.tsx`, `Input.tsx`, `Field.tsx`, `Tag.tsx`, `Snackbar.tsx`, `IconButton.tsx`, `StateView.tsx`, `Caption.tsx`, `index.ts`
- `app/src/components/icons/BackIcon.tsx`, `HomeIcon.tsx`, `PauseIcon.tsx`, `PlayIcon.tsx`, `SearchIcon.tsx`, `index.ts`
- `app/__tests__/unit/theme/colors.test.ts`
- `app/__tests__/unit/components/{Button,Input,Tag,Snackbar,IconButton,StateView,Caption}.test.tsx`
- `app/__tests__/unit/components/icons/Icons.test.tsx`
- `app/__tests__/integration/components/{LoginForm,StateView.integration}.test.tsx`
- `app/jest.config.js` (collectCoverageFrom ajustado)
- `app/package.json` / `app/bun.lock` (`react-native-svg` adicionado)

## Errors / Corrections

- TypeScript: `accessibilityState={{ disabled }}` rejeitou `boolean | null` vindo de `PressableProps`. Corrigido para `accessibilityState={{ disabled: !!disabled }}`.
- TypeScript: `TextInput` não aceita `accessibilityState.invalid`. Removido.
- Teste `Tag` default: `chip.props.style` retornou `[Function style]` porque `View` não avalia função de estilo. Refatorado `Tag.tsx` para separar `View` (estilo objeto) e `Pressable` (função).
- Teste `Caption`: `textTransform: 'uppercase'` é estilo, não transformação de texto real na árvore. Corrigido teste para buscar texto original e validar o estilo.
- ESLint: acesso a `ref.current` durante render no `Snackbar`. Refatorado para `useState` nos `Animated.Value`.

## Ready for Next Run

- task_06 pode usar os componentes de formulário (`Field`, `Input`, `Button`) e tema para implementar `LoginScreen`.
- task_07 pode usar `Tag`, `Caption`, `IconButton` e tokens para `WeekCard`, `VideoCard`, `Carousel`.
- task_08 pode usar ícones de player (`PlayIcon`, `PauseIcon`, `BackIcon`) e padrões de `Tag`.
