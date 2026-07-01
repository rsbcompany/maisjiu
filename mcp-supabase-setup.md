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

> Precisa de ajuda? Veja a [documentação do OpenCode](https://opencode.ai).

