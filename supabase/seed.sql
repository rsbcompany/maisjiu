-- Pilot seed for Mais Jiu
-- Project: snjaaejvwlkgmyvgrmro
--
-- Inserts the canonical pilot week, 8 videos, tags and video/tag junction.
-- Uses fixed UUIDs so the script is idempotent and can be re-run safely.
--
-- NOTE: url_video values are placeholder/sample clips. Replace them with the
-- academy's real vertical videos before the pilot launch.
--
-- Auth accounts are NOT created here. Use Supabase Auth admin (service role)
-- to create users, then run the companion profile snippet from CONCIERGE.md.

BEGIN;

-- 1. Current week (spans current_date)
--------------------------------------------------------------------------------
INSERT INTO public.weeks (id, titulo_semana, data_inicio, data_fim)
VALUES (
  '9c830fbe-4af1-4762-a693-e61c98959270',
  'Passagem da meia-guarda',
  current_date - 3,
  current_date + 3
)
ON CONFLICT (id) DO UPDATE SET
  titulo_semana = EXCLUDED.titulo_semana,
  data_inicio   = EXCLUDED.data_inicio,
  data_fim      = EXCLUDED.data_fim;

-- 2. Canonical tags
--------------------------------------------------------------------------------
INSERT INTO public.tags (nome_tag) VALUES
  ('Passagem'),
  ('Meia-guarda'),
  ('Finalização'),
  ('Montada'),
  ('Guarda'),
  ('Defesa'),
  ('Raspagem'),
  ('Estrangulamento'),
  ('Pesada'),
  ('Costas')
ON CONFLICT (nome_tag) DO NOTHING;

