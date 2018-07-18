import { Exchange } from '../../../repository/models/Exchange';
import { ExecuteResult } from '../../../repository/models/ExecuteResult';
import { TokenPriceHistory } from '../../../repository/models/TokenPriceHistory';
import { Multitoken } from '../multitoken/Multitoken';
import { AbstractExecutor } from './AbstractExecutor';
import { ExecutorType } from './TimeLineExecutor';

export class ExchangerExecutor extends AbstractExecutor {

  private exchangeValues: Map<number, number>;
  private availableTokens: string[];
  private maxTokens: number;
  private multitoken: Multitoken;

  constructor(multitoken: Multitoken, priority: number) {
    super([multitoken], priority);

    this.multitoken = multitoken;

    this.exchangeValues = new Map();
    this.maxTokens = 0;
    this.availableTokens = this.extractAvailableTokens(this.multitoken);
  }

  public prepareCalculation(btcHistoryPrice: TokenPriceHistory[],
                            amount: number,
                            startTime: number,
                            endTime: number): void {
    this.availableTokens = this.extractAvailableTokens(this.multitoken);
    this.maxTokens = this.availableTokens.length;

    this.exchangeValues.clear();

    this.exchangeValues = this.prepareExchanges(amount, startTime, endTime);
  }

  public execute(timeLineIndex: number,
                 historyPriceInTime: Map<string, number>,
                 timestamp: number,
                 btcAmount: number,
                 txPrice: number): ExecuteResult | undefined {

    if (!this.exchangeValues.has(timeLineIndex)) {
      return undefined;
    }

    while (true) {
      const firstToken: string = this.availableTokens[Math.round(this.random(0, this.maxTokens - 1))];
      const secondToken: string = this.availableTokens[Math.round(this.random(0, this.maxTokens - 1))];

      if (firstToken !== secondToken) {
        const amount: number =
          (this.exchangeValues.get(timeLineIndex) || 0) / (historyPriceInTime.get(firstToken) || 1);

        if ((this.multitoken.getAmounts().get(firstToken) || 0) >= amount) {
          const result: [number, number] = this.multitoken.preCalculateExchange(firstToken, secondToken, amount);
          const exchanged: number = result[0];
          const exchange: Exchange = new Exchange(firstToken, secondToken, amount, exchanged, result[1]);
          this.multitoken.exchange(firstToken, secondToken, amount, exchanged);

          return exchange;
        }
      }
    }
  }

  public getType(): ExecutorType {
    return ExecutorType.EXCHANGER;
  }

  private prepareExchanges(amount: number, startTime: number, endTime: number): Map<number, number> {
    let balance: number = amount;
    const result: Map<number, number> = new Map();

    while (balance > 0) {
      const timeLineValue = Math.round(this.random(endTime, startTime));

      if (!result.has(timeLineValue)) {
        const priceValue = this.random(0.1, 0.01) * amount;
        result.set(timeLineValue, priceValue);
        balance -= Math.min(priceValue, balance);
      }
    }

    return result;
  }

  private extractAvailableTokens(multitoken: Multitoken): string[] {
    return Array.from(multitoken.getAmounts().keys());
  }

  private random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

}
