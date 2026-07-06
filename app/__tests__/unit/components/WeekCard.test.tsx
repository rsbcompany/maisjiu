import { render } from '@testing-library/react-native';
import { WeekCard } from '@/src/components/WeekCard';
import { formatWeekRange } from '@/src/lib/formatWeekRange';

describe('WeekCard', () => {
  it('displays the week title and the formatted date range', () => {
    // Arrange
    const weekDate = formatWeekRange('2026-06-29', '2026-07-05');

    // Act
    const { getByText } = render(
      <WeekCard weekTitle="Passagem da meia-guarda" weekDate={weekDate} />
    );

    // Assert
    expect(getByText('Passagem da meia-guarda')).toBeTruthy();
    expect(getByText('29 jun – 05 jul')).toBeTruthy();
    expect(getByText('Semana Atual')).toBeTruthy();
  });
});
