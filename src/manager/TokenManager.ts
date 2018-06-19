import { Arbitration } from '../repository/models/Arbitration';
import { TokenPriceHistory } from '../repository/models/TokenPriceHistory';

export interface TokenManager {

  setupTokens(tokenSymbols: string[]): Promise<Map<string, TokenPriceHistory[]>>;

  changeProportions(proportions: Map<string, number>): void;

  getTimelineProportions(): Map<number, Map<string, number>>;

  setTimelineProportion(positionCalcDate: number, proportions: Map<string, number>): void;

  removeTimelineProportion(positionCalcDate: number): boolean;

  resetTimelineProportions(): void;

  changeCalculationDate(indexStart: number, indexEnd: number): void;

  getMaxCalculationIndex(): number;

  getPriceHistory(): Map<string, TokenPriceHistory[]>;

  getAvailableTokens(): Promise<Map<string, string>>;

  calculateInitialAmounts(amount: number): Promise<Map<string, number>>;

  calculateArbitration(): Promise<Arbitration[]>;

  calculateCap(): Promise<number>;

}
