import { formatWeekRange } from '@/src/lib/formatWeekRange';

describe('formatWeekRange', () => {
  it('formats a week range as "DD mmm – DD mmm" in Portuguese', () => {
    expect(formatWeekRange('2026-06-29', '2026-07-05')).toBe('29 jun – 05 jul');
  });

  it('pads single-digit days with a leading zero', () => {
    expect(formatWeekRange('2026-01-05', '2026-01-09')).toBe('05 jan – 09 jan');
  });

  it('handles December (last month index)', () => {
    expect(formatWeekRange('2026-12-28', '2027-01-03')).toBe('28 dez – 03 jan');
  });
});
