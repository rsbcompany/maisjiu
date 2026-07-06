const MONTHS_PT = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
] as const;

/**
 * Formats an ISO date range into the prototype's week label style
 * (e.g. "29 jun – 05 jul"). Parses the date parts directly to avoid timezone
 * shifts from `Date` construction.
 */
export function formatWeekRange(dataInicio: string, dataFim: string): string {
  return `${formatDay(dataInicio)} – ${formatDay(dataFim)}`;
}

function formatDay(isoDate: string): string {
  const [, month, day] = isoDate.split('-').map(Number);
  return `${String(day).padStart(2, '0')} ${MONTHS_PT[month - 1] ?? ''}`.trim();
}
