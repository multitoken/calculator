import { injectable } from 'inversify';
import 'reflect-metadata';
import { CryptocurrencyRepository } from '../repository/cryptocurrency/CryptocurrencyRepository';
import { ArbiterProfit } from '../repository/models/ArbiterProfit';
import { Arbitration } from '../repository/models/Arbitration';
import Pair from '../repository/models/Pair';
import { RebalanceHistory } from '../repository/models/RebalanceHistory';
import { RebalanceValues } from '../repository/models/RebalanceValues';
import { Token } from '../repository/models/Token';
import { TokenPriceHistory } from '../repository/models/TokenPriceHistory';
import { TokenProportion } from '../repository/models/TokenProportion';
import { TokenWeight } from '../repository/models/TokenWeight';
import { ProgressListener } from './ProgressListener';
import { TokenManager } from './TokenManager';

@injectable()
export default class TokenManagerImpl implements TokenManager, ProgressListener {

  private static readonly EMPTY_MAP: Map<any, any> = new Map();

  private cryptocurrencyRepository: CryptocurrencyRepository;
  private isFakeModeEnabled: boolean = false;
  private readonly selectedTokensHistory: Map<string, TokenPriceHistory[]> = new Map();
  private btcHistoryPrice: TokenPriceHistory[] = [];
  private readonly tokensAmount: Map<string, number> = new Map();
  private readonly tokensAmountFixed: Map<string, number> = new Map();
  private readonly tokensWeightFixed: Map<string, number> = new Map();
  private readonly tokensWeight: Map<string, number> = new Map();
  private readonly tokensWeightTimeline: Map<number, Pair<Token, Token>> = new Map();
  private startCalculationIndex: number;
  private endCalculationIndex: number;
  private maxCalculationIndex: number;
  private commissionPercent: number;
  private listener: ProgressListener;
  private amount: number;
  private proportions: TokenProportion[];
  private tokenWeights: TokenWeight[];
  private isDisabledArbitrage: boolean;
  private isDisabledManualRebalance: boolean;
  private exchangeAmount: number;
  private readonly exchangeValues: Map<number, number> = new Map();
  private maxWeight: number = 0;

  constructor(cryptocurrencyRepository: CryptocurrencyRepository) {
    this.resetDefaultValues();
    this.cryptocurrencyRepository = cryptocurrencyRepository;
    this.listener = this;
  }

  public getBtcPrice(): TokenPriceHistory[] {
    return this.btcHistoryPrice;
  }

  public setAmount(amount: number): void {
    this.amount = amount;
  }

  public getAmount(): number {
    return this.amount;
  }

  public async setupTokens(tokenSymbols: string[]): Promise<Map<string, TokenPriceHistory[]>> {
    this.selectedTokensHistory.clear();
    this.tokensAmount.clear();
    this.tokensAmountFixed.clear();
    this.tokensWeight.clear();
    this.tokensWeightFixed.clear();

    this.resetDefaultValues();

    this.btcHistoryPrice = await this.cryptocurrencyRepository.getHistoryPrice('Bitcoin', 'usdt', 2000);
    this.btcHistoryPrice = this.interpolateValues(this.btcHistoryPrice);

    for (const item of tokenSymbols) {
      try {
        const result: TokenPriceHistory[] = await this.cryptocurrencyRepository
          .getHistoryPrice(item, 'USD', 2160);

        this.selectedTokensHistory.set(item, result);

        if (this.maxCalculationIndex <= 0 || this.maxCalculationIndex > result.length) {
          this.maxCalculationIndex = result.length - (result.length % 2);
          console.log('this.maxCalculationIndex', this.maxCalculationIndex);
          this.endCalculationIndex = this.maxCalculationIndex - 1;
        }
      } catch (e) {
        console.error(`error sync ${item}: ${e}`);
      }
    }

    this.selectedTokensHistory.forEach((value, key) => {
      let arr: TokenPriceHistory[] = value;
      if (value.length > this.maxCalculationIndex) {
        arr = value.slice((value.length - this.maxCalculationIndex), value.length);
      }

      arr = this.interpolateValues(arr);
      this.selectedTokensHistory.set(key, arr);

      console.log('end len', arr.length);
    });

    this.maxCalculationIndex = 0;

    this.selectedTokensHistory.forEach((value, key) => {
      if (this.maxCalculationIndex <= 0 || this.maxCalculationIndex > value.length) {
        this.maxCalculationIndex = value.length;
        console.log('this.maxCalculationIndex second', this.maxCalculationIndex);
        this.endCalculationIndex = this.maxCalculationIndex - 1;
      }
    });

    this.selectedTokensHistory.forEach((value, key) => {
      if (value.length > this.maxCalculationIndex) {
        const arr: TokenPriceHistory[] = value.slice((value.length - this.maxCalculationIndex), value.length);
        this.selectedTokensHistory.set(key, arr);
      }
      console.log('this.maxCalculationIndex cut', (this.selectedTokensHistory.get(key) || []).length);
    });

    this.maxCalculationIndex = Array.from(this.selectedTokensHistory.values())[0].length - 1;
    this.endCalculationIndex = this.maxCalculationIndex - 1;

    this.btcHistoryPrice =
      this.btcHistoryPrice.slice((this.btcHistoryPrice.length - this.maxCalculationIndex), this.btcHistoryPrice.length);

    return this.selectedTokensHistory;
  }

