import { fireEvent, render } from '@testing-library/react-native';
import type { VideoWithTags } from '@/src/data/VideoWithTags';
import { Carousel, getCarouselFadeOpacity } from '@/src/components/Carousel';

function makeVideo(id: string, titulo: string): VideoWithTags {
  return { id, weekId: 'w1', titulo, urlVideo: `https://cdn/${id}.mp4`, ordem: 1, tags: [] };
}

const videos = [makeVideo('v1', 'Vídeo 1'), makeVideo('v2', 'Vídeo 2'), makeVideo('v3', 'Vídeo 3')];

describe('getCarouselFadeOpacity', () => {
  it('is 0 when the scroll offset reaches the end within tolerance', () => {
    // maxScroll = 1000 - 400 = 600; offset 595 >= 600 - 6
    expect(getCarouselFadeOpacity({ offset: 595, contentWidth: 1000, layoutWidth: 400 })).toBe(0);
  });

  it('is 1 while there is more content to the right', () => {
    expect(getCarouselFadeOpacity({ offset: 0, contentWidth: 1000, layoutWidth: 400 })).toBe(1);
  });

  it('is 0 when the content fits within the viewport (nothing to scroll)', () => {
    expect(getCarouselFadeOpacity({ offset: 0, contentWidth: 300, layoutWidth: 400 })).toBe(0);
  });
});

describe('Carousel', () => {
  it('renders a card per video', () => {
    // Arrange / Act
    const { getByTestId } = render(
      <Carousel videos={videos} onCardPress={jest.fn()} testID="carousel" />
    );

    // Assert
    expect(getByTestId('video-card-v1')).toBeTruthy();
    expect(getByTestId('video-card-v3')).toBeTruthy();
  });

  it('handles a scroll-to-end event without crashing', () => {
    // Arrange
    const { getByTestId } = render(
      <Carousel videos={videos} onCardPress={jest.fn()} testID="carousel" />
    );

    // Act
    fireEvent.scroll(getByTestId('carousel'), {
      nativeEvent: {
        contentOffset: { x: 600 },
        contentSize: { width: 1000, height: 0 },
        layoutMeasurement: { width: 400, height: 0 },
      },
    });

    // Assert
    expect(getByTestId('video-card-v2')).toBeTruthy();
  });
});
