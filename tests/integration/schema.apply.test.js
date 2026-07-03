const { Client } = require('pg');
const { execSync } = require('child_process');
const path = require('path');

const LOCAL_DATABASE_URL = process.env.LOCAL_DATABASE_URL || 'postgresql://postgres:postgres@localhost:54322/postgres';
const PROJECT_ROOT = path.join(__dirname, '..', '..');

function runSupabase(command, options = {}) {
  const cwd = options.cwd || PROJECT_ROOT;
  const env = { ...process.env, ...options.env };
  return execSync(`npx supabase ${command}`, { cwd, env, encoding: 'utf-8', stdio: 'pipe' });
}

async function isPostgresReachable() {
  const client = new Client({ connectionString: LOCAL_DATABASE_URL, connectionTimeoutMillis: 2000 });
  try {
    await client.connect();
    await client.query('SELECT 1');
    await client.end();
    return true;
  } catch {
    return false;
  }
}

async function withClient(fn) {
  const client = new Client({ connectionString: LOCAL_DATABASE_URL });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

describe('schema apply against local Supabase', () => {
  beforeAll(async () => {
    const reachable = await isPostgresReachable();
    if (!reachable) {
      // Start local Supabase stack; this may take a while on first run.
      runSupabase('start');
    }
    // Reset and apply all migrations to guarantee a clean schema.
    runSupabase('db reset');
  }, 180000);

  test('SELECT from each MVP table succeeds', async () => {
    const tables = ['profiles', 'weeks', 'videos', 'tags', 'video_tags', 'video_views'];
    await withClient(async (client) => {
      for (const table of tables) {
        const result = await client.query(`SELECT * FROM public.${table} LIMIT 1`);
        expect(result.rows).toBeDefined();
      }
    });
  });

  test('videos table has nullable technique columns', async () => {
    await withClient(async (client) => {
      const result = await client.query(`
        SELECT column_name, is_nullable, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'videos'
          AND column_name IN ('from_position', 'to_positions', 'steps')
        ORDER BY column_name
      `);
      const columns = result.rows.map((r) => ({
        name: r.column_name,
        nullable: r.is_nullable,
        type: r.data_type
      }));

      expect(columns).toHaveLength(3);
      for (const col of columns) {
        expect(col.nullable).toBe('YES');
      }

      const types = Object.fromEntries(columns.map((c) => [c.name, c.type]));
      expect(types.from_position).toBe('text');
      expect(types.to_positions).toBe('ARRAY');
      expect(types.steps).toBe('ARRAY');
    });
  });

  test('profiles.id has foreign key to auth.users.id', async () => {
    await withClient(async (client) => {
      const result = await client.query(`
        SELECT
          c.conname AS constraint_name,
          a.attname AS column_name,
          af.attrelid::regclass::text AS foreign_table,
          af.attname AS foreign_column
        FROM pg_constraint AS c
        JOIN pg_attribute AS a
          ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
        JOIN pg_attribute AS af
          ON af.attrelid = c.confrelid AND af.attnum = ANY(c.confkey)
        WHERE c.contype = 'f'
          AND c.conrelid = 'public.profiles'::regclass
          AND a.attname = 'id'
      `);
      expect(result.rows).toHaveLength(1);
      const fk = result.rows[0];
      expect(fk.foreign_table).toBe('auth.users');
      expect(fk.foreign_column).toBe('id');
    });
  });

  test('f_unaccent normalizes accented characters', async () => {
    await withClient(async (client) => {
      const result = await client.query(`SELECT public.f_unaccent('Ação') AS normalized`);
      expect(result.rows[0].normalized).toBe('Acao');
    });
  });

  test('tag lookup uses lower(f_unaccent(nome_tag)) functional index', async () => {
    await withClient(async (client) => {
      await client.query("INSERT INTO public.tags (nome_tag) VALUES ('Ação Teste')");

      const explain = await client.query(`
        EXPLAIN (FORMAT TEXT)
        SELECT * FROM public.tags
        WHERE lower(public.f_unaccent(nome_tag)) = lower(public.f_unaccent('acao teste'))
      `);
      const plan = explain.rows.map((r) => r['QUERY PLAN']).join('\n');
      expect(plan).toMatch(/idx_tags_nome_norm/i);

      await client.query("DELETE FROM public.tags WHERE nome_tag = 'Ação Teste'");
    });
  });

  test('tags unique nome_tag constraint rejects duplicates', async () => {
    await withClient(async (client) => {
      await client.query("INSERT INTO public.tags (nome_tag) VALUES ('roundtrip')");

      const before = await client.query("SELECT * FROM public.tags WHERE nome_tag = 'roundtrip'");
      expect(before.rows).toHaveLength(1);

      await expect(
        client.query("INSERT INTO public.tags (nome_tag) VALUES ('roundtrip')")
      ).rejects.toThrow(/unique/i);

      await client.query("DELETE FROM public.tags WHERE nome_tag = 'roundtrip'");
      const after = await client.query("SELECT * FROM public.tags WHERE nome_tag = 'roundtrip'");
      expect(after.rows).toHaveLength(0);
    });
  });

  test('required indexes exist in the database', async () => {
    await withClient(async (client) => {
      const result = await client.query(`
        SELECT indexname
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND indexname IN (
            'idx_videos_week_id',
            'idx_video_tags_tag_id',
            'idx_video_views_user_watched',
            'idx_tags_nome_tag',
            'idx_tags_nome_norm'
          )
      `);
      const names = result.rows.map((r) => r.indexname);
      expect(names).toContain('idx_videos_week_id');
      expect(names).toContain('idx_video_tags_tag_id');
      expect(names).toContain('idx_video_views_user_watched');
      expect(names).toContain('idx_tags_nome_tag');
      expect(names).toContain('idx_tags_nome_norm');
    });
  });
});
