import { RebalanceHistory } from '../../repository/models/RebalanceHistory';
import { TokenPriceHistory } from '../../repository/models/TokenPriceHistory';
import { TokenProportion } from '../../repository/models/TokenProportion';
import { TokenWeight } from '../../repository/models/TokenWeight';
import { TokenType } from './PortfolioManagerImpl';
import { ProgressListener } from './ProgressListener';

export interface PortfolioManager {

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

  calculate(): Promise<RebalanceHistory>;

  getStepSec(): number;

  setExchangeAmount(value: number): void;

  getExchangeAmount(): number;

  setRebalancePeriod(seconds: number): void;

  getRebalancePeriod(): number;

}
