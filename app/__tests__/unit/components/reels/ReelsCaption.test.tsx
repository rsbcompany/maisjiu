import { StyleSheet } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { colors } from '@/src/theme/colors';
import { ReelsCaption } from '@/src/components/reels/ReelsCaption';

const steps = ['Passo 1', 'Passo 2', 'Passo 3', 'Passo 4', 'Passo 5'];

describe('ReelsCaption', () => {
  it('renders exactly 2 step items when collapsed with 5 steps', () => {
    // Arrange & Act
    const { getAllByTestId } = render(
      <ReelsCaption fromPosition="Meia-guarda" toPositions={['Montada']} steps={steps} expanded={false} onToggle={jest.fn()} />
    );

    // Assert
    expect(getAllByTestId(/^reels-step-/)).toHaveLength(2);
  });

  it('renders all steps when expanded', () => {
    // Arrange & Act
    const { getAllByTestId } = render(
      <ReelsCaption fromPosition="Meia-guarda" toPositions={['Montada']} steps={steps} expanded onToggle={jest.fn()} />
    );

    // Assert
    expect(getAllByTestId(/^reels-step-/)).toHaveLength(5);
  });

  it('calls onToggle when the "Ver mais" button is pressed', () => {
    // Arrange
    const onToggle = jest.fn();
    const { getByTestId, getByText } = render(
      <ReelsCaption fromPosition="Meia-guarda" toPositions={['Montada']} steps={steps} expanded={false} onToggle={onToggle} />
    );

    // Act
    expect(getByText('Ver mais')).toBeTruthy();
    fireEvent.press(getByTestId('reels-more'));

    // Assert
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('shows the "Ver menos" label when expanded', () => {
    // Arrange & Act
    const { getByText } = render(
      <ReelsCaption fromPosition="Meia-guarda" toPositions={['Montada']} steps={steps} expanded onToggle={jest.fn()} />
    );

    // Assert
    expect(getByText('Ver menos')).toBeTruthy();
  });

  it('joins multiple destination positions with " / "', () => {
    // Arrange & Act
    const { getByText } = render(
      <ReelsCaption fromPosition="Meia-guarda" toPositions={['100kg', 'Montada']} steps={steps} expanded={false} onToggle={jest.fn()} />
    );

    // Assert
    expect(getByText('100kg / Montada')).toBeTruthy();
  });

  it('hides decomposition and steps when no technique metadata is present', () => {
    // Arrange & Act
    const { queryByTestId } = render(<ReelsCaption expanded={false} onToggle={jest.fn()} />);

    // Assert
    expect(queryByTestId('reels-decomp')).toBeNull();
    expect(queryByTestId('reels-steps')).toBeNull();
  });

  it('hides the toggle when there are 2 or fewer steps', () => {
    // Arrange & Act
    const { queryByTestId } = render(
      <ReelsCaption fromPosition="Meia-guarda" toPositions={['Montada']} steps={['Passo 1', 'Passo 2']} expanded={false} onToggle={jest.fn()} />
    );

    // Assert
    expect(queryByTestId('reels-more')).toBeNull();
  });

  it('applies the accent color token to the De→Para arrow only', () => {
    // Arrange & Act
    const { getByTestId } = render(
      <ReelsCaption fromPosition="Meia-guarda" toPositions={['Montada']} steps={steps} expanded={false} onToggle={jest.fn()} />
    );

    // Assert
    const arrowStyle = StyleSheet.flatten(getByTestId('reels-arrow').props.style);
    expect(arrowStyle.color).toBe(colors.accent);
  });
});
