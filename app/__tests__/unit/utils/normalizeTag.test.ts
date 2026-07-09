import { normalizeTag } from '@/src/utils/normalizeTag';

describe('normalizeTag', () => {
  it('lowercases input', () => {
    expect(normalizeTag('Passagem')).toBe('passagem');
    expect(normalizeTag('PASSAGEM')).toBe('passagem');
  });

  it('strips diacritics', () => {
    expect(normalizeTag('Finalização')).toBe('finalizacao');
    expect(normalizeTag('Meia-guarda')).toBe('meia-guarda');
  });

  it('makes equivalent tags match', () => {
    expect(normalizeTag('Passagem')).toBe(normalizeTag('passagem'));
    expect(normalizeTag('Estrangulamento')).toBe(normalizeTag('estrangulamento'));
  });

  it('returns an empty string for empty input', () => {
    expect(normalizeTag('')).toBe('');
  });
});
