import { RebalanceHistory } from '../../repository/models/RebalanceHistory';
import { TokenPriceHistory } from '../../repository/models/TokenPriceHistory';
import { TokenProportion } from '../../repository/models/TokenProportion';
import { FakeRebalanceData } from '../../utils/FakeRebalanceData';
import { ExecutorType } from './executors/TimeLineExecutor';
import PortfolioManagerImpl, { TokenType } from './PortfolioManagerImpl';

export class FakePortfolioManagerImpl extends PortfolioManagerImpl {

  private data: number[] = [];

  public getExecutorsByTokenType(): string[] {
    return [ExecutorType.CAP_CLAMP, ExecutorType.ARBITRAGEUR];
  }

  public getCalculationTimestamp(): [number, number] {
    return [this.data[7], this.data[8]];
  }

  public async setupTokens(tokenSymbols: string[]): Promise<Map<string, TokenPriceHistory[]>> {
    this.resetDefaultValues();
    tokenSymbols.forEach(value => this.selectedTokensHistory.set(value, []));

    const proportions: TokenProportion[] = tokenSymbols.map(value => new TokenProportion(value, 1, 1, 1));

    this.changeProportions(proportions);

    const name: string = tokenSymbols
      .sort()
      .join('/');

    this.data = FakeRebalanceData.DATA.get(name) || [];

    if (this.data.length === 0) {
      throw new Error('portfolio not found! ' + name);
    }

    this.btcHistoryPrice = [new TokenPriceHistory(0, this.data[6])];

    return this.selectedTokensHistory;
  }

  public async calculateInitialAmounts(): Promise<Map<string, number>> {
    return new Map();
  }

  public async calculate(): Promise<RebalanceHistory> {
    return new RebalanceHistory([], [], []);
  }

  protected resetDefaultValues(): void {
    super.resetDefaultValues();
    this.setCommission(0.5);
    this.setExchangeAmount(0);
    this.setTokenType(TokenType.AUTO_REBALANCE);
  }

}