  public interpolateValues(history: TokenPriceHistory[]): TokenPriceHistory[] {
    const result: TokenPriceHistory[] = [];

    for (let i = 0; i < history.length - 1; i++) {
      const diffCount: number = Math.round((history[i + 1].time - history[i].time) / 5000);
      for (let j = 0; j < diffCount; j++) {
        const time: number = history[i].time + j * 5000;
        const value: number = this.linInterpolation(
          history[i].time,
          history[i].value,
          history[i + 1].time,
          history[i + 1].value,
          time
        );
        result.push(new TokenPriceHistory(time, value));
      }
    }

    return result;
  }

  public linInterpolation(x1: number, y1: number, x2: number, y2: number, targetX: number) {
    return y1 + (targetX - x1) * (y2 - y1) / (x2 - x1);
  }

  public setCommission(commissionPercents: number): void {
    this.commissionPercent = commissionPercents;
  }

  public getCommission(): number {
    return this.commissionPercent;
  }

  public changeProportions(proportions: TokenProportion[]) {
    proportions.forEach((token) => {
      console.log('set weight', token.name, token.weight);
      this.tokensWeight.set(token.name, token.weight);
      this.tokensWeightFixed.set(token.name, token.weight);
      this.proportions = proportions;
    });
  }

  public getProportions(): TokenProportion[] {
    return this.proportions;
  }

  public getExchangedWeights(): TokenWeight[] {
    return this.tokenWeights;
  }

  public setExchangeWeights(tokenWeights: TokenWeight[]): void {
    this.tokensWeightTimeline.clear();
    this.tokenWeights = tokenWeights;

    tokenWeights.forEach((weights) => {
      this.tokensWeightTimeline.set(weights.index, weights.tokens);
    });
  }

  public changeCalculationDate(indexStart: number, indexEnd: number) {
    if (indexEnd < this.maxCalculationIndex &&
      indexEnd > 0 &&
      indexStart >= 0 &&
      indexStart < indexEnd) {

      this.startCalculationIndex = indexStart;
      this.endCalculationIndex = indexEnd;
      console.log(`change start index ${indexStart}; end index ${indexEnd}`);
    } else {
      throw new Error('incorrect range');
    }
  }

  public getCalculationDate(): number | [number, number] {
    return [this.startCalculationIndex, this.endCalculationIndex];
  }

  public getMaxCalculationIndex(): number {
    return this.maxCalculationIndex;
  }

  public getPriceHistory(): Map<string, TokenPriceHistory[]> {
    return this.selectedTokensHistory;
  }

  public async getAvailableTokens(): Promise<Map<string, string>> {
    return this.cryptocurrencyRepository.getAvailableCurrencies();
  }

