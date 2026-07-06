describe('supabase client module', () => {
  const originalUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  afterEach(() => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = originalKey;
    jest.resetModules();
  });

  it('creates the client with the public URL and the anon key only', () => {
    // Arrange — only public env vars are available to the client bundle
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://project.supabase.co';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'anon-test-key';
    const createClient = jest.fn((_url: string, _key: string, _options?: unknown) => ({ auth: {} }));

    // Act
    jest.isolateModules(() => {
      jest.doMock('@supabase/supabase-js', () => ({ createClient }));
      jest.requireActual('../../../src/lib/supabase');
    });

    // Assert — the second argument is the anon key, never a service-role key
    expect(createClient).toHaveBeenCalledTimes(1);
    const [url, key] = createClient.mock.calls[0];
    expect(url).toBe('https://project.supabase.co');
    expect(key).toBe('anon-test-key');
  });

  it('persists the session in secure storage with auto-refresh enabled', () => {
    // Arrange
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://project.supabase.co';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'anon-test-key';
    const createClient = jest.fn((_url: string, _key: string, _options?: unknown) => ({ auth: {} }));

    // Act
    jest.isolateModules(() => {
      jest.doMock('@supabase/supabase-js', () => ({ createClient }));
      jest.requireActual('../../../src/lib/supabase');
    });

    // Assert
    const options = createClient.mock.calls[0][2] as { auth?: Record<string, unknown> };
    expect(options.auth).toEqual(
      expect.objectContaining({
        autoRefreshToken: true,
        persistSession: true,
        storage: expect.anything(),
      })
    );
  });
});
