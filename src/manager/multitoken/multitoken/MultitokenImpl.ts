import { MapUtils } from '../../../utils/MapUtils';
import { Multitoken } from './Multitoken';

export class MultitokenImpl implements Multitoken {

  private tokensWeight: Map<string, number> = new Map();
  private tokensAmount: Map<string, number> = new Map();
  private name: string;
  private commissionPercents: number;

  constructor(name: string) {
    this.name = name;
    this.commissionPercents = 1;
  }

  public setup(amounts: Map<string, number>, weights: Map<string, number>): void {
    this.tokensAmount = MapUtils.clone(amounts);
    this.tokensWeight = MapUtils.clone(weights);
    let minWeight = 0;
    this.commissionPercents = 1;

    for (const weight of this.tokensWeight.values()) {
      if (minWeight === 0 || minWeight > weight) {
        minWeight = weight;
      }
    }

    this.tokensWeight.forEach((value, key) => this.tokensWeight.set(key, value / minWeight));
  }

  public setFixedCommission(percents: number): void {
    this.commissionPercents = 1 - percents / 100;
  }

  public preCalculateExchange(fromSymbol: string, toSymbol: string, amount: number): [number, number] {
    const fromBalance: number = this.tokensAmount.get(fromSymbol) || 0;
    const fromWeight: number = this.tokensWeight.get(fromSymbol) || 0;
    const toBalance: number = this.tokensAmount.get(toSymbol) || 0;
    const toWeight: number = this.tokensWeight.get(toSymbol) || 0;

    if (fromWeight > 0 && toWeight > 0 && fromSymbol !== toSymbol) {
      return [
        amount * toBalance *
        fromWeight /
        (amount * fromWeight + fromBalance) * this.commissionPercents,
        this.commissionPercents
      ];
    }

    return [0, this.commissionPercents];
  }

  public exchange(fromSymbol: string, toSymbol: string, fromAmount: number, toAmount: number): void {
    const fromAmounts: number = this.tokensAmount.get(fromSymbol) || 0;
    const toAmounts: number = this.tokensAmount.get(toSymbol) || 0;
    const fromResult: number = fromAmounts + fromAmount;
    const toResult: number = toAmounts - toAmount;

    if (fromResult <= 0 || toResult <= 0 || fromAmount <= 0 || toAmount <= 0) {
      console.error(fromSymbol, fromAmount, toSymbol, toAmount);
      console.error(fromAmounts, fromResult);
      console.error(toAmounts, toResult);
      throw new Error('wrong calculation');
    }

    this.tokensAmount.set(fromSymbol, fromResult);
    this.tokensAmount.set(toSymbol, toResult);
  }

  public getCommission(): number {
    return this.commissionPercents;
  }

  public getAmounts(): Map<string, number> {
    return this.tokensAmount;
  }

  public getWeights(): Map<string, number> {
    return this.tokensWeight;
  }

  public getName(): string {
    return this.name;
  }

}