  public async calculateInitialAmounts(): Promise<Map<string, number>> {
    const result: Map<string, number> = new Map();
    let maxProportions: number = 0;

    this.tokensWeight.forEach((value) => {
      maxProportions += value;
    });

    this.selectedTokensHistory
      .forEach((value, key) => {
        if (!this.tokensWeight.has(key)) {
          console.log('token weight not found!!!!', key);
          this.tokensWeight.set(key, 1);
        }
        const weight: number = this.tokensWeight.get(key) || 0;

        const amountPerCurrency: number = (weight / maxProportions) * this.amount;

        const count: number = amountPerCurrency / value[this.startCalculationIndex].value;

        console.log(
          'name/weight/amount/count/price(per one)/', key, weight, amountPerCurrency, count,
          value[this.startCalculationIndex].value,
          count * value[this.startCalculationIndex].value
        );

        result.set(key, count);
        this.tokensAmount.set(key, count);
        this.tokensAmountFixed.set(key, count);
      });

    return result;
  }

  public wait(): Promise<void> {
    return new Promise(resolve => {
      setTimeout(
        () => {
          resolve();
        },
        1
      );
    });
  }

  public subscribeToProgress(listener?: ProgressListener): void {
    this.listener = listener || this;
  }

  public async calculateArbitration(): Promise<RebalanceHistory> {
    const resultArbitrage: Arbitration[] = [];
    const resultValues: RebalanceValues[] = [];
    const historyPerHour: Map<string, number> = new Map();
    let timestamp: number = 0;
    const btcCount: number = this.amount / this.btcHistoryPrice[this.startCalculationIndex].value;
    const skipStep: number = 86400 /* sec in day */ / this.getStepSec();

    this.listener.onProgress(1);

    console.log(
      this.startCalculationIndex, this.endCalculationIndex, this.selectedTokensHistory, this.btcHistoryPrice.length
    );
    let txPrice: number = 1; // parseFloat((Math.random() * (1.101 - 0.9) + 0.9).toFixed(2)); // min $0.9 max $1.10;

    this.prepareExchanges(this.exchangeAmount, this.startCalculationIndex, this.endCalculationIndex);

    this.tokensWeight.forEach(value => this.maxWeight += value);

    for (let i = this.startCalculationIndex; i < (this.endCalculationIndex + 1); i++) {
      if (i % 10000 === 0) {
        if (this.listener) {
          this.listener.onProgress(Math.round(
            (i - this.startCalculationIndex) / ((this.endCalculationIndex - this.startCalculationIndex) + 1) * 100
          ));
        }

        await this.wait();
      }

      historyPerHour.clear();

      this.selectedTokensHistory.forEach((value, key) => {
        historyPerHour.set(key, value[i].value);
        timestamp = value[i].time;
      });

      this.exchangeTokens(i, historyPerHour, this.tokensAmount);

      if (i === this.startCalculationIndex) {
        resultValues.push(await this.calculateRebalanceValues(i, btcCount, historyPerHour, timestamp));
      }

      if (this.isDisabledArbitrage && this.isDisabledManualRebalance && i % skipStep === 0) {
        resultValues.push(await this.calculateRebalanceValues(i, btcCount, historyPerHour, timestamp));
        continue;
      }

      if (!this.isDisabledManualRebalance && this.isDisabledArbitrage) {
        if (this.applyCustomProportionsFixed(i, historyPerHour, this.tokensWeight, this.tokensAmount)) {
          resultValues.push(await this.calculateRebalanceValues(i, btcCount, historyPerHour, timestamp));
        }
      }

      if (this.isDisabledArbitrage) {
        continue;
      }

      txPrice = Math.sin(i / 1000) * 0.5 + 1;

      let profit: ArbiterProfit = ArbiterProfit.empty();

      for (const [cheap, cheapPrice] of historyPerHour) {
        for (const [expensive, expensivePrice] of historyPerHour) {
          if (cheap === expensive) {
            continue;
          }

          const cheapBalance: number = this.tokensAmount.get(cheap) || 0; // cheap
          const cheapWeight: number = this.tokensWeight.get(cheap) || 0; // cheap

          const expensiveBalance: number = this.tokensAmount.get(expensive) || 0; // expensive
          const expensiveWeight: number = this.tokensWeight.get(expensive) || 0; // expensive

          const arbiterProfit: ArbiterProfit = await this.calculateArbiterProfit(
            cheap,
            cheapWeight,
            cheapBalance,
            cheapPrice,

            expensive,
            expensiveWeight,
            expensiveBalance,
            expensivePrice,
            txPrice
          );

          if (profit.profit < arbiterProfit.profit) {
            // console.log('old profit', profit.profit, arbiterProfit.profit);
            profit = arbiterProfit;
          }
        }
      }

      if (profit.profit > 0) {
        // console.log('best', profit);

        // const cheapPrice: number = historyPerHour.get(profit.cheapTokenName) || 0;
        // const expensivePrice: number = historyPerHour.get(profit.expensiveTokenName) || 0;

        // let cheapValue: number =
        //   cheapPrice * (this.tokensAmount.get(profit.cheapTokenName) || 0) * Config.getBtcUsdPrice();

        // let expValue: number =
        //   expensivePrice * (this.tokensAmount.get(profit.expensiveTokenName) || 0) * Config.getBtcUsdPrice();

        // console.log(profit.cheapTokenName, cheapPrice * profit.cheapTokensCount, cheapValue);
        // console.log(profit.expensiveTokenName, expensivePrice * profit.expensiveTokensCount, expValue);

        const arb: Arbitration = new Arbitration(
          txPrice,
          profit.cheapTokenName,
          profit.cheapTokensCount,
          profit.expensiveTokenName,
          profit.expensiveTokensCount,
          profit.percent,
          profit.profit,
          new Map(),
          await this.calculateTokensPriceByHistory(this.tokensAmountFixed, historyPerHour),
          timestamp
        );
        this.acceptTransaction(arb);

        // cheapValue = (historyPerHour.get(profit.cheapTokenName) || 0) *
        //   (this.tokensAmount.get(profit.cheapTokenName) || 0) * Config.getBtcUsdPrice();
        // expValue = (historyPerHour.get(profit.expensiveTokenName) || 0) *
        //   (this.tokensAmount.get(profit.expensiveTokenName) || 0) * Config.getBtcUsdPrice();

        // console.log(profit.cheapTokenName, cheapValue, this.tokensAmount.get(profit.cheapTokenName));
        // console.log(profit.expensiveTokenName, expValue, this.tokensAmount.get(profit.expensiveTokenName));

        arb.arbiterTokensCap = await this.calculateTokensPriceByHistory(this.tokensAmount, historyPerHour);
        resultValues.push(await this.calculateRebalanceValues(i, btcCount, historyPerHour, timestamp));

        resultArbitrage.push(arb);
      }
    }

    const arbFinished: Arbitration = new Arbitration(
      0,
      '',
      0,
      '',
      0,
      0,
      0,
      await this.calculateTokensPriceByHistory(this.tokensAmount, historyPerHour),
      await this.calculateTokensPriceByHistory(this.tokensAmountFixed, historyPerHour),
      timestamp
    );
    resultArbitrage.push(arbFinished);
    resultValues.push(
      await this.calculateRebalanceValues(this.endCalculationIndex, btcCount, historyPerHour, timestamp)
    );

    for (const [key, value] of this.tokensAmount) {
      console.log(key, 'before: ', this.tokensAmountFixed.get(key), 'after: ', value);
    }

    return new RebalanceHistory(resultValues, resultArbitrage);
  }

