# PRD — MVP: App de Retenção e Estudo para Jiu-Jitsu

## Overview

**Mais Jiu** é um aplicativo mobile-first que permite ao aluno de uma academia de Jiu-Jitsu estudar de forma ativa, pelo celular, as técnicas da semana — fazendo preview antes da aula e revisão depois — por meio de vídeos curtos verticais (9:16) com experiência de consumo imersiva (estilo Reels/Shorts/TikTok). Cada técnica é acompanhada da decomposição da transição de posição ("De → Para") e de um passo a passo numerado, além de busca por tags no acervo.

- **Problema que resolve:** o aprendizado no tatame se perde entre os treinos; o aluno não tem uma forma rápida e organizada de estudar as técnicas da semana — nem para chegar à aula preparado com dúvidas, nem para revisar o que treinou — e a academia não tem um gancho de engajamento fora do horário de aula.
- **Para quem é:** alunos de uma academia parceira (usuário final) e, indiretamente, o dono/professor da academia, que quer aumentar engajamento e retenção.
- **Por que é valioso:** valida a hipótese de que conteúdo proprietário da própria academia, organizado por semana de treino, gera estudo fora do tatame. É a base para um futuro micro-SaaS B2B voltado a donos de academias no Brasil — uma lacuna não atendida pelos concorrentes (bibliotecas genéricas de técnica ou softwares de gestão).

## Goals

- Validar se os alunos consomem o conteúdo da semana fora do tatame, medido por **média de vídeos distintos assistidos por aluno por semana** (e, secundariamente, pelo total de visualizações).
- Validar o uso como estudo ativo: alunos que assistem às técnicas antes da aula chegam ao tatame com dúvidas a tirar.
- Confirmar que o formato de vídeo vertical curto + busca por tags é adequado ao estudo de BJJ.
- Operar em modelo concierge (sem painel administrativo), mantendo o custo de construção e operação mínimo durante a validação.
- Gerar dados confiáveis de consumo para embasar a decisão de evoluir para o produto B2B.
- **Marco:** piloto com 1 academia, todos os alunos, durante ~4 semanas (1 ciclo mensal de conteúdo semanal).

## User Stories

**Persona primária — O Aluno**

- Como aluno, quero fazer login com usuário e senha já criados, para acessar o conteúdo sem fricção de cadastro.
- Como aluno, quero ver na tela inicial os vídeos da "Semana Atual", para revisar rapidamente o que foi treinado.
- Como aluno, quero assistir às técnicas da semana antes da aula, para chegar ao tatame preparado e com dúvidas a tirar com o professor.
- Como aluno, quero deslizar horizontalmente entre os cards verticais da semana, para navegar de forma natural no celular.
- Como aluno, quero abrir um vídeo em tela cheia vertical, para ver o detalhe do golpe sem faixas pretas que reduzam a área útil.
- Como aluno, quero ver de qual posição a técnica parte e para qual(is) posição(ões) ela leva ("De → Para"), para entender o encadeamento posicional do golpe.
- Como aluno, quero ler o passo a passo numerado da técnica, para conseguir estudar e reproduzir a execução fora do tatame.
- Como aluno, quero ver o título e as tags do vídeo em formato de pílulas clicáveis, para entender o contexto e explorar temas relacionados.
- Como aluno, quero buscar por uma tag (ex.: "Passagem"), para encontrar todos os vídeos daquele tema no acervo.

**Persona secundária — O Admin/Professor (operação concierge)**

- Como admin, quero inserir semanas, vídeos, tags e os metadados da técnica (posição de origem, posição(ões) de destino e passo a passo) diretamente no banco de dados, para publicar conteúdo sem precisar de uma interface administrativa.
- Como admin, quero publicar o conteúdo no início da semana, para que os alunos possam estudar as técnicas antes das aulas daquela semana.
- Como admin, quero avisar os alunos por WhatsApp quando uma nova semana for publicada, para trazê-los de volta ao app.
- Como admin, quero consultar via SQL quantos vídeos cada aluno assistiu por semana, para medir o sucesso da validação.

## Core Features

**1. Autenticação simples (alta prioridade)**

- Login com usuário e senha; contas pré-criadas.
- Recuperação de senha e criação de conta ocultas/bloqueadas (tratadas pelo concierge).

