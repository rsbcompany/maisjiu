import { fireEvent, render } from '@testing-library/react-native';
import { FeedItem } from '@/src/components/FeedItem';
import type { VideoWithTags } from '@/src/data/VideoWithTags';

function makeVideo(): VideoWithTags {
  return {
    id: 'v1',
    weekId: 'w1',
    titulo: 'Passagem básica da meia',
    urlVideo: 'https://cdn/v1.mp4',
    ordem: 1,
    tags: [
      { id: 't1', nomeTag: 'Passagem' },
      { id: 't2', nomeTag: 'Meia-guarda' },
    ],
  };
}

describe('FeedItem', () => {
  it('renders the video title and tags', () => {
    const { getByText } = render(<FeedItem video={makeVideo()} onPress={jest.fn()} />);

    expect(getByText('Passagem básica da meia')).toBeTruthy();
    expect(getByText('Passagem')).toBeTruthy();
    expect(getByText('Meia-guarda')).toBeTruthy();
  });

  it('calls onPress with the video id when pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <FeedItem video={makeVideo()} onPress={onPress} testID="feed-item-v1" />
    );

    fireEvent.press(getByTestId('feed-item-v1'));

    expect(onPress).toHaveBeenCalledWith('v1');
  });
});
