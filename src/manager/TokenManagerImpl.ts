import { BigNumber } from 'bignumber.js';
import { injectable } from 'inversify';
import 'reflect-metadata';
import Config from '../Config';
import { CryptocurrencyRepository } from '../repository/cryptocurrency/CryptocurrencyRepository';
import { ArbiterProfit } from '../repository/models/ArbiterProfit';
import { Arbitration } from '../repository/models/Arbitration';
import Pair from '../repository/models/Pair';
import { Token } from '../repository/models/Token';
import { TokenPriceHistory } from '../repository/models/TokenPriceHistory';
import { TokenManager } from './TokenManager';

@injectable()
export default class TokenManagerImpl implements TokenManager {

  private cryptocurrencyRepository: CryptocurrencyRepository;
  private readonly selectedTokensHistory: Map<string, TokenPriceHistory[]> = new Map();
  private readonly tokensAmount: Map<string, number> = new Map();
  private readonly tokensAmountFixed: Map<string, number> = new Map();
  private readonly tokensWeight: Map<string, number> = new Map();
  private readonly tokensWeightTimeline: Map<number, Pair<Token, Token>> = new Map();
  private startCalculationIndex: number;
  private endCalculationIndex: number;
  private maxCalculationIndex: number;

  constructor(cryptocurrencyRepository: CryptocurrencyRepository) {
    this.cryptocurrencyRepository = cryptocurrencyRepository;
  }

  public async setupTokens(tokenSymbols: string[]): Promise<Map<string, TokenPriceHistory[]>> {
    this.selectedTokensHistory.clear();
    this.tokensAmount.clear();
    this.tokensAmountFixed.clear();
    this.tokensWeight.clear();
    this.startCalculationIndex = 0;
    this.endCalculationIndex = 0;
    this.maxCalculationIndex = 0;

    for (const item of tokenSymbols) {
      try {
        const result: TokenPriceHistory[] = await this.cryptocurrencyRepository
          .getHistoryPrice(item, 'USD', 2000);

        this.selectedTokensHistory.set(item, result);

        if (this.maxCalculationIndex <= 0 || this.maxCalculationIndex > result.length) {
          this.maxCalculationIndex = result.length;
          this.endCalculationIndex = this.maxCalculationIndex - 1;
        }
      } catch (e) {
        console.error(`error sync ${item}: ${e}`);
      }
    }

    return this.selectedTokensHistory;
  }

  public changeProportions(proportions: Map<string, number>) {
    proportions.forEach((value, key) => {
      console.log('set weight', key, value);
      this.tokensWeight.set(key, value);
    });
  }

  public getExchangedWeights(): Map<number, Pair<Token, Token>> {
    return this.tokensWeightTimeline;
  }