**2. Dashboard — "O Agora" (alta prioridade)**

- Header compacto com saudação ao aluno.
- Bloco de destaque da "Semana Atual" com título da semana e datas de início/fim.
- Conteúdo da semana publicado no início da semana, disponível tanto para preview antes das aulas quanto para revisão depois.
- Galeria dos vídeos da semana em cards verticais (9:16), com navegação por deslize horizontal (carrossel) amigável ao toque.

**3. Player vertical + decomposição da técnica (alta prioridade)**

- Ao tocar um card, o vídeo abre em tela imersiva vertical (full-bleed, sem tab bar), ocupando a maior parte da tela e maximizando a área do golpe.
- Sobre o vídeo, uma legenda expansível exibe: título; tags em pílulas arredondadas e clicáveis (tocar a tag leva ao feed daquela tag); a decomposição **"De → Para"** (posição de origem → posição(ões) de destino, suportando múltiplos destinos, ex.: "100kg / Montada"); e o **passo a passo numerado**.
- A legenda inicia colapsada mostrando apenas os **2 primeiros passos**, com ação "Ver mais"/"Ver menos" para expandir a lista completa.
- Os metadados de técnica (origem, destino(s), passos) são opcionais por vídeo: quando ausentes, a tela exibe apenas título e tags.

**4. Biblioteca e busca por tags (alta prioridade)**

- Campo de busca onde o aluno digita uma tag e recebe um feed vertical com todos os vídeos correspondentes do acervo (independente da semana).
- Busca por correspondência de tag **normalizada** (case-insensitive e insensível a acento), **sem busca semântica** neste MVP. Para evitar inconsistência de digitação, a tela exibe *chips* das tags existentes no acervo como atalho de busca, e a busca livre casa contra esse vocabulário.

**5. Registro de visualizações (alta prioridade, invisível ao aluno)**

- **Definição de "visualização" (evento de view):** registrada quando o *playhead* alcança 50% da duração do vídeo durante a reprodução — não exige assistir até o fim, e **não** conta abrir o card nem fazer *scrub* manual além da marca. Disparada uma vez por sessão de reprodução do vídeo.
- O app registra cada evento de visualização (qual aluno, qual vídeo, *timestamp*), permitindo consulta via SQL.
- **Duas métricas distintas e separadas** são derivadas desses eventos (ver Success Metrics): *vídeos distintos assistidos* (deduplicado por aluno/vídeo/semana) e *total de visualizações* (todos os eventos, incluindo *re-watch*). É requisito para medir as métricas de sucesso.

*Interação entre features:* o Dashboard é a porta de entrada semanal; as tags conectam o consumo da semana ao acervo via busca; o registro de visualizações captura o comportamento em todas as telas de consumo.

## User Experience

- **Personas e metas:** o aluno quer estudar de forma ativa (preparar-se antes da aula e revisar depois); o professor quer engajamento mensurável.
- **Momentos de uso:** o conteúdo é publicado no início da semana, permitindo preview antes de cada aula (chegar com dúvidas) e revisão após o treino.
- **Navegação:** barra inferior com 2 abas — **Início** (dashboard da "Semana Atual") e **Buscar** (acervo por tags). O Player é uma tela imersiva sem barra de abas (apenas botão voltar). Login é tela única de entrada.
- **Fluxo principal:** recebe link no WhatsApp → abre o app nativo (*deep link*) → se já autenticado, vai direto ao destino; se não, faz login e então é levado ao destino preservado → vê a "Semana Atual" → desliza pelos cards → assiste em tela imersiva vertical, lendo o "De → Para" e o passo a passo → toca tags ou busca temas no acervo.
- **Deep link pós-login:** o link do WhatsApp pode apontar para a "Semana Atual" ou um vídeo específico. Se o aluno não estiver autenticado (ou em *cold start*, com o app fechado), o app guarda o destino, exibe o login e, após autenticar, navega automaticamente ao destino original.
- **Estados vazios e de erro (cobertos no wireframe):** dashboard sem semana publicada; busca sem resultados; vídeo indisponível/link quebrado; carregamento (*skeleton*); sem conexão; credenciais inválidas no login.
- **UI/UX:** rigorosamente mobile-first; consumo exclusivamente em vídeo vertical 9:16; experiência de rolagem/visualização imersiva semelhante a Reels/Shorts/TikTok; tags como pílulas arredondadas, estilo legenda de Reels.
- **Onboarding e descoberta:** sem fluxo de cadastro; o aluno entra direto com credenciais fornecidas pela academia. A reativação semanal acontece fora do app, pelo aviso do professor via WhatsApp com link.

