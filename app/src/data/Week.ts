import type { UUID } from './UUID';

export interface Week {
  id: UUID;
  tituloSemana: string;
  dataInicio: string;
  dataFim: string;
}
