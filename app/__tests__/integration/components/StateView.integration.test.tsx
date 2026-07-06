import { render } from '@testing-library/react-native';
import { View } from 'react-native';
import { StateView } from '@/src/components/StateView';
import { Caption } from '@/src/components/Caption';

describe('StateView integration', () => {
  it('renders empty state title and description from props', () => {
    const { getByText } = render(
      <StateView
        variant="empty"
        title="Nenhum vídeo encontrado"
        description="Tente outra tag ou selecione um dos chips acima."
      />
    );

    expect(getByText('Nenhum vídeo encontrado')).toBeTruthy();
    expect(getByText('Tente outra tag ou selecione um dos chips acima.')).toBeTruthy();
  });

  it('composes with Caption in a search empty state', () => {
    const { getByText } = render(
      <View>
        <Caption>Resultados</Caption>
        <StateView
          variant="empty"
          title="Nenhum vídeo encontrado"
          description="Tente outra tag."
        />
      </View>
    );

    expect(getByText('Resultados')).toBeTruthy();
    expect(getByText('Nenhum vídeo encontrado')).toBeTruthy();
  });
});
