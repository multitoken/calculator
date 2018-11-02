import { TokenType } from '../manager/multitoken/PortfolioManagerImpl';

export class RebalanceTypeItem {

  public type: TokenType;
  public desc: string;
  public icon: any;

  constructor(type: TokenType, desc: string, icon: any) {
    this.type = type;
    this.desc = desc;
    this.icon = icon;
  }

}
