import Pair from './Pair';
import { Token } from './Token';
import { TokenProportion } from './TokenProportion';
import { TokenWeight } from './TokenWeight';

export class PortfolioOptions {

  public proportions: TokenProportion[];
  public rebalanceWeights: TokenWeight[];
  public rebalancePeriod: number;
  public commissionPercents: number;
  public rebalanceDiffPercent: number;
  public exchangeAmount: number;
  public dateIndexStart: number;
  public dateIndexEnd: number;

  public static fromJson(json: string): PortfolioOptions {
    const jsonData: any = JSON.parse(json);

    const proportions: TokenProportion[] = (jsonData.proportions || [])
      .map((value: any) => Object.assign(new TokenProportion(), value));

    const rebalanceWeights: TokenWeight[] = (jsonData.rebalanceWeights || [])
      .map((value: any) => Object.assign(new TokenWeight(), value));

    rebalanceWeights.map(tokenWeight => {
      tokenWeight.tokens = new Pair<Token, Token>(
        new Token(tokenWeight.tokens.first.name, tokenWeight.tokens.first.weight),
        new Token(tokenWeight.tokens.second.name, tokenWeight.tokens.second.weight),
      );
    });

    const rebalancePeriod: number = Number(jsonData.rebalancePeriod);
    const commissionPercents: number = Number(jsonData.commissionPercents || 0);
    const rebalanceDiffPercent: number = Number(jsonData.rebalanceDiffPercent || 0);
    const exchangeAmount: number = Number(jsonData.exchangeAmount || 0);
    const dateIndexStart: number = Number(jsonData.dateIndexStart || 0);
    const dateIndexEnd: number = Number(jsonData.dateIndexEnd || 0);

    return new PortfolioOptions(
      proportions,
      rebalanceWeights,
      rebalancePeriod,
      commissionPercents,
      rebalanceDiffPercent,
      exchangeAmount,
      dateIndexStart,
      dateIndexEnd
    );
  }

  public constructor(proportions: TokenProportion[] = [],
                     rebalanceWeights: TokenWeight[] = [],
                     rebalancePeriod: number = 0,
                     commissionPercents: number = 0,
                     rebalanceDiffPercent: number = 0,
                     exchangeAmount: number = 0,
                     dateIndexStart: number = 0,
                     dateIndexEnd: number = 0) {
    this.proportions = proportions;
    this.rebalanceWeights = rebalanceWeights;
    this.rebalancePeriod = rebalancePeriod;
    this.commissionPercents = commissionPercents;
    this.rebalanceDiffPercent = rebalanceDiffPercent;
    this.exchangeAmount = exchangeAmount;
    this.dateIndexStart = dateIndexStart;
    this.dateIndexEnd = dateIndexEnd;
  }

}