  public async calculateCap(origin: boolean): Promise<number> {
    const historyPerHour: Map<string, number> = new Map();
    this.selectedTokensHistory.forEach((value, key) => {
      historyPerHour.set(key, value[this.endCalculationIndex].value);
    });

    return await this.calculateCapByHistory(
      origin ? this.tokensAmountFixed : this.tokensAmount, historyPerHour
    );
  }

  public onProgress(percents: number): void {
    // only for implement null-object pattern
  }

  public getStepSec(): number {
    return this.cryptocurrencyRepository.getStepSec();
  }

  public isFakeMode(): boolean {
    return this.isFakeModeEnabled;
  }

  public setupRepository(repo: CryptocurrencyRepository, isFake: boolean): void {
    this.cryptocurrencyRepository = repo;
    this.isFakeModeEnabled = isFake;
  }

  public disableArbitrage(disabled: boolean): void {
    this.isDisabledArbitrage = disabled;
  }

  public disabledArbitrage(): boolean {
    return this.isDisabledArbitrage;
  }

  public disableManualRebalance(disabled: boolean): void {
    this.isDisabledManualRebalance = disabled;
  }

  public disabledManualRebalance(): boolean {
    return this.isDisabledManualRebalance;
  }

  public setExchangeAmount(value: number): void {
    this.exchangeAmount = value;
  }

