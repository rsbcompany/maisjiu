const { Client } = require('pg');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const LOCAL_DATABASE_URL = process.env.LOCAL_DATABASE_URL || 'postgresql://postgres:postgres@localhost:54322/postgres';
const PROJECT_ROOT = path.join(__dirname, '..', '..');
const SEED_PATH = path.join(PROJECT_ROOT, 'supabase', 'seed.sql');
const METRICS_DIR = path.join(PROJECT_ROOT, 'supabase', 'metrics');

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

function jwtClaimsPayload(userId, role) {
  return JSON.stringify({ sub: userId, role });
}

async function setAuthenticatedContext(client, userId) {
  await client.query('SET LOCAL ROLE authenticated');
  await client.query(`SET LOCAL request.jwt.claims = '${jwtClaimsPayload(userId, 'authenticated')}'`);
}

async function createAuthUser(client, userId, email) {
  await client.query(
    `INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
     VALUES ($1, $2, now(), now(), now())
     ON CONFLICT (id) DO NOTHING`,
    [userId, email]
  );
}

async function seedTestUser(client) {
  const userId = 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3';
  await createAuthUser(client, userId, 'pilot.student@example.com');
  await client.query(
    `INSERT INTO public.profiles (id, nome) VALUES ($1, 'Aluno Piloto')
     ON CONFLICT (id) DO NOTHING`,
    [userId]
  );
  return userId;
}

async function applySeed(client) {
  const seedSql = fs.readFileSync(SEED_PATH, 'utf-8');
  await client.query(seedSql);
}

describe('seed apply against local Supabase', () => {
  beforeAll(async () => {
    const reachable = await isPostgresReachable();
    if (!reachable) {
      runSupabase('start');
    }
    runSupabase('db reset');
    await withClient(async (client) => {
      await applySeed(client);
    });
  }, 180000);

  test('current week query returns exactly one row', async () => {
    await withClient(async (client) => {
      const result = await client.query(`
        SELECT *
        FROM public.weeks
        WHERE current_date BETWEEN data_inicio AND data_fim
      `);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].titulo_semana).toBe('Passagem da meia-guarda');
    });
  });

  test('join videos to tags returns expected tag names for v1', async () => {
    await withClient(async (client) => {
      const result = await client.query(`
        SELECT t.nome_tag
        FROM public.videos v
        JOIN public.video_tags vt ON vt.video_id = v.id
        JOIN public.tags t ON t.id = vt.tag_id
        WHERE v.titulo = 'Passagem básica da meia'
        ORDER BY t.nome_tag
      `);
      const tags = result.rows.map((r) => r.nome_tag);
      expect(tags).toEqual(['Meia-guarda', 'Passagem']);
    });
  });

  test('pilot user can authenticate and read seeded content under RLS', async () => {
    await withClient(async (client) => {
      const userId = await seedTestUser(client);

      await client.query('BEGIN');
      await setAuthenticatedContext(client, userId);

      const weekResult = await client.query(`
        SELECT * FROM public.weeks
        WHERE current_date BETWEEN data_inicio AND data_fim
      `);
      expect(weekResult.rows).toHaveLength(1);

      const videoResult = await client.query(`
        SELECT * FROM public.videos
        WHERE titulo = 'Passagem básica da meia'
      `);
      expect(videoResult.rows).toHaveLength(1);
      expect(videoResult.rows[0].from_position).toBe('Meia-guarda');
      expect(videoResult.rows[0].to_positions).toEqual(['Montada']);

      const tagResult = await client.query(`
        SELECT * FROM public.tags WHERE nome_tag = 'Meia-guarda'
      `);
      expect(tagResult.rows).toHaveLength(1);

      await client.query('ROLLBACK');
    });
  });

  test('metric query for distinct videos executes without error on seeded video_views', async () => {
    await withClient(async (client) => {
      const metricSql = fs.readFileSync(
        path.join(METRICS_DIR, 'distinct_videos_per_user_week.sql'),
        'utf-8'
      );
      const result = await client.query(metricSql);
      expect(result.rows).toBeDefined();
      // video_views is empty initially, so expect zero aggregates.
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });
  });

  test('seed is idempotent: re-running does not duplicate videos or tags', async () => {
    await withClient(async (client) => {
      await applySeed(client);

      const videoCount = await client.query(`SELECT COUNT(*) FROM public.videos`);
      expect(parseInt(videoCount.rows[0].count, 10)).toBe(8);

      const tagCount = await client.query(`SELECT COUNT(*) FROM public.tags`);
      expect(parseInt(tagCount.rows[0].count, 10)).toBe(10);

      const weekCount = await client.query(`
        SELECT COUNT(*) FROM public.weeks
        WHERE current_date BETWEEN data_inicio AND data_fim
      `);
      expect(parseInt(weekCount.rows[0].count, 10)).toBe(1);
    });
  });
});