-- 3. Pilot videos
--------------------------------------------------------------------------------
INSERT INTO public.videos (
  id,
  week_id,
  titulo,
  url_video,
  ordem,
  from_position,
  to_positions,
  steps
) VALUES
  (
    'fcc9f154-c85d-46f3-a92a-44fefaf93401',
    '9c830fbe-4af1-4762-a693-e61c98959270',
    'Passagem básica da meia',
    'https://www.w3schools.com/html/mov_bbb.mp4',
    1,
    'Meia-guarda',
    ARRAY['Montada'],
    ARRAY[
      'Estabeleça o underhook no braço de dentro.',
      'Abaixe o quadril e empurre o joelho dele para o chão.',
      'Caminhe a mão do quadril para longe do oponente.',
      'Retire a perna de trás e complete a passagem.',
      'Consolide a montada segurando as lapela ou gola.'
    ]
  ),
  (
    'd2f41bf7-3844-4b0c-a2f4-913a5b76eb2a',
    '9c830fbe-4af1-4762-a693-e61c98959270',
    'Passagem com underhook',
    'https://www.w3schools.com/html/mov_bbb.mp4',
    2,
    'Meia-guarda',
    ARRAY['100kg', 'Montada'],
    ARRAY[
      'Segure o underhook profundo e agarre a cintura.',
      'Use a testa no peito para derrubar a postura dele.',
      'Esvazie a perna presa com um movimento de chicote.',
      'Pise no chão e avance o quadril para cima.',
      'Estabilize no 100kg antes de subir para a montada.'
    ]
  ),
  (
    'f5c93701-799c-46f8-bdc5-4cbc10a68a34',
    '9c830fbe-4af1-4762-a693-e61c98959270',
    'Estabilização no 100kg',
    'https://www.w3schools.com/html/mov_bbb.mp4',
    3,
    'Pós-passagem',
    ARRAY['100kg controlada'],
    ARRAY[
      'Mãos no chão ao lado da cabeça do oponente.',
      'Quadris baixos, barriga perto do chão.',
      'Cabeça baixa para não tomar grip na gola.',
      'Espalhe o peso pelos quadris e ombros.',
      'Controle os quadris dele sem cruzar suas mãos.'
    ]
  ),
  (
    'ec3bbb88-4aa8-419c-9923-528e188b4209',
    '9c830fbe-4af1-4762-a693-e61c98959270',
    'Finalização da montada',
    'https://www.w3schools.com/html/mov_bbb.mp4',
    4,
    'Montada',
    ARRAY['Estrangulamento'],
    ARRAY[
      'Segure a gola com a mão de dentro.',
      'Segunda mão entra por baixo do queixo.',
      'Cave o cotovelo para baixo do pescoço dele.',
      'Aproxime o peito da cabeça do oponente.',
      'Aperte e desça o quadril para finalizar.'
    ]
  ),
  (
    '3ea8c631-e5f2-4845-9f47-110ff94838f3',
    '9c830fbe-4af1-4762-a693-e61c98959270',
    'Recuperação de guarda',
    'https://www.w3schools.com/html/mov_bbb.mp4',
    5,
    'Sob a pesada',
    ARRAY['Guarda fechada'],
    ARRAY[
      'Não deixe os braços cruzados; busque frames sólidos.',
      'Empurre o quadril para trás para criar espaço.',
      'Insira um joelho ou gancho entre vocês.',
      'Recupere a guarda fechada ou meia-guarda.',
      'Recompõe os grips antes de atacar.'
    ]
  ),
  (
    'a7fd6a51-bd01-4f26-a344-59eb2af4e52e',
    '9c830fbe-4af1-4762-a693-e61c98959270',
    'Raspagem de beijo',
    'https://www.w3schools.com/html/mov_bbb.mp4',
    6,
    'Meia-guarda de baixo',
    ARRAY['Guarda superior', '100kg'],
    ARRAY[
      'Cruze o braço dele para um grip na gola.',
      'Abra o quadril e coloque o cotovelo no chão.',
      'Use o joelho de baixo como alavanca.',
      'Rode para o lado do braço preso.',
      'Suba para a guarda superior ou 100kg invertida.'
    ]
  ),
  (
    '02cb440a-2ecf-47d7-b535-4d8f5ba75495',
    '9c830fbe-4af1-4762-a693-e61c98959270',
    'Estrangulamento de costas',
    'https://www.w3schools.com/html/mov_bbb.mp4',
    7,
    'Costas',
    ARRAY['Finalização'],
    ARRAY[
      'Segure a gola com a mão por baixo do pescoço.',
      'A outra mão passa por trás da cabeça dele.',
      'Feche o triângulo com os antebraços.',
      'Aproxime seu peito das costas dele.',
      'Puxe com os dois antebraços e finalize.'
    ]
  ),
  (
    '134ebba2-1869-41e7-9297-e1527542f7f7',
    '9c830fbe-4af1-4762-a693-e61c98959270',
    'Saida de 100kg',
    'https://www.w3schools.com/html/mov_bbb.mp4',
    8,
    'Sob 100kg',
    ARRAY['Guarda recuperada'],
    ARRAY[
      'Proteja o pescoço e mantenha os cotovelos juntos.',
      'Crie ângulo colocando um joelho no quadril dele.',
      'Empurre o quadril para o lado oposto.',
      'Recupere a meia-guarda ou guarda fechada.',
      'Recompõe a postura antes de atacar.'
    ]
  )
ON CONFLICT (id) DO UPDATE SET
  week_id       = EXCLUDED.week_id,
  titulo        = EXCLUDED.titulo,
  url_video     = EXCLUDED.url_video,
  ordem         = EXCLUDED.ordem,
  from_position = EXCLUDED.from_position,
  to_positions  = EXCLUDED.to_positions,
  steps         = EXCLUDED.steps;

-- 4. Video/tag junction
--------------------------------------------------------------------------------
INSERT INTO public.video_tags (video_id, tag_id)
SELECT v.id, t.id
FROM public.videos v
JOIN public.tags t ON t.nome_tag = ANY(
  CASE v.titulo
    WHEN 'Passagem básica da meia'      THEN ARRAY['Passagem', 'Meia-guarda']
    WHEN 'Passagem com underhook'        THEN ARRAY['Passagem', 'Meia-guarda']
    WHEN 'Estabilização no 100kg'        THEN ARRAY['Passagem', 'Pesada']
    WHEN 'Finalização da montada'        THEN ARRAY['Finalização', 'Montada']
    WHEN 'Recuperação de guarda'         THEN ARRAY['Guarda', 'Defesa']
    WHEN 'Raspagem de beijo'             THEN ARRAY['Raspagem', 'Meia-guarda']
    WHEN 'Estrangulamento de costas'     THEN ARRAY['Finalização', 'Costas']
    WHEN 'Saida de 100kg'                THEN ARRAY['Defesa', 'Pesada']
  END
)
ON CONFLICT DO NOTHING;

COMMIT;