  public getExchangeAmount(): number {
    return this.exchangeAmount;
  }

  private prepareExchanges(amount: number, startTime: number, endTime: number): void {
    let balance: number = amount;

    while (balance > 0) {
      const timeLineValue = Math.round(this.random(endTime, startTime));

      if (!this.exchangeValues.has(timeLineValue)) {
        const priceValue = this.random(0.1, 0.01) * amount;
        this.exchangeValues.set(timeLineValue, priceValue);
        balance -= Math.min(priceValue, balance);
      }
    }
  }

  private exchangeTokens(timeLineValue: number, price: Map<string, number>, balances: Map<string, number>) {
    if (!this.exchangeValues.has(timeLineValue)) {
      return;
    }

    const tokens: string[] = Array.from(price.keys());

    while (true) {
      const firstToken: string = tokens[Math.round(this.random(0, tokens.length - 1))];
      const secondToken: string = tokens[Math.round(this.random(0, tokens.length - 1))];

      if (firstToken !== secondToken) {
        const count: number = (this.exchangeValues.get(timeLineValue) || 0) / (price.get(firstToken) || 1);

        if ((balances.get(firstToken) || 0) >= count) {
          const exchanged: number = this.contractSellTokens(firstToken, secondToken, count);

          console.log(
            'exchange (tokenA, tokenB, count, exchange $, tokenA price, exchanged):',
            firstToken, secondToken, count, this.exchangeValues.get(timeLineValue), price.get(firstToken), exchanged
          );

          this.acceptTransaction(new Arbitration(
            0, firstToken, count, secondToken, exchanged, 0, 0,
            TokenManagerImpl.EMPTY_MAP, TokenManagerImpl.EMPTY_MAP, 0
          ));
          return;
        }
      }
    }
  }

  private random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private resetDefaultValues(): void {
    this.amount = 10000;
    this.setCommission(3.0);
    this.proportions = [];
    this.tokenWeights = [];
    this.startCalculationIndex = 0;
    this.endCalculationIndex = 0;
    this.maxCalculationIndex = 0;
    this.isDisabledArbitrage = false;
    this.isDisabledManualRebalance = false;
    this.exchangeAmount = 0;
    this.exchangeValues.clear();
  }

  private async calculateRebalanceValues(indexTimeLine: number,
                                         btcCount: number,
                                         historyPerHour: Map<string, number>,
                                         timestamp: number): Promise<RebalanceValues> {
    const bitcoinCap: number = btcCount * this.btcHistoryPrice[indexTimeLine].value;
    return new RebalanceValues(
      await this.calculateCapByHistory(this.tokensAmount, historyPerHour),
      await this.calculateCapByHistory(this.tokensAmountFixed, historyPerHour),
      bitcoinCap,
      timestamp
    );
  }

  private applyCustomProportionsFixed(indexOfHistory: number,
                                      historyPrice: Map<string, number>,
                                      weights: Map<string, number>,
                                      amounts: Map<string, number>): boolean {
    const proportions: Pair<Token, Token> | undefined = this.tokensWeightTimeline.get(indexOfHistory);
    if (!proportions) {
      return false;
    }

    let amount: number = 0;
    let maxProportions: number = 0;

    amounts.forEach((value, key) => amount += value * (historyPrice.get(key) || 0));

    proportions.toArray().forEach(token => {
      weights.set(token.name, token.weight);
    });

    weights.forEach((value, key) => maxProportions += value);

    historyPrice.forEach((value, key) => {
      const weight: number = weights.get(key) || 0;

      const amountPerCurrency = weight / maxProportions * amount;

      const count: number = amountPerCurrency / value;

      console.log(
        'recalc weights, name/weight/amount/count/price(per one)/', key, weight, amountPerCurrency,
        count,
        value,
        count * value
      );

      amounts.set(key, count);
    });

    return true;
  }