  public setExchangeWeights(tokenWeights: Map<number, Pair<Token, Token>>): void {
    this.tokensWeightTimeline.clear();
    tokenWeights.forEach((value, key) => {
      this.tokensWeightTimeline.set(key, value);
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

  public getMaxCalculationIndex(): number {
    return this.maxCalculationIndex;
  }

  public getPriceHistory(): Map<string, TokenPriceHistory[]> {
    return this.selectedTokensHistory;
  }

  public async getAvailableTokens(): Promise<Map<string, string>> {
    return this.cryptocurrencyRepository.getAvailableCurrencies();
  }

  public async calculateInitialAmounts(amount: number): Promise<Map<string, number>> {
    const result: Map<string, number> = new Map();
    let maxProportions: number = 0;

    this.tokensWeight.forEach((value) => {
      maxProportions += value;
    });

    const btcAmount: BigNumber = new BigNumber(amount).div(Config.getBtcUsdPrice());
    console.log('Amount$ -> BTC', amount, btcAmount.toNumber());

    this.selectedTokensHistory
      .forEach((value, key) => {
        if (!this.tokensWeight.has(key)) {
          console.log('token weight not found!!!!', key);
          this.tokensWeight.set(key, 1);
        }
        const weight: number = this.tokensWeight.get(key) || 0;

        const btc: BigNumber = new BigNumber(weight)
          .div(maxProportions)
          .multipliedBy(btcAmount);

        const count: number = btc.div(value[this.startCalculationIndex].value).toNumber();

        console.log(
          'name/weight/btc/count/price(per one)/', key, weight, btc.toNumber(), count,
          value[this.startCalculationIndex].value,
          new BigNumber(count)
            .multipliedBy(value[this.startCalculationIndex].value)
            .multipliedBy(Config.getBtcUsdPrice())
            .toNumber()
        );

        result.set(key, count);
        this.tokensAmount.set(key, count);
        this.tokensAmountFixed.set(key, count);
      });

    return result;
  }

  public async calculateArbitration(): Promise<Arbitration[]> {
    const result: Arbitration[] = [];
    const historyPerHour: Map<string, number> = new Map();
    let timestamp: number = 0;

    for (let i = this.startCalculationIndex; i < (this.endCalculationIndex + 1); i++) {
      historyPerHour.clear();

      this.selectedTokensHistory.forEach((value, key) => {
        historyPerHour.set(key, value[i].value);
        timestamp = value[i].time;
      });

      this.applyCustomProportions(i);

      const txPrice: number = (Math.random() * 0.5 + 0.2) / Config.getBtcUsdPrice(); // max $0.5 min $0.2
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
          0,
          await this.calculateCapByHistory(this.tokensAmountFixed, historyPerHour),
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

        arb.arbiterCap = await this.calculateCapByHistory(this.tokensAmount, historyPerHour);
        arb.arbiterTokensCap = await this.calculateTokensPriceByHistory(this.tokensAmount, historyPerHour);

        result.push(arb);
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
      await this.calculateCapByHistory(this.tokensAmount, historyPerHour),
      await this.calculateCapByHistory(this.tokensAmountFixed, historyPerHour),
      await this.calculateTokensPriceByHistory(this.tokensAmount, historyPerHour),
      await this.calculateTokensPriceByHistory(this.tokensAmountFixed, historyPerHour),
      timestamp
    );
    result.push(arbFinished);

    for (const [key, value] of this.tokensAmount) {
      console.log(key, 'before: ', this.tokensAmountFixed.get(key), 'after: ', value);
    }

    return result;
  }

  public async calculateCap(): Promise<number> {
    const historyPerHour: Map<string, number> = new Map();
    this.selectedTokensHistory.forEach((value, key) => {
      historyPerHour.set(key, value[this.endCalculationIndex].value);
    });

    return await this.calculateCapByHistory(this.tokensAmount, historyPerHour);
  }

  private applyCustomProportions(indexOfHistory: number) {
    const proportions: Pair<Token, Token> | undefined = this.getExchangedWeights().get(indexOfHistory);
    if (!proportions) {
      return;
    }

    proportions.toArray().forEach(token => {
      const oldWeight: number = this.tokensWeight.get(token.name) || 0;
      const amount: number = this.tokensAmount.get(token.name) || 0;
      let reCalcAmount: number = 0;

      try {
        reCalcAmount = new BigNumber(amount)
          .multipliedBy(token.weight)
          .div(oldWeight)
          .toNumber();

        console.log(
          `indexOfHistory: ${indexOfHistory} 
           name: ${token.name};
           oldWeight: ${oldWeight};
           newWeight: ${token.weight};
           amount: ${amount};
           newAmount: ${reCalcAmount}`
        );
      } catch (e) {
        console.log(e);
      }

      if (reCalcAmount > 0) {
        this.tokensWeight.set(token.name, token.weight);
        this.tokensAmount.set(token.name, reCalcAmount);

      } else {
        throw new Error(
          `invalid value of recalculate amount!
                     indexOfHistory: ${indexOfHistory} 
                     name: ${token.name};
                     oldWeight: ${oldWeight};
                     newWeight: ${token.weight};
                     amount: ${amount};
                     newAmount: ${reCalcAmount}`
        );
      }
    });
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
      expensivePrice * cheapWeight *
      cheapBalance * expensiveBalance /
      cheapPrice / expensiveWeight
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
    const fromBalance: BigNumber = new BigNumber(this.tokensAmount.get(fromSymbol) || 0);
    const fromWeight: number = this.tokensWeight.get(fromSymbol) || 0;
    const toBalance: BigNumber = new BigNumber(this.tokensAmount.get(toSymbol) || 0);
    const toWeight: number = this.tokensWeight.get(toSymbol) || 0;

    // console.log(fromSymbol, fromWeight, toSymbol, toWeight);

    const result: number = toBalance
      .multipliedBy(amount)
      .multipliedBy(fromWeight)
      .div(toWeight)
      .div(fromBalance.plus(amount))
      .multipliedBy(0.998)
      .toNumber();
    // console.log('from', fromAmounts.toNumber());
    // console.log('to', toAmounts.toNumber());
    // console.log('amount', amount);
    // console.log('result', result);

    return result;
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
