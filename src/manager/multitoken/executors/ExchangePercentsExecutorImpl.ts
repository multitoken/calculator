import { Exchange } from '../../../repository/models/Exchange';
import { ExecuteResult } from '../../../repository/models/ExecuteResult';
import { TokenPriceHistory } from '../../../repository/models/TokenPriceHistory';
import { Multitoken } from '../multitoken/Multitoken';
import { AbstractExecutor } from './AbstractExecutor';
import { ExchangerExecutor } from './ExchangerExecutor';
import { ExecutorType } from './TimeLineExecutor';

export class ExchangerPercentsExecutorImpl extends AbstractExecutor implements ExchangerExecutor {

  private exchangeValues: Map<number, number>;
  private availableTokens: string[];
  private maxTokens: number;
  private multitoken: Multitoken;
  private exchangeAmount: number;
  private endIndexDate: number;
  private endDateIndex: number;
  private timeLineStep: number;
  private balanceOfDayExchange: number;

  constructor(multitoken: Multitoken, priority: number) {
    super([multitoken], priority);

    this.multitoken = multitoken;

    this.exchangeValues = new Map();
    this.maxTokens = 0;
    this.availableTokens = this.extractAvailableTokens(this.multitoken);
    this.exchangeAmount = 0;
  }

  public setExchangeAmount(value: number): void {
    throw new Error('Can not use this method');
  }

  public prepareCalculation(btcHistoryPrice: TokenPriceHistory[],
                            timeLineStep: number,
                            amount: number,
                            startIndex: number,
                            endIndex: number): void {
    this.timeLineStep = timeLineStep;
    this.endDateIndex = endIndex;
    this.endIndexDate = 0;
    this.exchangeAmount = 0;
    this.balanceOfDayExchange = -1;
    this.availableTokens = this.extractAvailableTokens(this.multitoken);
    this.maxTokens = this.availableTokens.length;
  }

  public execute(timeLineIndex: number,
                 historyPriceInTime: Map<string, number>,
                 timestamp: number,
                 btcAmount: number,
                 txPrice: number): ExecuteResult | undefined {

    if (this.endIndexDate === 0 || timeLineIndex > this.endIndexDate) {
      this.endIndexDate = timeLineIndex + Math.min((86400 / this.timeLineStep), this.endDateIndex);

      if (this.balanceOfDayExchange !== -1 && this.balanceOfDayExchange - this.exchangeAmount < 0) {
        throw new Error('not full balance used: ' + this.balanceOfDayExchange);
      }

      this.exchangeValues.clear();
      this.exchangeAmount = Math.trunc(this.calculateCap(historyPriceInTime) * 0.10);

      this.exchangeValues = this.prepareExchanges(this.exchangeAmount, timeLineIndex, this.endIndexDate);

      this.balanceOfDayExchange = 0;
    }

    if (!this.exchangeValues.has(timeLineIndex)) {
      return undefined;
    }

    while (true) {
      const firstToken: string = this.availableTokens[Math.trunc(this.random(0, this.maxTokens))];
      const secondToken: string = this.availableTokens[Math.trunc(this.random(0, this.maxTokens))];

      if (firstToken !== secondToken) {
        const amount: number =
          (this.exchangeValues.get(timeLineIndex) || 0) / (historyPriceInTime.get(firstToken) || 1);

        if ((this.multitoken.getAmounts().get(firstToken) || 0) >= amount) {
          this.balanceOfDayExchange += (this.exchangeValues.get(timeLineIndex) || 0);
          const result: [number, number] = this.multitoken.preCalculateExchange(firstToken, secondToken, amount);
          const exchanged: number = result[0];
          const exchange: Exchange =
            new Exchange(firstToken, secondToken, amount, exchanged, result[1], this.balanceOfDayExchange);

          this.multitoken.exchange(firstToken, secondToken, amount, exchanged);

          return exchange;
        }
      }
    }
  }

  public getType(): ExecutorType {
    return ExecutorType.EXCHANGER;
  }

  private calculateCap(historyPrice: Map<string, number>): number {
    let result: number = 0;
    this.multitoken.getAmounts().forEach((value, key) => {
      result += (historyPrice.get(key) || 0) * value;
    });

    return result;
  }

  private prepareExchanges(exchangeAmount: number, startIndex: number, endIndex: number): Map<number, number> {
    let balance: number = exchangeAmount;
    const result: Map<number, number> = new Map();
    const minExchange: number = exchangeAmount / (endIndex - startIndex);

    while (balance > 0) {
      const timeLineValue = Math.round(this.random(startIndex, endIndex));

      if (!result.has(timeLineValue)) {
        const priceValue = this.random(minExchange, minExchange * 3);
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
