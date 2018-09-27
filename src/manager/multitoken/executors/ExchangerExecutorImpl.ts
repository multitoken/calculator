import { Exchange } from '../../../repository/models/Exchange';
import { ExecuteResult } from '../../../repository/models/ExecuteResult';
import { TokenPriceHistory } from '../../../repository/models/TokenPriceHistory';
import { Multitoken } from '../multitoken/Multitoken';
import { AbstractExecutor } from './AbstractExecutor';
import { ExchangerExecutor } from './ExchangerExecutor';
import { ExecutorType } from './TimeLineExecutor';

export class ExchangerExecutorImpl extends AbstractExecutor implements ExchangerExecutor {

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
    if (typeof value !== 'number' || value < 0) {
      throw new Error('value of exchange must be more than zero');
    }

    this.exchangeAmount = value;
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

      this.exchangeValues.clear();
      this.exchangeValues = this.prepareExchanges(this.exchangeAmount, timeLineIndex, this.endIndexDate);
      this.balanceOfDayExchange = 0;
    }

    if (this.exchangeValues.get(timeLineIndex) === undefined
      || this.exchangeValues.get(timeLineIndex) === 0
      || this.exchangeAmount <= 0) {
      return undefined;
    }

    let indexIterations: number = 0;

    while (true) {
      const firstToken: string = this.availableTokens[Math.trunc(this.random(0, this.maxTokens))];
      const secondToken: string = this.availableTokens[Math.trunc(this.random(0, this.maxTokens))];

      if (firstToken !== secondToken) {
        const amount: number =
          (this.exchangeValues.get(timeLineIndex) || 0) / (historyPriceInTime.get(firstToken) || 1);

        if ((this.multitoken.getAmounts().get(firstToken) || 0) >= amount) {
          const result: [number, number] = this.multitoken.preCalculateExchange(firstToken, secondToken, amount);
          const exchanged: number = result[0];
          const exchange: Exchange =
            new Exchange(firstToken, secondToken, amount, exchanged, result[1], this.balanceOfDayExchange);

          if (exchanged > 0 && amount > 0) {
            this.multitoken.exchange(firstToken, secondToken, amount, exchanged);
            this.balanceOfDayExchange += (this.exchangeValues.get(timeLineIndex) || 0);

            return exchange;
          }
        }

        if (indexIterations === 20) {
          throw new Error('invalid exchange operation');
        }
        indexIterations++;
      }
    }
  }

  public getType(): ExecutorType {
    return ExecutorType.EXCHANGER;
  }

  private prepareExchanges(exchangeAmount: number, startIndex: number, endIndex: number): Map<number, number> {
    let balance: number = exchangeAmount;
    const result: Map<number, number> = new Map();
    const minExchange: number = exchangeAmount / (endIndex - startIndex);

    for (let i = startIndex; i < endIndex + 1; i++) {
      result.set(i, Math.min(minExchange, balance));
      balance -= Math.min(minExchange, balance);
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
