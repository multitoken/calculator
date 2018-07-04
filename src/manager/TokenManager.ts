import { Arbitration } from '../repository/models/Arbitration';
import { TokenPriceHistory } from '../repository/models/TokenPriceHistory';
import { TokenProportion } from '../repository/models/TokenProportion';
import { TokenWeight } from '../repository/models/TokenWeight';
import { ProgressListener } from './ProgressListener';

export interface TokenManager {

  getBtcPrice(): TokenPriceHistory[];

  setAmount(amount: number): void;

  getAmount(): number;

  setupTokens(tokenSymbols: string[]): Promise<Map<string, TokenPriceHistory[]>>;

  setCommission(commissionPercents: number): void;

  getCommission(): number;

  changeProportions(proportions: TokenProportion[]): void;

  getProportions(): TokenProportion[];

  getExchangedWeights(): TokenWeight[];

  setExchangeWeights(tokenWeights: TokenWeight[]): void;

  changeCalculationDate(indexStart: number, indexEnd: number): void;

  getCalculationDate(): number | [number, number];

  getMaxCalculationIndex(): number;

  getPriceHistory(): Map<string, TokenPriceHistory[]>;

  getAvailableTokens(): Promise<Map<string, string>>;

  calculateInitialAmounts(): Promise<Map<string, number>>;

  subscribeToProgress(listener?: ProgressListener): void;

  calculateArbitration(): Promise<Arbitration[]>;

  calculateCap(origin: boolean): Promise<number>;

}
