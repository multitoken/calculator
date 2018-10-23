import { Portfolio } from '../../repository/models/Portfolio';
import { TokenPriceHistory } from '../../repository/models/TokenPriceHistory';
import { TokenProportion } from '../../repository/models/TokenProportion';
import { TokenWeight } from '../../repository/models/TokenWeight';
import { TokenType } from './PortfolioManagerImpl';
import { ProgressListener } from './ProgressListener';
import { RebalanceResult } from './RebalanceResult';

export interface PortfolioManager {

  getRebalanceResult(): RebalanceResult;

  getPortfolios(email: string): Promise<Portfolio[]>;

  loadPortfolio(email: string, id: number): Promise<void>;

  savePortfolio(portfolio: Portfolio): Promise<void>;

  getBtcPrice(): TokenPriceHistory[];

  getExecutorsByTokenType(): string[];

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

  getCalculationDateIndex(): number | [number, number];

  getCalculationTimestamp(): [number, number];

  getMaxCalculationIndex(): number;

  getPriceHistory(): Map<string, TokenPriceHistory[]>;

  getAvailableTokens(): Promise<Map<string, string>>;

  calculateInitialAmounts(): Map<string, number>;

  subscribeToProgress(listener?: ProgressListener): void;

  calculate(): Promise<RebalanceResult>;

  getStepSec(): number;

  setExchangeAmount(value: number): void;

  getExchangeAmount(): number;

  setRebalancePeriod(seconds: number): void;

  getRebalancePeriod(): number;

  setRebalanceDiffPercent(seconds: number): void;

  getRebalanceDiffPercent(): number;

}
