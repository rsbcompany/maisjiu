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

function jwtClaimsPayload(userId, role) {
  return JSON.stringify({ sub: userId, role });
}

async function setAuthenticatedContext(client, userId) {
  await client.query('SET LOCAL ROLE authenticated');
  await client.query(`SET LOCAL request.jwt.claims = '${jwtClaimsPayload(userId, 'authenticated')}'`);
}

async function setAnonContext(client) {
  await client.query('SET LOCAL ROLE anon');
  await client.query(`SET LOCAL request.jwt.claims = '${jwtClaimsPayload(null, 'anon')}'`);
}

async function createAuthUser(client, userId, email) {
  await client.query(
    `INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
     VALUES ($1, $2, now(), now(), now())
     ON CONFLICT (id) DO NOTHING`,
    [userId, email]
  );
}

async function seedTestData(client) {
  const studentA = 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1';
  const studentB = 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2';

  await createAuthUser(client, studentA, 'student.a@example.com');
  await createAuthUser(client, studentB, 'student.b@example.com');

  await client.query(
    `INSERT INTO public.profiles (id, nome)
     VALUES ($1, 'Aluno A'), ($2, 'Aluno B')
     ON CONFLICT (id) DO NOTHING`,
    [studentA, studentB]
  );

  const weekResult = await client.query(
    `INSERT INTO public.weeks (titulo_semana, data_inicio, data_fim)
     VALUES ('Semana Piloto', current_date - 1, current_date + 5)
     RETURNING id`
  );
  const weekId = weekResult.rows[0].id;

  const videoResult = await client.query(
    `INSERT INTO public.videos (week_id, titulo, url_video, ordem)
     VALUES ($1, 'Passagem da meia-guarda', 'https://example.com/video.mp4', 1)
     RETURNING id`,
    [weekId]
  );
  const videoId = videoResult.rows[0].id;

  const tagResult = await client.query(
    `INSERT INTO public.tags (nome_tag) VALUES ('Meia-guarda-rls-test') RETURNING id`
  );
  const tagId = tagResult.rows[0].id;

  await client.query(
    `INSERT INTO public.video_tags (video_id, tag_id) VALUES ($1, $2)`,
    [videoId, tagId]
  );

  return { studentA, studentB, weekId, videoId, tagId };
}

describe('RLS policies against local Supabase', () => {
  let testData;

  beforeAll(async () => {
    const reachable = await isPostgresReachable();
    if (!reachable) {
      runSupabase('start');
    }
    runSupabase('db reset');

    await withClient(async (client) => {
      testData = await seedTestData(client);
    });
  }, 180000);

  test('authenticated user can SELECT current week and videos', async () => {
    await withClient(async (client) => {
      await client.query('BEGIN');
      await setAuthenticatedContext(client, testData.studentA);

      const weekResult = await client.query(
        `SELECT * FROM public.weeks WHERE id = $1`,
        [testData.weekId]
      );
      expect(weekResult.rows).toHaveLength(1);

      const videoResult = await client.query(
        `SELECT * FROM public.videos WHERE id = $1`,
        [testData.videoId]
      );
      expect(videoResult.rows).toHaveLength(1);

      const tagResult = await client.query(
        `SELECT * FROM public.tags WHERE id = $1`,
        [testData.tagId]
      );
      expect(tagResult.rows).toHaveLength(1);

      await client.query('ROLLBACK');
    });
  });

  test('authenticated user can read only their own profile', async () => {
    await withClient(async (client) => {
      await client.query('BEGIN');
      await setAuthenticatedContext(client, testData.studentA);

      const ownProfile = await client.query(`SELECT * FROM public.profiles WHERE id = $1`, [testData.studentA]);
      expect(ownProfile.rows).toHaveLength(1);
      expect(ownProfile.rows[0].nome).toBe('Aluno A');

      const otherProfile = await client.query(`SELECT * FROM public.profiles WHERE id = $1`, [testData.studentB]);
      expect(otherProfile.rows).toHaveLength(0);

      await client.query('ROLLBACK');
    });
  });

  test('authenticated user can INSERT video_views for self', async () => {
    await withClient(async (client) => {
      await client.query('BEGIN');
      await setAuthenticatedContext(client, testData.studentA);

      const result = await client.query(
        `INSERT INTO public.video_views (user_id, video_id) VALUES ($1, $2) RETURNING id`,
        [testData.studentA, testData.videoId]
      );
      expect(result.rows).toHaveLength(1);

      const views = await client.query(`SELECT * FROM public.video_views WHERE user_id = $1`, [testData.studentA]);
      expect(views.rows).toHaveLength(1);

      await client.query('ROLLBACK');
    });
  });

  test('authenticated user cannot set arbitrary user_id on video_views', async () => {
    await withClient(async (client) => {
      await client.query('BEGIN');
      await setAuthenticatedContext(client, testData.studentA);

      await expect(
        client.query(
          `INSERT INTO public.video_views (user_id, video_id) VALUES ($1, $2)`,
          [testData.studentB, testData.videoId]
        )
      ).rejects.toThrow();

      await client.query('ROLLBACK');
    });
  });

  test('anonymous role cannot INSERT into video_views', async () => {
    await withClient(async (client) => {
      await client.query('BEGIN');
      await setAnonContext(client);

      await expect(
        client.query(
          `INSERT INTO public.video_views (user_id, video_id) VALUES ($1, $2)`,
          [testData.studentA, testData.videoId]
        )
      ).rejects.toThrow();

      await client.query('ROLLBACK');
    });
  });

  test('anonymous role cannot SELECT content tables', async () => {
    await withClient(async (client) => {
      await client.query('BEGIN');
      await setAnonContext(client);

      await expect(client.query(`SELECT * FROM public.weeks LIMIT 1`)).rejects.toThrow();
      await expect(client.query(`SELECT * FROM public.videos LIMIT 1`)).rejects.toThrow();
      await expect(client.query(`SELECT * FROM public.tags LIMIT 1`)).rejects.toThrow();

      await client.query('ROLLBACK');
    });
  });

  test('authenticated user cannot SELECT another user video_views rows', async () => {
    await withClient(async (client) => {
      // Seed a view for student B as postgres (bypass RLS).
      await client.query(
        `INSERT INTO public.video_views (user_id, video_id) VALUES ($1, $2)`,
        [testData.studentB, testData.videoId]
      );

      await client.query('BEGIN');
      await setAuthenticatedContext(client, testData.studentA);

      const ownViews = await client.query(`SELECT * FROM public.video_views WHERE user_id = $1`, [testData.studentA]);
      expect(ownViews.rows).toHaveLength(0);

      const otherViews = await client.query(`SELECT * FROM public.video_views WHERE user_id = $1`, [testData.studentB]);
      expect(otherViews.rows).toHaveLength(0);

      const allViews = await client.query(`SELECT * FROM public.video_views`);
      expect(allViews.rows).toHaveLength(0);

      await client.query('ROLLBACK');

      // Clean up the seeded view.
      await client.query(`DELETE FROM public.video_views WHERE user_id = $1`, [testData.studentB]);
    });
  });
});
