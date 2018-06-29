import { Arbitration } from '../repository/models/Arbitration';
import Pair from '../repository/models/Pair';
import { Token } from '../repository/models/Token';
import { TokenPriceHistory } from '../repository/models/TokenPriceHistory';
import { ProgressListener } from './ProgressListener';

export interface TokenManager {

  getBtcPrice(): Promise<TokenPriceHistory[]>;

  setupTokens(tokenSymbols: string[]): Promise<Map<string, TokenPriceHistory[]>>;

  setCommission(commissionPercents: number): void;

  changeProportions(proportions: Map<string, number>): void;

  getExchangedWeights(): Map<number, Pair<Token, Token>>;

  setExchangeWeights(tokenWeights: Map<number, Pair<Token, Token>>): void;

  changeCalculationDate(indexStart: number, indexEnd: number): void;

  getMaxCalculationIndex(): number;

  getPriceHistory(): Map<string, TokenPriceHistory[]>;

  getAvailableTokens(): Promise<Map<string, string>>;

  calculateInitialAmounts(amount: number): Promise<Map<string, number>>;

  subscribeToProgress(listener?: ProgressListener): void;

  calculateArbitration(): Promise<Arbitration[]>;

  calculateCap(origin: boolean): Promise<number>;

}
