# 📄 PRD - MVP: App de Retenção e Estudo para Jiu-Jitsu

## 1. Objetivo do Produto (A Validação)
Testar se os alunos da academia engajam com o estudo fora do tatame através da revisão das posições ensinadas na semana. O aplicativo deve operar como uma ferramenta de retenção, pavimentando o caminho para um futuro micro-SaaS B2B focado em donos de academias no mercado brasileiro.

## 2. Diretriz de UI/UX (Mobile-First e Vertical)
O design deve ser rigorosamente construído com foco em telas de celular (Mobile-First). O consumo de conteúdo será feito exclusivamente através de vídeos verticais (proporção 9:16), proporcionando uma experiência de rolagem e visualização imersiva, semelhante ao YouTube Shorts, TikTok ou Instagram Reels.

## 3. Personas e Fluxo (MVP Concierge)
* **O Aluno (Usuário Final):** Acessa o app pelo celular para revisar rapidamente o que treinou, consumindo vídeos curtos verticais da semana atual ou buscando posições específicas por tags.
* **O Admin:** Não necessita de interface visual neste MVP. A inserção de vídeos e tags será feita via comandos SQL diretamente no banco de dados.

## 4. Escopo Funcional (As 3 Telas do MVP)

### Tela 1: Autenticação Simples
* Tela limpa e responsiva para mobile.
* Campos de Login com Usuario e Senha.
* Ações de recuperação de senha ou criação de conta estão bloqueadas/ocultas (contas pré-criadas no banco).

### Tela 2: Dashboard (O "Agora")
* Header compacto com saudação ao aluno.
* Bloco principal destacando a "Semana Atual" (exibindo o Título da Semana e a data de início e fim).
* Galeria de vídeos da semana exibida em formato de *cards verticais* (9:16). A navegação entre os vídeos deve permitir um deslize horizontal (carrossel) amigável para o toque no celular.

### Tela 3: Player Vertical e Biblioteca (O Acervo)
* **Player Embutido:** Ao selecionar um card, o vídeo deve abrir ocupando a maior parte da tela verticalmente, evitando faixas pretas e maximizando a área do golpe ensinado.
* **Informações do Vídeo:** Logo abaixo do player, exibir o título do vídeo e as **Tags** correspondentes em formato de "pílulas" arredondadas e clicáveis. Pode ser parecida com como é uma legenda de Reels ou TikTok 
* **Barra de Busca:** Um campo simples onde o aluno digita uma Tag (ex: "Passagem") e recebe um feed vertical com todos os vídeos correspondentes do acervo.

## 5. Arquitetura de Dados (Modelo Relacional SQL)
A estrutura deve suportar cruzamentos rápidos entre semanas, vídeos em formato Shorts e tags de categorização.

* `Users`: `id`, `nome`, `email`, `senha`
* `Weeks` (Categorias): `id`, `titulo_semana`, `data_inicio`, `data_fim`
* `Videos` (Posts): `id`, `week_id` (Foreign Key vinculada a Weeks), `titulo`, `url_video` (preparado para receber links de YouTube Shorts ou URLs de arquivos .mp4 verticais).
* `Tags`: `id`, `nome_tag`
* `Video_Tags` (Tabela de Junção): `video_id`, `tag_id` (Relacionamento muitos-para-muitos).

## 6. Fora do Escopo (Não Desenvolver Agora)
* Painel de administração visual para professores.
* Sistema de níveis de dificuldade ou progressão de faixas.
* Infraestrutura nativa de upload de vídeos pesado (uso de links externos).
* Sistema de pagamentos ou checkout de assinaturas.