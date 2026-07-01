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

Este repositório contém o protótipo high-fidelity do app **Mais Jiu**, um aplicativo de retenção e estudo para Jiu-Jitsu. O protótipo é composto por páginas estáticas em HTML, CSS e JavaScript puro, localizadas no diretório `prototipo/`.

- **Tipo de projeto:** site/protótipo estático
- **Stack:** HTML5, CSS3, JavaScript (vanilla)
- **Frameworks/bibliotecas:** nenhum
- **Gerenciador de pacotes:** não aplicável

## Estrutura

```
prototipo/
├── index.html      # Launcher com links para todas as telas
├── login.html      # Tela de login
├── home.html       # Dashboard "O Agora"
├── player.html     # Player vertical imersivo
├── search.html     # Biblioteca / busca
├── css/
│   └── app.css     # Estilos globais
└── js/             # (vazio — JS está inline nas páginas)
```

## Dependências

Não há dependências externas. O protótipo roda diretamente no navegador.

## Como rodar o projeto

Como o projeto é estático, basta servir a pasta `prototipo/` com qualquer servidor local.

### Opção 1 — Python (built-in)

```bash
cd prototipo
python3 -m http.server 8080
```

Acesse: http://localhost:8080

### Opção 2 — Node.js (npx serve)

```bash
npx serve prototipo -p 8080
```

Acesse: http://localhost:8080

### Opção 3 — PHP (built-in)

```bash
cd prototipo
php -S localhost:8080
```

Acesse: http://localhost:8080

## Portas

- **Padrão sugerida:** `8080`
- Qualquer porta livre pode ser usada ao subir o servidor local.

## Telas disponíveis

Após iniciar o servidor, as telas podem ser acessadas pelo launcher (`/`) ou diretamente:

- `/login.html` — Autenticação
- `/home.html` — Dashboard da semana
- `/player.html` — Player de vídeo
- `/search.html` — Biblioteca e busca

## Notas para agentes

- Siga sempre [`.cursor/rules/code-standards.md`](.cursor/rules/code-standards.md), [`.cursor/rules/database.md`](.cursor/rules/database.md), [`.cursor/rules/tests.md`](.cursor/rules/tests.md) e [`.cursor/rules/logs.md`](.cursor/rules/logs.md).
- Não execute `npm install` ou adicione `package.json` sem necessidade.
- O JavaScript está inline nas páginas HTML.
- Estilos centralizados em `prototipo/css/app.css`.
