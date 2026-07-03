const fs = require('fs');
const path = require('path');

const SEED_PATH = path.join(__dirname, '..', '..', 'supabase', 'seed.sql');
const METRICS_DIR = path.join(__dirname, '..', '..', 'supabase', 'metrics');

const CANONICAL_TAGS = [
  'Passagem',
  'Meia-guarda',
  'Finalização',
  'Montada',
  'Guarda',
  'Defesa',
  'Raspagem',
  'Estrangulamento',
  'Pesada',
  'Costas'
];

function readSeed() {
  return fs.readFileSync(SEED_PATH, 'utf-8');
}

describe('pilot seed SQL structure', () => {
  let sql;

  beforeAll(() => {
    sql = readSeed();
  });

  test('seed file exists and is non-empty', () => {
    expect(sql).toBeTruthy();
    expect(sql.length).toBeGreaterThan(0);
  });

  test('inserts exactly one current week row where current_date is between data_inicio and data_fim', () => {
    const weekMatch = sql.match(
      /INSERT\s+INTO\s+public\.weeks\s*\((.*?)\)\s*VALUES\s*\((.*?)\)\s*ON\s+CONFLICT/is
    );
    expect(weekMatch).not.toBeNull();

    const values = weekMatch[2];
    const dateMatch = values.match(
      /current_date\s*-\s*(\d+)\s*,\s*current_date\s*\+\s*(\d+)/i
    );
    expect(dateMatch).not.toBeNull();
    const startOffset = parseInt(dateMatch[1], 10);
    const endOffset = parseInt(dateMatch[2], 10);

    // current_date must fall strictly between the bounds.
    expect(startOffset).toBeGreaterThan(0);
    expect(endOffset).toBeGreaterThan(0);
  });

  test('seed includes 8 videos with non-null ordem within the week', () => {
    const videoInserts = sql.match(/INSERT\s+INTO\s+public\.videos\s*\(/is);
    expect(videoInserts).not.toBeNull();

    const valueBlocks = sql.match(/'[a-f0-9-]{36}',\s*'[a-f0-9-]{36}',\s*'[^']+',\s*'[^']+',\s*\d+/g);
    expect(valueBlocks).toHaveLength(8);

    const orders = valueBlocks.map((block) => {
      const match = block.match(/,\s*(\d+)\s*$/);
      return parseInt(match[1], 10);
    });
    const sorted = [...orders].sort((a, b) => a - b);
    expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  test('at least one video has to_positions array length > 1', () => {
    const multiDestinationMatches = sql.match(/ARRAY\s*\[[^\]]+'[^']+'[^\]]+'[^']+'[^\]]*\]/g);
    expect(multiDestinationMatches).not.toBeNull();
    expect(multiDestinationMatches.length).toBeGreaterThanOrEqual(1);
  });

  test('all canonical tags from design doc appear in tags table', () => {
    const tagInsertMatch = sql.match(/INSERT\s+INTO\s+public\.tags\s*\(nome_tag\)\s*VALUES\s*\((.*?)\)\s*ON\s+CONFLICT/is);
    expect(tagInsertMatch).not.toBeNull();
    const tagBlock = tagInsertMatch[1];

    for (const tag of CANONICAL_TAGS) {
      expect(tagBlock).toContain(`'${tag}'`);
    }
  });

  test('metric SQL files exist for all required metrics', () => {
    const required = [
      'distinct_videos_per_user_week.sql',
      'total_views_per_user_week.sql',
      'distribution.sql',
      'recurrence.sql',
      'pre_post_class.sql'
    ];

    for (const filename of required) {
      const filePath = path.join(METRICS_DIR, filename);
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content.length).toBeGreaterThan(0);
    }
  });
});
