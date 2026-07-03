const MORNING_END_HOUR = 12;
const AFTERNOON_END_HOUR = 18;

/**
 * Returns a time-of-day greeting in Portuguese, matching the tone of
 * `prototipo/home.html` ("Bom dia,"). Splits the day into morning,
 * afternoon and evening.
 */
export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < MORNING_END_HOUR) return 'Bom dia';
  if (hour < AFTERNOON_END_HOUR) return 'Boa tarde';
  return 'Boa noite';
}
