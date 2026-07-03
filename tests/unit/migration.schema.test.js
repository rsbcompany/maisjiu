const {
  readMigration,
  extractCreateTable,
  extractCreateIndex,
  hasFunctionalTagIndex
} = require('../helpers/migration');

describe('migration SQL schema definition', () => {
  let sql;

  beforeAll(() => {
    sql = readMigration();
  });

  test('migration file exists and is non-empty', () => {
    expect(sql).toBeTruthy();
    expect(sql.length).toBeGreaterThan(0);
  });

  test('helpers return null for missing schema objects', () => {
    expect(extractCreateTable(sql, 'does_not_exist')).toBeNull();
    expect(extractCreateIndex(sql, 'does_not_exist', 'col')).toBeNull();
  });

  test('defines all six MVP tables', () => {
    const tables = ['profiles', 'weeks', 'videos', 'tags', 'video_tags', 'video_views'];
    for (const table of tables) {
      const body = extractCreateTable(sql, table);
      expect(body).not.toBeNull();
      expect(body.length).toBeGreaterThan(0);
    }
  });

  test('videos table includes nullable technique columns', () => {
    const body = extractCreateTable(sql, 'videos');
    expect(body).toMatch(/from_position\s+text/);
    expect(body).toMatch(/to_positions\s+text\[\]/);
    expect(body).toMatch(/steps\s+text\[\]/);

    // None of the technique columns should have NOT NULL.
    const lines = body.split(',').map((s) => s.trim());
    const techniqueLines = lines.filter(
      (line) => /from_position|to_positions|steps/.test(line)
    );
    expect(techniqueLines.length).toBe(3);
    for (const line of techniqueLines) {
      expect(line).not.toMatch(/NOT\s+NULL/i);
    }
  });

  test('profiles.id references auth.users.id', () => {
    const body = extractCreateTable(sql, 'profiles');
    expect(body).toMatch(/id\s+uuid\s+PRIMARY\s+KEY\s+REFERENCES\s+auth\.users\(id\)/i);
  });

  test('videos.week_id references weeks.id', () => {
    const body = extractCreateTable(sql, 'videos');
    expect(body).toMatch(/week_id\s+uuid\s+NOT\s+NULL\s+REFERENCES\s+public\.weeks\(id\)/i);
  });

  test('video_tags has composite primary key on video_id and tag_id', () => {
    const body = extractCreateTable(sql, 'video_tags');
    expect(body).toMatch(/PRIMARY\s+KEY\s*\(\s*video_id\s*,\s*tag_id\s*\)/i);
  });

  test('video_views references auth.users and videos', () => {
    const body = extractCreateTable(sql, 'video_views');
    expect(body).toMatch(/user_id\s+uuid\s+NOT\s+NULL\s+REFERENCES\s+auth\.users\(id\)/i);
    expect(body).toMatch(/video_id\s+uuid\s+NOT\s+NULL\s+REFERENCES\s+public\.videos\(id\)/i);
  });

  test('unaccent extension is enabled', () => {
    expect(sql).toMatch(/CREATE EXTENSION\s+IF NOT EXISTS\s+"?unaccent"?/i);
  });

  test('f_unaccent wrapper is IMMUTABLE', () => {
    expect(sql).toMatch(/CREATE\s+(?:OR REPLACE\s+)?FUNCTION\s+(?:public\.)?f_unaccent\s*\(\s*text\s*\)/i);
    expect(sql).toMatch(/IMMUTABLE/i);
  });

  test('required indexes are declared', () => {
    expect(extractCreateIndex(sql, 'videos', 'week_id')).not.toBeNull();
    expect(extractCreateIndex(sql, 'video_tags', 'tag_id')).not.toBeNull();
    expect(extractCreateIndex(sql, 'video_views', ['user_id', 'watched_at'])).not.toBeNull();
    expect(extractCreateIndex(sql, 'tags', 'nome_tag')).not.toBeNull();
    expect(hasFunctionalTagIndex(sql)).toBe(true);
  });
});