## High-Level Technical Constraints

- **App nativo em React Native (Expo)** — há tech spec dedicada; mobile-first; vídeo estritamente vertical (proporção 9:16) ocupando o máximo da tela.
- **Piloto Android-first** (alvo Pixel-class); demais plataformas ficam para fase posterior.
- **Design system definido** no protótipo (`prototipo/design.md`): superfície creme (#f7f4ed), acento rosa (#ff4d8d) reservado apenas ao flourish da seta "De → Para", peso tipográfico máximo 600, bordas em vez de sombras.
- **Reprodução com `expo-video`** a partir de **arquivos de vídeo vertical hospedados (mp4 ou HLS)**. YouTube Shorts foi descartado: `expo-video` não reproduz URLs do YouTube e o embed traria chrome do YouTube + letterbox + API de tracking distinta, quebrando a definição única dos 50%. Sem infraestrutura própria de upload pesado no MVP.
- Contas pré-criadas; sem autoatendimento de cadastro/recuperação.
- **Sessão persistente por 1 mês**, alinhada ao ciclo mensal de conteúdo (sem relogin a cada link semanal).
- **Deep linking nativo** para abrir a "Semana Atual" ou um vídeo específico a partir do link de WhatsApp, com destino preservado quando o login é necessário.
- Sem interface administrativa: ingestão de conteúdo e gestão de contas via operação concierge (banco de dados).
- O produto deve registrar eventos de visualização (regra dos 50%) de forma consultável, preservando dados mínimos do aluno.

## Non-Goals (Out of Scope)

- Painel de administração visual para professores.
- Sistema de níveis de dificuldade ou progressão de faixas/graus.
- Infraestrutura nativa de upload de vídeos pesados (uso de links externos).
- Sistema de pagamentos ou checkout de assinaturas.
- Notificações push e e-mail automatizados (reativação é manual via WhatsApp neste MVP).
- Marca de "assistido"/contador de progresso visível ao aluno (considerado para fase futura).
- Funcionalidades sociais (curtidas, comentários, favoritos/salvos).
- Interação in-app de dúvidas/perguntas ao professor (o "tirar dúvida" acontece presencialmente no tatame; o bloco de pergunta foi removido do player).
- Suporte multi-academia (piloto restrito a uma academia).

## Phased Rollout Plan

### MVP (Fase 1)

- As 4 telas (autenticação, dashboard da semana, player imersivo com decomposição da técnica, e busca no acervo) com navegação por 2 abas (Início/Buscar), e o registro de visualizações.
- Operação concierge (conteúdo via banco, incluindo "De → Para" e passo a passo; reativação via WhatsApp).
- **Critério para avançar:** dados de consumo coletados ao longo de ~4 semanas em 1 academia indicando média relevante de vídeos distintos assistidos por aluno por semana.

### Fase 2

- Gancho de hábito visível ao aluno (marca de "assistido", contador da semana).
- Reativação automatizada (push e/ou e-mail semanal).
- **Critério para avançar:** melhora sustentada na média de vídeos/aluno/semana e na recorrência semanal.

### Fase 3

- Painel administrativo para professores e suporte multi-academia (base do micro-SaaS B2B).
- Vocabulário controlado de posições com navegação (mapa de posições: tocar em uma posição → técnicas relacionadas).
- Modelo de cobrança/assinatura B2B.
- **Critério de sucesso de longo prazo:** academias dispostas a pagar pela ferramenta com retenção comprovada de alunos.

## Success Metrics

- **Definição de view:** evento disparado quando o playhead alcança 50% da duração do vídeo (ver Feature 5).
- **Métrica principal — vídeos distintos assistidos por aluno por semana:** contagem deduplicada (re-watch do mesmo vídeo não soma); é o número-norte do piloto.
- **Métrica secundária — total de visualizações (eventos) por aluno por semana:** todos os eventos de 50%, incluindo re-watch; mede intensidade de revisão.
- Distribuição de consumo (quantos alunos assistem 0, 1–2, 3+ vídeos distintos/semana).
- Recorrência semanal (alunos que consomem em mais de uma das ~4 semanas).
- **Proporção de views pré-aula vs. pós-aula** via heurística de dia da semana: views de **segunda e terça** contam como *pré-aula*; demais dias como *pós-aula* (dispensa o calendário de aulas).
- Uso da busca por tags (proxy de estudo ativo no acervo).
- Qualidade percebida: feedback qualitativo dos alunos e do professor ao fim do piloto.

## Risks and Mitigations

- **Baixo engajamento por falta de lembrete robusto (não por falta de interesse):** mitigado com disparo disciplinado de WhatsApp pelo professor e leitura da métrica por visualização; reativação automatizada fica para a Fase 2.
- **Risco de adoção (aluno não baixa/não loga):** mitigado por login sem fricção (contas prontas) e link direto enviado pela academia.
- **Dependência de uma única academia parceira:** resultado do piloto pode não generalizar; mitigado deixando claro que é teste de hipótese, não validação definitiva de mercado.
- **Concorrência de bibliotecas consolidadas:** mitigado pelo diferencial de conteúdo proprietário e contextualizado da própria academia (não conteúdo genérico).
- **Operação concierge dependente de esforço manual:** aceitável no MVP; sinaliza necessidade de painel admin caso a hipótese se confirme.
- **Conteúdo publicado tarde (após as aulas):** esvazia o benefício de estudo antes da aula; mitigado atrelando a publicação e o aviso de WhatsApp ao início da semana.

## Architecture Decision Records

- [ADR-001: Estratégia de MVP — Concierge Enxuto focado na hipótese de revisão semanal](adrs/adr-001.md) — Construir exatamente as 3 telas com registro invisível de visualizações e reativação manual via WhatsApp, priorizando velocidade e fidelidade à hipótese.
- [ADR-002: Modelo de estudo ativo — conteúdo publicado no início da semana](adrs/adr-002.md) — Reposicionar o produto para estudo ativo (preview antes da aula + revisão depois), publicando o conteúdo no início da semana.
- [ADR-006: Estrutura de conteúdo da técnica — decomposição "De → Para" e passo a passo](adrs/adr-006.md) — Cada vídeo suporta posição de origem, destino(s) e passos numerados, exibidos na legenda expansível do player (colapsada mostra 2 passos).

## Open Questions

- Qual é o limiar numérico de "sucesso" para a média de vídeos distintos/aluno/semana (ex.: ≥3)?
- Em que dia/momento da semana o professor publica o conteúdo e dispara o aviso, garantindo a janela de preview antes da primeira aula?
- Quantos vídeos, em média, comporão cada semana (afeta expectativa de consumo)?
- Haverá conteúdo de acervo já disponível no lançamento, ou o acervo começa vazio e cresce semana a semana?
- Qual academia parceira e qual o tamanho da base de alunos do piloto?

### Resolvidas nesta revisão

- **Sessão (fixa vs. sliding):** *sliding* — renovada a cada abertura via auto-refresh do `supabase-js` (refresh token em SecureStore), mantendo a janela de ~1 mês sem relogin.

- **Definição de view:** playhead atinge 50% da duração (uma vez por reprodução).
- **Métricas:** duas, separadas — vídeos distintos assistidos e total de visualizações (eventos).
- **Plataforma:** app nativo React Native (Expo); reprodução com `expo-video`.
- **Fonte de vídeo:** mp4/HLS vertical hospedado (YouTube Shorts descartado).
- **Sessão:** persistente por 1 mês.
- **Deep link:** abre destino (Semana Atual/vídeo) com login intermediário preservando o destino.
- **Busca:** por tag normalizada + chips das tags existentes, sem busca semântica.
- **Pré vs. pós-aula:** heurística de dia — seg/ter = pré-aula.
- **Posições "De → Para":** texto livre no MVP, com lista canônica de posições documentada no material do concierge para reduzir inconsistência. São apenas informativas (não navegáveis) neste piloto. Vocabulário controlado em tabela dedicada fica para a Fase 3, se as posições se tornarem navegáveis (mapa de posições).
