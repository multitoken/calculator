import { RebalanceHistory } from '../../repository/models/RebalanceHistory';
import { TokenPriceHistory } from '../../repository/models/TokenPriceHistory';
import { FakeRebalanceData } from '../../utils/FakeRebalanceData';
import PortfolioManagerImpl, { TokenType } from './PortfolioManagerImpl';

export class FakePortfolioManagerImpl extends PortfolioManagerImpl {

  public async setupTokens(tokenSymbols: string[]): Promise<Map<string, TokenPriceHistory[]>> {
    this.resetDefaultValues();
    tokenSymbols.forEach(value => this.selectedTokensHistory.set(value, []));

    const name: string = tokenSymbols
      .sort()
      .join('/');

    const data: number[] = FakeRebalanceData.DATA.get(name) || [];

    if (data.length === 0) {
      throw new Error('portfolio not found! ' + name);
    }

    this.btcHistoryPrice = [new TokenPriceHistory(0, data[6])];

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
