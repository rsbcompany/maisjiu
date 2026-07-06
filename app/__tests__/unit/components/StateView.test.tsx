import { render } from '@testing-library/react-native';
import { StateView } from '@/src/components/StateView';

describe('StateView', () => {
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

  it('renders error state without description', () => {
    const { getByText, queryByText } = render(
      <StateView variant="error" title="Erro ao carregar" />
    );

    expect(getByText('Erro ao carregar')).toBeTruthy();
    expect(queryByText('Alguma descrição')).toBeNull();
  });

  it('renders loading state', () => {
    const { getByText } = render(<StateView variant="loading" title="Carregando..." />);
    expect(getByText('Carregando...')).toBeTruthy();
  });
});