  private async calculateCapByHistory(tokensAmounts: Map<string, number>,
                                      history: Map<string, number>): Promise<number> {
    let cap: number = 0;

    tokensAmounts.forEach((value, key) => {
      cap += value * (history.get(key) || 0);
    });

    return cap;
  }

  private async calculateTokensPriceByHistory(tokensAmounts: Map<string, number>,
                                              history: Map<string, number>): Promise<Map<string, number>> {
    const result: Map<string, number> = new Map();

    tokensAmounts.forEach((value, key) => {
      result.set(key, value * (history.get(key) || 0));
    });

    return result;
  }

  private async calculateArbiterProfit(cheapName: string,
                                       cheapWeight: number,
                                       cheapBalance: number,
                                       cheapPrice: number,
                                       expensiveName: string,
                                       expensiveWeight: number,
                                       expensiveBalance: number,
                                       expensivePrice: number,
                                       txPrice: number): Promise<ArbiterProfit> {
    // x = sqrt(p_2 * s_1 * b_1 * b_2 / p_1 / s_2) - b_1

    const max: number = Math.sqrt(
      expensivePrice *
      cheapWeight *
      cheapBalance *
      expensiveBalance /
      (cheapPrice * expensiveWeight)
    ) - cheapBalance;

    const percent: number = max / cheapBalance;

    if (max > 0) {
      const contractSellTokens: number =
        this.contractSellTokens(cheapName, expensiveName, max);

      const profit: number =
        (contractSellTokens * expensivePrice) - (txPrice + (max * cheapPrice));

      return new ArbiterProfit(percent, expensiveName, contractSellTokens, cheapName, max, profit);
    }

    return new ArbiterProfit(percent, '', 0, '', max, 0);
  }

  private contractSellTokens(fromSymbol: string, toSymbol: string, amount: number): number {
    // https://github.com/MultiTKN/MultiTKN/blob/master/contracts/MultiToken.sol#L33
    const fromBalance: number = this.tokensAmount.get(fromSymbol) || 0;
    const fromWeight: number = this.tokensWeight.get(fromSymbol) || 0;
    const toBalance: number = this.tokensAmount.get(toSymbol) || 0;
    const toWeight: number = this.tokensWeight.get(toSymbol) || 0;

    // const diffPercentFrom: number = (this.tokensAmountFixed.get(fromSymbol) || 0) / fromBalance;
    // let percent: number = Math.min(Math.max(0.1, diffPercentFrom), 0.9);
    //
    // const diffPercentTo: number = (this.tokensAmountFixed.get(toSymbol) || 0) / toBalance;
    // const percentTo: number = Math.min(Math.max(0.3, diffPercentTo), 0.9);
    //
    // percent = Math.max(percent, percentTo);

    const from = (fromBalance / ((fromWeight / this.maxWeight) * 100)) * 100;
    const to = (toBalance / ((toWeight / this.maxWeight) * 100)) * 100;
    const percent = from > to
      ? 0.8
      : 0.1;
    // console.log(percent);

    return toBalance *
      amount *
      fromWeight /
      ((fromBalance + amount) * toWeight) * percent;
  }

  private acceptTransaction(arbitration: Arbitration): void {
    const cheapAmounts: number = this.tokensAmount.get(arbitration.cheapName) || 0;
    const expensiveAmounts: number = this.tokensAmount.get(arbitration.expensiveName) || 0;
    const cheapResult: number = cheapAmounts + arbitration.cheapCount;
    const expensiveResult: number = expensiveAmounts - arbitration.expensiveCount;

    if (cheapResult <= 0 || expensiveResult <= 0) {
      console.log(arbitration);
      console.log(cheapAmounts, cheapResult);
      console.log(expensiveAmounts, expensiveResult);
      throw new Error('wrong calculation');
    }

    this.tokensAmount.set(arbitration.cheapName, cheapResult);
    this.tokensAmount.set(arbitration.expensiveName, expensiveResult);
    // console.log(
    //     'exp',
    //     this.tokensAmount.get(arbitration.expensiveName),
    //     'che',
    //     this.tokensAmount.get(arbitration.cheapName)
    // );
  }

}
