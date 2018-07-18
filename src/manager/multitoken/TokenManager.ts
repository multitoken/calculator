import { CryptocurrencyRepository } from '../../repository/cryptocurrency/CryptocurrencyRepository';
import { RebalanceHistory } from '../../repository/models/RebalanceHistory';
import { TokenPriceHistory } from '../../repository/models/TokenPriceHistory';
import { TokenProportion } from '../../repository/models/TokenProportion';
import { TokenWeight } from '../../repository/models/TokenWeight';
import { ProgressListener } from './ProgressListener';
import { TokenType } from './TokenManagerImpl';

export interface TokenManager {

  getBtcPrice(): TokenPriceHistory[];

  setAmount(amount: number): void;

  getAmount(): number;

  setTokenType(tokenType: TokenType): void;

  getTokenType(): TokenType;

  setupTokens(tokenSymbols: string[]): Promise<Map<string, TokenPriceHistory[]>>;

  setCommission(commissionPercents: number): void;

  getCommission(): number;

  changeProportions(proportions: TokenProportion[]): void;

  getProportions(): TokenProportion[];

  getRebalanceWeights(): TokenWeight[];

  setRebalanceWeights(tokenWeights: TokenWeight[]): void;

  changeCalculationDate(indexStart: number, indexEnd: number): void;

  getCalculationDate(): number | [number, number];

  getMaxCalculationIndex(): number;

  getPriceHistory(): Map<string, TokenPriceHistory[]>;

  getAvailableTokens(): Promise<Map<string, string>>;

  calculateInitialAmounts(): Promise<Map<string, number>>;

  subscribeToProgress(listener?: ProgressListener): void;

  calculateArbitration(): Promise<RebalanceHistory>;

  getStepSec(): number;

  setupRepository(repo: CryptocurrencyRepository): void;

  setExchangeAmount(value: number): void;

  getExchangeAmount(): number;

}
