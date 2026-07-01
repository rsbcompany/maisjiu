# Mais Jiu — Design System (para port React Native)

> Documento gerado a partir do protótipo high-fidelity交付 (`index.html`, `login.html`, `home.html`, `player.html`, `search.html`, `css/app.css`).
> Um agente RN deve conseguir recriar cada tela pixel-comportamento fiel lendo só isto + os HTMLs de referência.

---

## 1. Sobre o app

**Mais Jiu** — app Android de retenção e estudo para alunos de Jiu-Jitsu. Conteúdo semanal em vídeos verticais 9:16 (estilo Reels/Shorts), busca por tags de posição, navigation bar inferior de 2 tabs.

Piloto MVP: uma academia, ~4 semanas, contas pré-criadas, sem admin panel (concierge mode — conteúdo entra direto no DB).

### Plataforma alvo
- Android-first (Pixel-class, 412×915px lógicos).
- Frame do protótipo: `--app-width: 412px`, `--app-height: 915px`, status bar 28px, nav bar 56px.

### Navegação (fluxo)
```
login.html ──(credenciais válidas)──► home.html
                                          │
                          (tap card/tag)  │  (header search / tab Buscar)
                                          ▼                       ▼
                                      player.html              search.html
                                          ▲                       │
                                          └──(tap card/tag)───────┘
```
- Bottom nav com 2 tabs: **Início** (`home.html`), **Buscar** (`search.html`).
- `player.html` **não tem** tab bar — tela imersiva full-bleed, só botão voltar.
- `login.html` não tem nav — tela de entrada única.

---

## 2. Tokens de design (Lovable-inspired)

Fundação extraída do `:root` em `css/app.css`. Reproduzir como `theme.ts` em RN.

### Cores
```ts
export const colors = {
  bg:        '#f7f4ed',  // cream parchment — page + card surface (idêntico)
  surface:   '#f7f4ed',  // cards reusam o canvas; borda é o separador
  fg:        '#1c1c1c',  // charcoal — texto primário, dark CTA bg
  fg2:       'rgba(28,28,28,0.83)',  // texto secundário forte
  muted:     '#5f5f5d',  // descrições, captions
  meta:      'rgba(28,28,28,0.4)',   // placeholders, bordas interativas
  border:    '#eceae4',  // light cream — divisor passivo (cards, inputs)
  accent:        '#ff4d8d',   // Lovable Pink — ÚNICO acento cromático
  accentOn:      '#ffffff',
  accentHover:   '#e8457f',   // accent + black 8%
  accentActive:  '#d93d7e',   // accent + black 14%
  textOnDark: '#fcfbf8',  // texto sobre charcoal/pink
  white:      '#ffffff',
  success: '#16a34a',
  warn:    '#eab308',
  danger:  '#dc2626',
};
```

