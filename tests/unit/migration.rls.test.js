const {
  readRlsMigration,
  hasRlsEnabled,
  extractPolicy,
  hasGrant,
  hasRevoke
} = require('../helpers/migration');

describe('RLS migration SQL definition', () => {
  let sql;

  beforeAll(() => {
    sql = readRlsMigration();
  });

  test('migration file exists and is non-empty', () => {
    expect(sql).toBeTruthy();
    expect(sql.length).toBeGreaterThan(0);
  });

  test('enables RLS on all MVP tables', () => {
    const tables = ['profiles', 'weeks', 'videos', 'tags', 'video_tags', 'video_views'];
    for (const table of tables) {
      expect(hasRlsEnabled(sql, table)).toBe(true);
    }
  });

  test('forces RLS on all MVP tables', () => {
    const tables = ['profiles', 'weeks', 'videos', 'tags', 'video_tags', 'video_views'];
    for (const table of tables) {
      const pattern = new RegExp(
        `alter\\s+table\\s+(?:public\\.)?${table}\\s+force\\s+row\\s+level\\s+security`,
        'i'
      );
      expect(sql).toMatch(pattern);
    }
  });

  test('content tables have SELECT policy for authenticated role', () => {
    const tables = ['weeks', 'videos', 'tags', 'video_tags'];
    for (const table of tables) {
      const policy = extractPolicy(sql, table, 'select');
      expect(policy).not.toBeNull();
      expect(policy.to).toMatch(/authenticated/);
      expect(policy.using).toBe('true');
    }
  });

  test('profiles SELECT policy restricts to own row', () => {
    const policy = extractPolicy(sql, 'profiles', 'select');
    expect(policy).not.toBeNull();
    expect(policy.to).toMatch(/authenticated/);
    expect(policy.using).toMatch(/auth\.uid\(\)/);
  });

  test('video_views INSERT policy references auth.uid() in WITH CHECK', () => {
    const policy = extractPolicy(sql, 'video_views', 'insert');
    expect(policy).not.toBeNull();
    expect(policy.to).toMatch(/authenticated/);
    expect(policy.withCheck).toMatch(/auth\.uid\(\)/);
    expect(policy.withCheck).toMatch(/user_id/);
  });

  test('video_views SELECT policy references auth.uid()', () => {
    const policy = extractPolicy(sql, 'video_views', 'select');
    expect(policy).not.toBeNull();
    expect(policy.to).toMatch(/authenticated/);
    expect(policy.using).toMatch(/auth\.uid\(\)/);
    expect(policy.using).toMatch(/user_id/);
  });

  test('no policy grants UPDATE or DELETE on content tables to students', () => {
    const contentTables = ['weeks', 'videos', 'tags', 'video_tags', 'profiles'];
    for (const table of contentTables) {
      const updatePolicy = extractPolicy(sql, table, 'update');
      const deletePolicy = extractPolicy(sql, table, 'delete');
      expect(updatePolicy).toBeNull();
      expect(deletePolicy).toBeNull();
    }
  });

  test('video_views has no UPDATE or DELETE policy for students', () => {
    const updatePolicy = extractPolicy(sql, 'video_views', 'update');
    const deletePolicy = extractPolicy(sql, 'video_views', 'delete');
    expect(updatePolicy).toBeNull();
    expect(deletePolicy).toBeNull();
  });

  test('grants SELECT on content tables to authenticated role', () => {
    const tables = ['weeks', 'videos', 'tags', 'video_tags', 'profiles'];
    for (const table of tables) {
      expect(hasGrant(sql, table, 'select', 'authenticated')).toBe(true);
    }
  });

  test('grants SELECT and INSERT on video_views to authenticated role', () => {
    expect(hasGrant(sql, 'video_views', 'select', 'authenticated')).toBe(true);
    expect(hasGrant(sql, 'video_views', 'insert', 'authenticated')).toBe(true);
  });

  test('revokes UPDATE and DELETE on content tables from authenticated role', () => {
    const tables = ['weeks', 'videos', 'tags', 'video_tags', 'profiles'];
    for (const table of tables) {
      expect(hasRevoke(sql, table, 'update', 'authenticated')).toBe(true);
      expect(hasRevoke(sql, table, 'delete', 'authenticated')).toBe(true);
      expect(hasRevoke(sql, table, 'insert', 'authenticated')).toBe(true);
    }
  });

  test('revokes UPDATE and DELETE on video_views from authenticated role', () => {
    expect(hasRevoke(sql, 'video_views', 'update', 'authenticated')).toBe(true);
    expect(hasRevoke(sql, 'video_views', 'delete', 'authenticated')).toBe(true);
  });
});
