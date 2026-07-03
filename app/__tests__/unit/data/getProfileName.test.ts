import type { SupabaseClient } from '@supabase/supabase-js';
import { getProfileName } from '@/src/data/getProfileName';

function createClient(result: { data: unknown }) {
  const maybeSingle = jest.fn(() => Promise.resolve(result));
  const select = jest.fn(() => ({ maybeSingle }));
  const from = jest.fn(() => ({ select }));
  return { client: { from } as unknown as SupabaseClient, from, select };
}

describe('getProfileName', () => {
  it('returns the student name from the profiles row', async () => {
    // Arrange
    const { client, from } = createClient({ data: { nome: 'Rafael' } });

    // Act
    const name = await getProfileName(client);

    // Assert
    expect(from).toHaveBeenCalledWith('profiles');
    expect(name).toBe('Rafael');
  });

  it('returns null when no profile row exists', async () => {
    // Arrange
    const { client } = createClient({ data: null });

    // Act
    const name = await getProfileName(client);

    // Assert
    expect(name).toBeNull();
  });
});
