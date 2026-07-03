# Task Memory: task_06.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

- Integrar app ao Supabase (cliente + SecureStore), ContentRepository, LoginScreen e auth gate. Entregar testes (unit + integração, >=80%).

## Important Decisions

- Código de produção já existente no worktree (cliente, repository, login, auth gate, .env.example). Foco desta run: cobrir com testes exigidos e reconciliar testes de scaffold quebrados pelo auth gate.
- Repository é testado passando um mock de `SupabaseClient` pelo construtor (`new SupabaseContentRepository(mock)`), sem tocar no mock global do módulo.
- Teste "anon key only" é uma verificação estática do fonte de `src/lib/supabase.ts` (sem referência a service role).

## Learnings

- `jest.setup.js` mocka `@/src/lib/supabase` globalmente (getSession null, onAuthStateChange, signInWithPassword ok). Testes de auth sobrescrevem via `jest.mocked(...)` por teste.

## Files / Surfaces

## Errors / Corrections

## Ready for Next Run
