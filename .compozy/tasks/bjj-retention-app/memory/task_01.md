# Task Memory: task_01.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

Provisionar o schema relacional do MVP no Supabase piloto: tabelas `profiles`, `weeks`, `videos`, `tags`, `video_tags`, `video_views`; extensão `unaccent`; função `IMMUTABLE` `f_unaccent`; índices funcionais e de FK. Incluir testes unitários e de integração.

## Important Decisions

- Instalação de dependências de teste feita com **bun** (conforme AGENTS.md), não npm.
- Coverage medido sobre helper de parsing do SQL (`tests/helpers/migration.js`), não sobre o arquivo `.sql` — Jest não instrumenta SQL nativamente.
- Aplicação no projeto piloto (`snjaaejvwlkgmyvgrmro`) não foi executada automaticamente porque não há `SUPABASE_ACCESS_TOKEN` disponível no ambiente; deixei script `scripts/apply-schema-to-pilot.sh` e instruções atualizadas em `mcp-supabase-setup.md`.

## Learnings

- `information_schema.constraint_column_usage` deve ser ligado a `pg_constraint.unique_constraint_name` (ou usar `pg_constraint` diretamente) para mapear FK → tabela/coluna referenciada.
- Supabase CLI `2.109.0` pode ser executado via `bunx`; o login em ambiente non-TTY exige `SUPABASE_ACCESS_TOKEN`.

## Files / Surfaces

- `supabase/migrations/20250703000000_initial_schema.sql` — DDL do schema MVP.
- `supabase/config.toml` — config do CLI vinculado ao projeto piloto.
- `supabase/verify_schema.sql` — checklist de verificação no SQL editor.
- `package.json` / `bun.lock` / `jest.config.js` — harness de testes.
- `tests/helpers/migration.js` — parser helper para testes unitários.
- `tests/unit/migration.schema.test.js` — testes unitários do SQL.
- `tests/integration/schema.apply.test.js` — testes de integração contra Supabase local.
- `scripts/apply-schema-to-pilot.sh` — script de aplicação no piloto (requer token).
- `mcp-supabase-setup.md` — atualizado com passo de aplicação do schema.
- `.gitignore` — adicionados `node_modules/`, lockfiles, `coverage/`, `.env`, `supabase/.temp/`.

## Errors / Corrections

- Inicialmente usei `npm install`; corrigido para `bun install` após feedback do usuário.
- Teste de FK falhou porque query usava `constraint_column_usage.constraint_name = tc.constraint_name`; corrigido para usar `pg_constraint` diretamente.

## Ready for Next Run

- Schema está validado localmente; próximo passo pendente é aplicar no projeto piloto com token MCP/CLI e rodar `supabase/verify_schema.sql`.
