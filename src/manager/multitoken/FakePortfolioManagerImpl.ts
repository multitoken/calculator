import { CryptocurrencyRepository } from '../../repository/cryptocurrency/CryptocurrencyRepository';
import { PortfolioRepository } from '../../repository/history/PortfolioRepository';
import { TokenPriceHistory } from '../../repository/models/TokenPriceHistory';
import { TokenProportion } from '../../repository/models/TokenProportion';
import { FakeRebalanceData } from '../../utils/FakeRebalanceData';
import { ExecutorType, TimeLineExecutor } from './executors/TimeLineExecutor';
import { FakeRebalanceResultImpl } from './FakeRebalanceResultImpl';
import { Multitoken } from './multitoken/Multitoken';
import PortfolioManagerImpl, { TokenType } from './PortfolioManagerImpl';
import { RebalanceResult } from './RebalanceResult';

export class FakePortfolioManagerImpl extends PortfolioManagerImpl {

  private data: any = [];

  constructor(cryptocurrencyRepository: CryptocurrencyRepository,
              portfolioRepository: PortfolioRepository,
              multitokens: Multitoken[], executors: TimeLineExecutor[]) {
    super(cryptocurrencyRepository, portfolioRepository, multitokens, executors);

    this.rebalanceResult = new FakeRebalanceResultImpl(this);
  }

  public getExecutorsByTokenType(): string[] {
    return [ExecutorType.CAP_CLAMP, ExecutorType.ARBITRAGEUR];
  }

  public getCalculationTimestamp(): [number, number] {
    return [this.data.start, this.data.end];
  }

  public async setupTokens(tokenSymbols: string[]): Promise<Map<string, TokenPriceHistory[]>> {
    this.resetDefaultValues();
    tokenSymbols.forEach(value => this.selectedTokensHistory.set(value, []));

    const proportions: TokenProportion[] = tokenSymbols.map(value => new TokenProportion(value, 1, 1, 1));

    this.changeProportions(proportions);

    const name: string = tokenSymbols
      .sort()
      .join(',');

    this.data = FakeRebalanceData.DATA.get(name) || {};

    if (!this.data.hasOwnProperty('originCap')) {
      throw new Error('portfolio not found! ' + name);
    }

    this.setRebalanceDiffPercent(this.data.diffPercents);

    this.btcHistoryPrice = [new TokenPriceHistory(0, this.data.btcStart.value)];

    return this.selectedTokensHistory;
  }

  public calculateInitialAmounts(): Map<string, number> {
    return new Map();
  }

  public async calculate(): Promise<RebalanceResult> {
    return this.rebalanceResult;
  }

  protected resetDefaultValues(): void {
    super.resetDefaultValues();
    this.setCommission(0.5);
    this.setExchangeAmount(0);
    this.setTokenType(TokenType.AUTO_REBALANCE);
  }

  public getStepSec(): number {
    return this.data.stepSec;
  }

}
