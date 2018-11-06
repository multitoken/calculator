import { TokenType } from '../manager/multitoken/PortfolioManagerImpl';

import IcoRebalanceAuto from '../res/icons/rebalance-types/ico_auto.svg';
import IcoRebalanceAutoDynamic from '../res/icons/rebalance-types/ico_auto_dynamic.svg';
import IcoRebalanceDiff from '../res/icons/rebalance-types/ico_diff.svg';
import IcoRebalanceFix from '../res/icons/rebalance-types/ico_fix.svg';
import IcoRebalanceManual from '../res/icons/rebalance-types/ico_manual.svg';
import IcoRebalancePediod from '../res/icons/rebalance-types/ico_period.svg';

export class RebalanceTypeItem {

  public type: TokenType;
  public desc: string;

  constructor(type: TokenType, desc: string = '') {
    this.type = type;
    this.desc = desc;
  }

  public getIcon(): any {
    switch (this.type) {
      case TokenType.PERIOD_REBALANCE :
        return IcoRebalancePediod;

      case TokenType.DIFF_PERCENT_REBALANCE:
        return IcoRebalanceDiff;

      case  TokenType.AUTO_REBALANCE:
        return IcoRebalanceAuto;

      case TokenType.ADAPTIVE_PERCENT_EXCHANGER:
        return IcoRebalanceAutoDynamic;

      case TokenType.FIX_PROPORTIONS:
        return IcoRebalanceFix;

      case TokenType.MANUAL_REBALANCE:
        return IcoRebalanceManual;

      default:
        throw new Error('undefined icon for type of rebalance');
    }
  }

  public getReadableType(): string {
    switch (this.type) {
      case TokenType.PERIOD_REBALANCE :
        return 'Period';

      case TokenType.DIFF_PERCENT_REBALANCE:
        return 'Diff percent';

      case  TokenType.AUTO_REBALANCE:
        return 'Auto';

      case TokenType.ADAPTIVE_PERCENT_EXCHANGER:
        return 'Auto with dynamic exchange';

      case TokenType.FIX_PROPORTIONS:
        return 'Fix proportions';

      case TokenType.MANUAL_REBALANCE:
        return 'Manual';

      default:
        throw new Error('undefined type of rebalance');
    }
  }

}
