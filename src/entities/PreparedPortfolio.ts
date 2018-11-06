import { TokenType } from '../manager/multitoken/PortfolioManagerImpl';
import { RebalanceTypeItem } from './RebalanceTypeItem';

export class PreparedPortfolio extends RebalanceTypeItem {

  public coins: string[];
  public diffPercent: number;

  constructor(type: TokenType,
              coins: string[],
              diffPercent: number) {
    super(type, '');
    this.coins = coins;
    this.diffPercent = diffPercent;
  }

}
