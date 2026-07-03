import { getGreeting } from '@/src/lib/greeting';

function dateAtHour(hour: number): Date {
  const date = new Date('2026-07-03T00:00:00');
  date.setHours(hour);
  return date;
}

describe('getGreeting', () => {
  it('returns "Bom dia" before noon', () => {
    expect(getGreeting(dateAtHour(9))).toBe('Bom dia');
  });

  it('returns "Boa tarde" between noon and 18h', () => {
    expect(getGreeting(dateAtHour(14))).toBe('Boa tarde');
  });

  it('returns "Boa noite" from 18h onward', () => {
    expect(getGreeting(dateAtHour(20))).toBe('Boa noite');
  });

  it('treats midnight as morning (boundary)', () => {
    expect(getGreeting(dateAtHour(0))).toBe('Bom dia');
  });
});