**Regras de uso de cor (hard constraints):**
- `bg` é a superfície padrão — **nunca usar branco puro** (`#fff`) como fundo.
- Escala de cinzos é opacity-driven: derivar de `fg` em alpha, não hex arbitrários.
- `accent` (#ff4d8d) aparece em **no máximo 2 lugares por tela**. No protótipo atual: (1) seta `De → Para` no player, (2) nada mais na home/search/login. A barra de progresso do player foi passada para branco justamente pra respeitar isto.
- Bordas em vez de sombras para conterimento (`border: #eceae4`). Sombras só em: (1) CTA escuro (inset shadow), (2) snackbar.
- CTAs primários são `bg: fg` (charcoal), não pink. Pink é só para o flourish.

### Tipografia
```ts
export const fonts = {
  display: 'CameraPlain, "Camera Plain Variable", ui-sans-serif, system-ui, sans-serif',
  body:    'CameraPlain, "Camera Plain Variable", ui-sans-serif, system-ui, sans-serif',
  mono:    'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Monaco, Consolas, monospace',
};
export const fontWeights = { regular: '400', display: '480', semibold: '600' };
// 700 (bold) NÃO existe no sistema — 600 é o teto
```

Em RN sem Camera Plain carregada: cair pra `System` no iOS / `Roboto` no Android. Manter os pesos 400/600.

### Escala tipográfica (px)
| Token | px | Uso |
|---|---|---|
| `text-xs` | 12 | caption, metadata, tag, duração de vídeo |
| `text-sm` | 14 | body-sm, label, link small, button small, chips |
| `text-base` | 16 | body, button, input |
| `text-lg` | 18 | body large, header title |
| `text-xl` | 20 | card title, reels title |
| `text-2xl` | 36 | sub-heading, brand H1 |
| `text-3xl` | 48 | section heading, launcher H1 |
| `text-4xl` | 60 | (reservado, não usado no app) |

### Line-height / tracking
- `leading-tight: 1.10` — headings
- `leading-body: 1.5` — body
- `tracking-display: -0.025em` — proporção do `-1.5px @ 60px` original, escalar com tamanho em headings
- Body/caption: tracking normal

### Espaçamento (8px base)
```ts
export const space = {
  1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 12: 48,
};
```
Padding lateral padrão da `app-body`: `space-4` (16px). Gutter mobile: 12px.

### Raios
| Token | px | Uso |
|---|---|---|
| `radius-sm` | 6 | **botões, inputs** (funcional) |
| `radius-md` | 12 | **cards, thumb de vídeo, feed-item** |
| `radius-lg` | 16 | week-card, brand-mark, containers grandes |
| `radius-pill` | 9999 | **só** pills de ação, icon toggles, chips de tag, search input |

**Não usar** `radius-pill` em botões retangulares — pills são reservados pra chips de tag e o input de busca.

### Elevação (RN: usar `elevation` no Android + `shadowColor`)
- `elev-flat: none` — default para tudo
- `elev-ring: 1px border #eceae4` — implementar como `borderWidth:1, borderColor: colors.border` (não shadow)
- `elev-raised: 0 4px 12px rgba(0,0,0,0.1)` — snackbar e focus; em RN `shadowOffset:{h:4,w:0}, shadowRadius:12, shadowOpacity:0.1, elevation:4`
- **Inset shadow do CTA escuro** (assinatura Lovable): `rgba(255,255,255,0.2) 0 0.5px 0 inset, rgba(0,0,0,0.2) 0 0 0 0.5px inset, rgba(0,0,0,0.05) 0 1px 2px`. Em RN aproximado: `borderWidth:1, borderColor: colors.fg` + leve `elevation:2` (não tem inset nativo; prioridade é o tactility).

### Focus ring (acessibilidade)
`0 0 0 2px rgba(59,130,246,0.5)` — único momento cool no palette warm, justificado por a11y. Em RN: `focusRing` como rgba azul em estados `focused`.

### Motion
```ts
export const motion = {
  fast: 150,    // hover, active feedback
  base: 200,    // sheet expand, fade
  easeStandard: 'cubic-bezier(0.2, 0, 0, 1)',  // RN: Easing.bezier(0.2, 0, 0, 1)
};
// active state: opacity 0.85 + translateY(1px) em botões
```

---

## 3. Inventario de componentes (props, estados)

Cada bloco abaixo é um componente RN. Nome sugerido + props + estados + arquivo de referência.

### `<DeviceFrame>` *(opcional em RN — só pra preview)*
Contém StatusBar + content. Em produção RN use `SafeAreaView` + `StatusBar`. Frame só existe no protótipo web.

### `<StatusBar>` (mock)
Altura 28px, bg `bg`, texto `fg`, monospace `text-xs`, time à esquerda (09:41 fixo no protótipo — em RN usar hora real), 2 SVGs à direita. z-index 20.

### `<AppHeader>`
```
height: 56 | paddingInline: 16 | bg: bg | borderBottom: 1px solid border | z: 10
```
- **Home variant**: saudação caption + `<h1 class="title">` (text-lg, weight 600, tracking -0.01em) à esquerda; `<IconButton>` busca à direita.
- **Search variant**: `<IconButton>` voltar à esquerda, `<h1 class="title">` centralizada, spacer 44px à direita (para manter o título centrado).
- **Player variant**: sem AppHeader — usa `<ReelsTop>` overlay em vez disso.

### `<IconButton>`
`width:height: 44px` (hit target mínimo), `borderRadius: 9999`, `color: fg`, hover `bg: fg@6%`, active `opacity: 0.7`. SVGs internos 22×22. Props: `icon`, `onPress`, `ariaLabel`.

### `<AppBody>`
`flex:1, overflow: hidden, paddingInline: 16`. Variante `.no-pad` para telas onde o conteúdo toca as bordas (search feed). Scroll vertical nativo do ScrollView.

### `<WeekCard>`
Card destacado no topo da home:
```
bg: surface | border: 1px solid border | radius: 16 | padding: 20 | marginBlock: 16
├ caption "SEMANA ATUAL" (mono, text-xs, muted, uppercase, tracking 0.04em)
├ <h2 week-title> (text-xl, weight 600)
└ <p week-date> (text-sm, muted)
```
Props: `weekTitle`, `weekDate`.

### `<Carousel>` — section "Técnicas da semana"
- Header da section: `<h2 heading>` (text-xl, 600, lh 1.2, tracking -0.01em) + `<span body-sm>` count "N vídeos" alinhados baseline, à direita.
- `Carousel` = `FlatList horizontal` com `scroll-snap` (RN: `snapToInterval` ou `snapToOffsets`).
- Gap entre cards: 12px. `paddingHorizontal: 16`, `paddingBottom: 12`, `paddingLeft: 16` (alinhado com o conteúdo).
- Scrollbar escondida (`showsHorizontalScrollIndicator={false}`).

**Anti false-floor affordance (crítico):**
- Card width: **158px** (no protótipo). Isto garante que no viewport de 412px fique ~2 cards completos + ~33% do terceiro visível (~52px de peek) — sinal óbvio de que tem mais.
- **Right-edge fade** em `carousel-wrap::after`: gradiente `transparent → var(--bg)` na borda direita, 44px de largura, `pointerEvents:none`. Em RN: overlay `<LinearGradient>` posicionado absoluto à direita do `FlatList`, colors `['transparent', colors.bg]`, widths 44. **Some no scroll-end** (classe `is-at-end` zera opacity) — listener `onMomentumScrollEnd` calcula `maxScroll = contentWidth - layoutWidth`, se `offset >= maxScroll - 6` → hide fade. Implementar com `Animated.Value` na opacidade do gradient.
- `aspect-ratio: 9/16` em cada card thumb.

### `<VideoCard>` (no carrossel)
```
width: 158 | flex-shrink: 0 | cursor: pointer
├ <thumb>  aspectRatio: 9/16 | radius: 12 | border: 1px solid border
│         bg: linear-gradient(135deg, hsl(${hue} 70% 28%), hsl(${hue} 60% 14%))
│         ::before scrim: linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.55) 100%)
│   ├ <play> 44×44 circle, bg rgba(255,255,255,0.92), fg charcoal, SVG 16×16
│   └ <duration> absolute bottom:8 right:8, mono xs, white, bg rgba(0,0,0,0.55), pill, padding 2px 6px
├ <card-title> margin-top:8, text-sm, weight 500, lh 1.3, fg
└ <card-tags> margin-top:4, flex-wrap, gap:4 — <Tag> chips
```
Em RN o `hue` vem do dado do vídeo — use `expo-linear-gradient` ou um bg sólido fallback. O scrim de baixo do thumb é só pra legibility do duration badge.

Props: `id`, `title`, `tags: string[]`, `duration: string` (formato "0:42"), `hue: number`, `onPress(id)`.

### `<Tag>` chip
```
inline-flex | padding: 4px 10px | bg: transparent | color: muted
border: 1px solid border | radius: 9999 | text-xs
hover: bg fg@4%, border meta
active: bg fg, color textOnDark, border fg      ← chip selecionado (preenchido)
accent: bg accent@10%, color accent, border accent@24%   ← (não usado atualmente)
```
Props: `label`, `active?`, `variant?: 'default'|'accent'`, `onPress`. Usado para tags de vídeo (estático, `<span>`) e chips de filtro (`<button>`, com estado `active`).

### `<ReelsStage>` — player imersivo
Tela cheia, **bg: fg (charcoal)**, `color: textOnDark`. Sem AppHeader, sem tab bar.

**Layer stack (z-order):**
1. `reels-video` — bg charcoal, flex:1. (em RN: `<Video>` ou placeholder charcoal)
2. `reels-scrim--top` — absolute top, height 120, gradiente `rgba(0,0,0,0.45)→transparent`
3. `reels-scrim--bottom` — absolute bottom, height 340, gradiente `rgba(0,0,0,0.72)→transparent` (mais forte que o top)
4. `reels-top` — absolute top, padding 16, flex row space-between, z:3. Apenas `<ReelsIcon>` voltar (44px circle, bg rgba(0,0,0,0.18), `backdrop-filter: blur(2px)` → RN: `BlurView`).
5. `reels-play` — absolute centered, 72×72 circle, bg rgba(255,255,255,0.95), fg charcoal, SVG 28×28, z:2. **Auto-hide**: some 900ms depois de começar a tocar (`is-hidden` opacity 0 + pointerEvents none). Reaparece ao pausar.
6. `reels-sheet` — absolute bottom, z:2, padding-top: 8
   7. `<ReelsHandle>` — 32px height, botão com barra 40×4, radius 2, bg rgba(255,255,255,0.35), hover 0.55. Props: `onPress`.
   8. `<ReelsBottom>` — padding `8px 16px 24px`, `text-shadow: 0 1px 3px rgba(0,0,0,0.55)` herdado (legibilidade Instagram-style — ESSENCIAL sobre vídeo)
      - `<ReelsTitle>` — text-xl, weight 600, lh 1.2, white, margin-bottom 8
      - `<ReelsTags>` — flex-wrap, gap 8, margin-bottom 12; cada tag é `<ReelsTag>` (pill 4px 10px, bg rgba(255,255,255,0.12), border rgba(255,255,255,0.18), white, text-xs)
      - `<ReelsCaption>` (estado colapsado/expandível):
        - **max-height 120px** quando colapsado; **360px + overflow scroll** quando `is-expanded` (Animated回调 `maxHeight`)
        - **Colapsado mostra apenas os 2 primeiros passos** (RN: renderizar só os 2 primeiros `li` quando `!expanded`)
        - `<ReelsDecomp>` — inline-flex, gap 8, flex-wrap, margin-bottom 8:
          ```
          De <strong>{from}</strong> <ReelsArrow>→</ReelsArrow> para <strong>{toText}</strong>
          ```
          onde `toText = Array.isArray(to) ? to.join(' / ') : to`  ← **suporta múltiplas posições finais** ex: "100kg / Montada"
          `<ReelsArrow>` é o **único flourish accent** da tela: color `accent`, weight 700.
        - `<ReelsSteps>` — lista numerada, gap 8, list-style none:
          - cada `<li>`: flex gap 8, `<span class="num">` 18×18 circle bg rgba(255,255,255,0.18) white text-xs weight 700 center + `<span>` texto text-sm lh 1.45 rgba(255,255,255,0.92)
        - `<ReelsMore>` — botão inline, margin-top 4, padding "2px 0", color rgba(255,255,255,0.70), text-sm, weight 500. Label alterna "Ver mais" / "Ver menos".
9. `<ReelsProgress>` — absolute bottom 0, height 18px (área de toque!), padding-top 14, z:4, cursor pointer, `role="slider"`, `aria-label="Progresso do vídeo"`, `aria-valuemin=0`, `aria-valuemax=100`, `aria-valuenow` atualizado.
   - `track`: height 3px, bg rgba(255,255,255,0.18), radius 2, overflow hidden
   - `fill`: height 100%, width `progress%`, **bg white** (não pink), `transition: width 0.1s linear`
   - Scrubbing: tap position → calcula ratio → setta `progress`. Teclado ← → ajusta ±5.

**Interações do player:**
- Tap em qualquer lugar do `video-area` → toggle play/pause. (`onPress` no container)
- Tap no `btn-play` → toggle (stopPropagation pra não dobrar).
- Tap no `btn-handle` OU no `btn-more` → toggle caption expanded (stopPropagation).
- Tap na progress bar → scrub (stopPropagation).
- **Snackbar** "Visualização registrada (50%)" aparece **uma vez** quando `progress >= 50` (marca de visualização pra contabilizar retenção).

### `<Snackbar>`
```
absolute bottom: nav-bar-height + 16 | left:50% | translateX(-50%) translateY(120%) | hidden
bg fg | color textOnDark | padding 12 20 | radius 9999
text-sm | shadow elev-raised | z:30 | white-space:nowrap
.show: translateY(0) opacity 1, transition motion-base
```
Em RN: absoluta no fundo da tela, acima da nav bar. Animated `slide-up + fade`. Auto-hide 2200ms (2400ms no player). Props: `message`, `visible`, `duration`.

### `<SearchHeader>` (sticky no topo da search)
```
padding 12 16 | border-bottom 1px border | bg bg | sticky top:0 | z:5
└ <SearchInputWrap> flex row, items-center, gap 8, padding 8 12, border 1px border, radius 9999, bg surface
   ├ svg lupa 18×18 color muted
   └ <input> flex:1, min-height 32, text-base, placeholder color meta
```
Em RN: sticky header no `ScrollView`/`FlatList` (ou `SectionList`). O input é pill-shaped inteiro — **raio 9999 no wrap**, não no input.

### `<FeedItem>` (lista de resultados da busca)
```
grid 100px 1fr, gap 12 | padding 12 | border 1px border | radius 12 | bg surface | cursor pointer
├ <thumb> aspectRatio 9/16, radius 6, bg gradient hsl(...) ou fg@10%, center
│  └ svg play 20×20 color muted
└ <meta> flex-col gap 4
   ├ <title> weight 600 text-base fg
   ├ <caption> mono text-xs muted (a duração)
   └ <tags> flex-wrap gap 4 — <Tag> chips
```
hover: `border-color: meta`. Props: `video`, `onPress(id)`.

### `<State>` (empty / loading / error)
```
flex-col | items-center | justify-center | text-center | padding 48 16 | gap 12 | color muted
├ svg 48×48 color border
├ <h3> color fg, text-lg
└ <p body-sm> (descrição)
```
Empty da busca: SVG lupa + "Nenhum vídeo encontrado" + "Tente outra tag ou selecione um dos chips acima."

### `<Skeleton>`
Shimmer animado: `linear-gradient(90deg, border 25%, fg@4% 50%, border 75%)` com `background-size: 200%` e `animation: shimmer 1.4s infinite`. Em RN: `expo-skeleton` ou `Animated.loop` com interp `opacity 0.3↔0.6` num `<View bg=border>`.

### `<LoginBody>`
```
flex:1 | flex-col | justify-center | padding 24 20 | gap 20
├ <brand> text-center margin-bottom 16
│  ├ <brand-mark> 64×64 radius 16 bg fg color textOnDark center text-2xl weight 600 margin auto bottom 16 ("MJ")
│  ├ <h1> text-2xl weight 600 tracking -0.02em ("Mais Jiu")
│  └ <p> color muted margin-top 4 ("Estudo ativo fora do tatame")
├ <form>
│  ├ <Field label="Usuário"><Input placeholder="seu.usuario" autoComplete=off /></Field>
│  ├ <Field label="Senha"><Input type=password placeholder="••••••" /><helper error /></Field>
│  └ <Button primary block margin-top 24>Entrar</Button>
└ <p body-sm text-center margin-top 16>
   "Contas pré-criadas pela academia." + line + <span color meta>"Dica: aluno / 123456"</span>
```

### `<Field>`
`flex-col gap 8`. `<label>` text-sm muted. `<Input>` ou `<Textarea>` dentro.

### `<Input>`
```
width 100% | padding 12 16 | border 1px border | radius 6 | bg surface
color fg | text-base | min-height 48
placeholder color meta
focus: border-color accent, box-shadow focus-ring (azul 2px)
.error: border-color danger
```
Em RN: focus state manual via `onFocus`/`onBlur` setando borderWidth/borderColor e overlay azul.

### `<Helper>` (texto de erro)
`text-sm color danger min-height 18 active aria-live=polite`. Em RN: `<Text>` com space reservado pra não pular layout.

### `<Button>`
- Base: `inline-flex center gap 8 | padding 8 16 | radius 6 | text-base | weight 500 | min-height 44`
- `:active`: `translateY(1px) + opacity 0.85`
- `:hover`: definido por variante
- **`primary`**: bg fg, color textOnDark, borderWidth 1 borderColor fg, **inset shadow signature**. Hover: bg fg-blacker 12%.
- **`ghost`**: bg transparent, color fg, border 1px border. Hover: border meta.
- **`block`**: width 100%.
- Em RN: `Pressable` com `styleFn` que aplica `transform: [{translateY: pressed?1:0}], opacity: pressed?0.85:1`.

### `<Caption>` (helper tipográfico)
`font: mono | text-xs | color muted | text-transform: uppercase | letter-spacing: 0.04em`. Usado em "SEMANA ATUAL", durações, labels técnicas.

### Helpers de layout (mapear pra RN folds/styles)
`.mt-1..6` `.mb-2/4` `.gap-2/3` `.w-full` `.flex` `.flex-col` `.items-center` `.justify-between` `.hide-scroll`.

---

## 4. Modelo de dados

### `Video` (shape usado em todas as telas)
```ts
type Video = {
  id: string;        // "v1".."v8"
  title: string;     // "Passagem básica da meia"
  tags: string[];    // ["Passagem", "Meia-guarda"]
  duration: string;  // "0:42" — display string
  hue?: number;      // 0..360 — só pra cor do placeholder thumb no protótipo (em RN virar thumb real do vídeo)
  // Campos extras do player:
  from?: string;                           // "Meia-guarda"
  to?: string | string[];                  // "Montada" ou ["100kg","Montada"]
  steps?: string[];                        // passo a passo, 5 itens
  prompt?: string;                         // legado — prompt do professor (REMOVIDO do player neste ciclo)
};
```

### `Week` (sem objeto explícito no protótipo — inline)
```ts
type Week = { label: string; title: string; dateRange: string };
// protótipo: { label: "SEMANA ATUAL", title: "Passagem da meia-guarda", date: "29 jun – 05 jul" }
```

### Tags canônicas (do acervo)
`['Passagem','Meia-guarda','Finalização','Montada','Guarda','Defesa','Raspagem','Estrangulamento','Pesada','Costas']` — todas únicas, ordenadas. Home mostra as 6 primeiras como exploratórias; search mostra todas.

### Vídeos de seed (acervo do piloto, 8 no total)
```ts
const videos = [
  { id:'v1', title:'Passagem básica da meia', tags:['Passagem','Meia-guarda'], duration:'0:42', hue:10,
    from:'Meia-guarda', to:'Montada', steps:[5 passos da meia→montada] },
  { id:'v2', title:'Passagem com underhook', tags:['Passagem','Meia-guarda'], duration:'0:55', hue:30,
    from:'Meia-guarda', to:['100kg','Montada'], steps:[5 passos] },  // ★ destaque: to é array
  { id:'v3', title:'Estabilização no 100kg', tags:['Passagem','Pesada'], duration:'0:38', hue:50,
    from:'Pós-passagem', to:'100kg controlada', steps:[5 passos] },
  { id:'v4', title:'Finalização da montada', tags:['Finalização','Montada'], duration:'0:47', hue:340,
    from:'Montada', to:'Estrangulamento', steps:[5 passos] },
  { id:'v5', title:'Recuperação de guarda', tags:['Guarda','Defesa'], duration:'1:02', hue:200,
    from:'Sob a pesada', to:'Guarda fechada', steps:[5 passos] },
  { id:'v6', title:'Raspagem de beijo', tags:['Raspagem','Meia-guarda'], duration:'0:49', hue:260,
    from:'Meia-guarda de baixo', to:['Guarda superior','100kg'], steps:[5 passos] },  // ★ to é array
  { id:'v7', title:'Estrangulamento de costas', tags:['Finalização','Costas'], duration:'0:53', hue:120,
    from:'Costas', to:'Finalização', steps:[5 passos] },
  { id:'v8', title:'Saida de 100kg', tags:['Defesa','Pesada'], duration:'0:44', hue:180,
    from:'Sob 100kg', to:'Guarda recuperada', steps:[5 passos] },
];
```
Os steps completos estão em `player.html:66-162` — importar verbatim.

---

## 5. Estado & interações por tela

### Login
- Estado: `user`, `pass`, `error: string|null`, `snackbar: {msg,visible}`.
- Submit: se `!user || !pass` → `error = 'Preencha usuário e senha.'`. Se `user==='aluno' && pass==='123456'` → snackbar `'Entrando...'`, 700ms depois navigate home. Senão → `error = 'Credenciais inválidas. Tente aluno / 123456.'`.
- `input` event em qualquer campo → clear erro.
- Inputs com classe `error` quando erro ativo → borda danger.

### Home
- Renderiza `<WeekCard>` fixo (semana atual hardcodeada no protótipo — virar fetch).
- Renderiza `<Carousel>` com `videos.slice(0,5)` (v1..v5) — no piloto, técnico da semana é este subset.
- `video-count` = `${videos.length} vídeos`.
- Tap card → `navigate('Player', {id})`.
- `<chip-row>` com as 6 primeiras tags → `<Tag>` link pra search com `?tag=`.
- Tap search no header → navigate search.
- Carousel fade state gerido por scroll listener (ver §3 `<Carousel>`).
- **Não há** botão "Ver mais" — scroll horizontal é a interação esperada (PRD).

### Player
- Lê `id` da query/navigation param. Default `v1`.
- Estado: `expanded=false, playing=false, progress=0, viewed=false`.
- `togglePlay`: alterna `playing`, inicia/para interval 100ms que incrementa `progress` por `100/(duration*10)` (assumindo duration em segundos como int). Auto-hide do botão play 900ms após play. Em `progress>=100`: para, `playing=false`. Em `progress>=50 && !viewed`: setta `viewed=true` + snackbar `'Visualização registrada (50%)'`.
- `scrubProgress`: tap na track → ratio = `clamp((x - rect.left) / rect.width, 0, 1)`, `progress = ratio*100`, reset `viewed=false`.
- `setExpanded(value)`: toggle `expanded`, label do button alterna "Ver mais"/"Ver menos".
- **Removido this cycle**: search no header e bloco "tirar dúvida com professor" — **não reimplementar**.

### Search
- Estado: `query: string`.
- Renderiza `<ChipRow>` com todas as tags únicas ordenadas; chip ativo quando `normalize(t)===normalize(query)`.
- Filtragem: `q ? videos.filter(v => v.tags.some(t => normalize(t).includes(q))) : videos`. Normalização: lowercase + strip diacríticos (`NFD` + remove `[\u0300-\u036f]`). Em RN: mesma lógica com `.normalize('NFD').replace(/[\u0300-\u036f]/g,'')`.
- `<Feed>` com `<FeedItem>` por vídeo. Empty state quando `filtered.length === 0`.
- Tap `FeedItem` → `navigate('Player', {id})`.
- Read initial query from URL param `tag` (deep link — em RN: `Search` route param).

---

## 6. Notas de port para React Native

### Estrutura de arquivos sugerida
```
src/
├─ theme/
│  ├─ colors.ts      ← §2
│  ├─ spacing.ts     ← space, radius
│  ├─ typography.ts  ← fonts, scale, weights, tracking
│  └─ index.ts       ← re-exports
├─ components/
│  ├─ Button.tsx
│  ├─ Input.tsx
│  ├─ Field.tsx
│  ├─ Tag.tsx
│  ├─ Snackbar.tsx
│  ├─ IconButton.tsx
│  ├─ VideoCard.tsx
│  ├─ WeekCard.tsx
│  ├─ Carousel.tsx   (FlatList horizontal + edge fade)
│  ├─ Reels*.tsx     (player components)
│  ├─ SearchHeader.tsx
│  ├─ FeedItem.tsx
│  ├─ StateView.tsx  (empty/error/loading)
│  └─ Caption.tsx
├─ screens/
│  ├─ LoginScreen.tsx
│  ├─ HomeScreen.tsx
│  ├─ PlayerScreen.tsx
│  └─ SearchScreen.tsx
├─ data/
│  └─ videos.ts      ← seed do §4
└─ navigation/
   └─ index.tsx      ← Stack navigator: Login → (Tab: Home, Search) → Player
```

### Navegação (React Navigation)
- Stack raiz: `Login → AppTabs`. Conditional initial route baseado em auth state.
- `AppTabs`: bottom tab navigator com `Início` + `Buscar`, ícones como SVGs do protótipo (pode usar `react-native-svg`).
- `Player`: rota separada no stack raiz (não dentro das tabs — tela imersiva sem tab bar). `options={{ headerShown: false, tabBarVisible: false }}` ou use um `Modal` presentation style.
- Tab bar styling: `height: 56, borderTop: 1px borderColor border, backgroundColor: bg, activeTintColor: fg, inactiveTintColor: muted`. Icones 22×22, label text-xs.

### Mapeamentos CSS → RN
| CSS | RN |
|---|---|
| `aspect-ratio: 9/16` | `aspectRatio: 9 / 16` (style prop) |
| `scroll-snap-type: x mandatory` | `FlatList horizontal` + `snapToInterval: 158+12` |
| `backdrop-filter: blur(2px)` | `expo-blur`: `<BlurView intensity={2}>` |
| `text-shadow` | `textShadowColor/Offset/Radius` em `<Text>` style |
| `linear-gradient` (scrim, fade, thumb) | `expo-linear-gradient`: `<LinearGradient colors={[\...]} start/end>` |
| CSS vars | `theme.colors.*` importado |
| `:hover` | **N/A em mobile** — pular hover states no RN (apenas `active`) |
| `:focus` / `:focus-visible` | focus state manual em inputs via onFocus/onBlur; `accessibilityRole` + `accessibilityState` |
| `overflow-y: auto` | `<ScrollView>` |
| `overflow-x: auto` (carousel) | `<FlatList horizontal>` |
| `user-select: none` | default em RN |
| `-webkit-tap-highlight-color: transparent` | default em RN |
| inset shadow (CTA) | aproximar com `borderWidth:1 + borderColor:fg + elevation:2` |

### Bibliotecas sugeridas
- `react-navigation/native` + `react-navigation/bottom-tabs`
- `react-native-svg` (todos os ícones são inline SVG nos HTMLs)
- `expo-linear-gradient` (scrims, edge-fade do carrossel, thumb gradient fallback)
- `expo-blur` (ícones do player)
- `react-native-video` (vídeo real do player — substitui o placeholder charcoal)
- `@react-native-async-storage/async-storage` (persistência de auth session, opcional no MVP)
- `react-native-safe-area-context` (substitui o device frame do protótipo)

### Ícones
Todos os SVGs estão inline nos HTMLs. Para RN: criar um `icons/` com SVGs como componentes (`react-native-svg`) — extrair do protótipo:
- Back arrow (`player.html:28`, `search.html:23`)
- Search magnifier (`home.html:27`, `search.html:32`)
- Play (`player.html:33`)
- Pause (`player.html:34`)
- Home (`home.html:63`)
- Status bar: info + battery (mock)

### Bottom sheet do player
O `reels-sheet` expande via `maxHeight` animado no protótipo. Em RN use `react-native-bottom-sheet` (gorhom) ou um custom `Animated` que interpola `maxHeight` entre 120 e 360 + toggle `Ver mais`. Use `Pressable` em vez de `TouchableOpacity` pra não conflitar com o tap-to-play do container.

### Animações
- `Animated.timing` com `Easing.bezier(0.2, 0, 0, 1)` (equivalente a `ease-standard`).
- Snackbar: slide-up + fade in (200ms), auto-hide 2200ms.
- Caption expand: 200ms com `easing standard`.
- Play button hide: fade-only 200ms (sem slide).
- Reels top scrim + bottom scrim são estáticos (LinearGradient fixo).

### Acessibilidade (RN)
- `accessibilityRole="button"` em botões e cards tocáveis.
- `accessibilityLabel` em icon buttons (voltar, buscar, play, handle).
- `accessibilityState={{ expanded }}` no handle/more button.
- `accessibilityLiveRegion="polite"` no helper de erro e no snackbar.
- Progress bar: `accessibilityRole="adjustable"` + anunciar `%`.
- Touch targets mínimo 44×44 (já respeitado no protótipo — usar `minHeight/minWidth: 44`).

---

## 7. Anti-padrões (não reimplementar)

Coisas que foram **propositadamente removidas ou evitadas** no protótipo — respeitar:

- ❌ **Sem botão "Ver mais" na home** que corte o carrossel em 2 vídeos — o carrossel é a interação esperada (PRD).
- ❌ **Sem busca no player** (header do player não tem lupa — só voltar).
- ❌ **Sem bloco "tirar dúvida com professor"** no player (input de pergunta + prompt sugestivo foram removidos neste ciclo).
- ❌ **Sem avatar/linha de autor** no player ("Academia Parceira · Professor" era filler removido).
- ❌ **Sem mesh gradient fake** no lugar do vídeo (era AI-slop; espaço é charcoal sólido até vídeo real carregar).
- ❌ **Barra de progresso NÃO rosa** — branca. Pink é reservado só pra seta De→Para.
- ❌ **Sem label textual "deslize →"** no carrossel — peek geométrico + fade = affordância.
- ❌ **Sem dorado/peach/cream-variant backgrounds** — `bg` (#f7f4ed) é o canvas; não inventar tons de bege.
- ❌ **Sem peso 700/bold** — 600 é o teto do sistema.
- ❌ **Sem pink em CTAs primários** — CTAs escuros são charcoal; pink é flourish.

---

## 8. Próximos passos sugeridos

1. Skeleton React Native + Expo + navigation — uma PR.
2. `theme/` com tokens do §2 — uma PR.
3. Componentes base (Button, Input, Field, Tag, Snackbar, IconButton) — uma PR.
4. LoginScreen + fluxo de auth (mock com `aluno/123456` MVP).
5. HomeScreen com `WeekCard` + `Carousel` (incluindo edge-fade).
6. PlayerScreen com `react-native-video` + bottom sheet expansível.
7. SearchScreen com filtragem por tag + empty state.
8. Substituir `hue` placeholders por thumbnails reais do backend (concierge mode DB).