import { RebalanceHistory } from '../../repository/models/RebalanceHistory';
import PortfolioManagerImpl, { TokenType } from './PortfolioManagerImpl';

export class FakePortfolioManagerImpl extends PortfolioManagerImpl {

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
