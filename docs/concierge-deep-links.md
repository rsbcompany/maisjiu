# Links de reativação via WhatsApp (concierge)

O app **Mais Jiu** registra o esquema de deep link `maisjiu://`. Quando o aluno toca
em um link com esse esquema no WhatsApp, o app abre diretamente na tela indicada.
Se o aluno não estiver logado (ou o app estiver fechado), o destino é guardado e
recuperado automaticamente após o login.

## Como usar

Copie um dos exemplos abaixo e cole na mensagem do WhatsApp. Substitua `<id>`
pelo UUID do vídeo no Supabase.

### Abrir a Semana Atual

```text
Semana nova no ar! Estude antes da aula:
maisjiu://semana-atual
```

### Abrir um vídeo específico

```text
Revisa essa passagem para a aula de amanhã:
maisjiu://video/<id>
```

Exemplo com UUID fictício:

```text
maisjiu://video/550e8400-e29b-41d4-a716-446655440000
```

### Abrir a busca já filtrada por uma tag

```text
Veja todas as passagens do acervo:
maisjiu://buscar?tag=Passagem
```

## Comportamento esperado

| Estado do aluno | Resultado |
|-----------------|-----------|
| Logado e app aberto | Vai direto ao destino. |
| Logado, app fechado (cold start) | Vai direto ao destino após o splash. |
| Deslogado | Abre a tela de login; após entrar, segue ao destino original. |
| Link inválido | Ignorado silenciosamente (não quebra o app). |

## Onde encontrar os IDs dos vídeos

Consulte a tabela `videos` no painel SQL do Supabase. A coluna `id` (UUID) é o
valor a ser usado no segmento `/video/<id>`.
