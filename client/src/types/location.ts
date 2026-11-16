import type { LocationType } from './enums';

export interface Location {
  id: number;
  name: string;
  type: LocationType;
  /** Максимальна місткість зали (кількість місць) */
  maxCapacity: number;
}
