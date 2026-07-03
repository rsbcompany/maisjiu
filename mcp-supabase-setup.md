# Configurar MCP do Supabase no OpenCode

## 1. Configure MCP

Configure seu cliente MCP.

### Detalhes

Adicione esta configuração ao arquivo `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "supabase": {
      "type": "remote",
      "url": "https://mcp.supabase.com/mcp?project_ref=snjaaejvwlkgmyvgrmro",
      "enabled": true
    }
  }
}
```

Depois de adicionar a configuração, execute o seguinte comando para autenticar:

```bash
opencode mcp auth supabase
```

Isso abrirá seu navegador para completar o fluxo de autenticação OAuth.

## 2. Aplicar schema no projeto piloto

Com o MCP autenticado, execute `supabase/verify_schema.sql` via SQL editor do
Supabase (ou `execute_sql` do MCP) para confirmar que o schema da task_01 foi
aplicado corretamente.

Alternativa via Supabase CLI (requer token de acesso):

```bash
bunx supabase login
./scripts/apply-schema-to-pilot.sh
```

> Precisa de ajuda? Veja a [documentação do OpenCode](https://opencode.ai).

