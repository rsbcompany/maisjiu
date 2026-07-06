import type { UUID } from './UUID';
import type { Tag } from './Tag';

export interface VideoWithTags {
  id: UUID;
  weekId: UUID;
  titulo: string;
  urlVideo: string;
  ordem: number;
  tags: Tag[];
  fromPosition?: string;
  toPositions?: string[];
  steps?: string[];
}
