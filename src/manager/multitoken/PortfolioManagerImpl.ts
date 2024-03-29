import { injectable } from 'inversify';
import 'reflect-metadata';
import { CryptocurrencyRepository } from '../../repository/cryptocurrency/CryptocurrencyRepository';
import { PortfolioRepository } from '../../repository/history/PortfolioRepository';
import { Arbitration } from '../../repository/models/Arbitration';
import { Exchange } from '../../repository/models/Exchange';
import { ExecuteResult } from '../../repository/models/ExecuteResult';
import { Portfolio } from '../../repository/models/Portfolio';
import { PortfolioOptions } from '../../repository/models/PortfolioOptions';
import { RebalanceHistory } from '../../repository/models/RebalanceHistory';
import { RebalanceValues } from '../../repository/models/RebalanceValues';
import { TokenPriceHistory } from '../../repository/models/TokenPriceHistory';
import { TokenProportion } from '../../repository/models/TokenProportion';
import { TokenWeight } from '../../repository/models/TokenWeight';
import { MapUtils } from '../../utils/MapUtils';
import { DiffPercentRebalanceExecutorImpl } from './executors/DiffPercentRebalanceExecutorImpl';
import { ExchangerExecutor } from './executors/ExchangerExecutor';
import { ExchangerExecutorImpl } from './executors/ExchangerExecutorImpl';
import { ManualRebalancerExecutor } from './executors/ManualRebalancerExecutor';
import { ManualRebalancerExecutorImpl } from './executors/ManualRebalancerExecutorImpl';
import { PeriodRebalanceExecutorImpl } from './executors/PeriodRebalanceExecutorImpl';
import { ExecutorType, TimeLineExecutor } from './executors/TimeLineExecutor';
import { Multitoken } from './multitoken/Multitoken';
import { PortfolioManager } from './PortfolioManager';
import { ProgressListener } from './ProgressListener';
import { RebalanceResult } from './RebalanceResult';
import { RebalanceResultImpl } from './RebalanceResultImpl';

export enum TokenType {
  AUTO_REBALANCE = 'AUTO_REBALANCE',
  FIX_PROPORTIONS = 'FIX_PROPORTIONS',
  MANUAL_REBALANCE = 'MANUAL_REBALANCE',
  PERIOD_REBALANCE = 'PERIOD_REBALANCE',
  DIFF_PERCENT_REBALANCE = 'DIFF_PERCENT_REBALANCE',
  ADAPTIVE_PERCENT_EXCHANGER = 'ADAPTIVE_PERCENT_EXCHANGER',
  UNDEFINED = 'UNDEFINED',
}

@injectable()
export default class PortfolioManagerImpl implements PortfolioManager, ProgressListener {

  protected selectedTokensHistory: Map<string, TokenPriceHistory[]> = new Map();
  protected btcHistoryPrice: TokenPriceHistory[] = [];
  protected rebalanceResult: RebalanceResult;

  private cryptocurrencyRepository: CryptocurrencyRepository;
  private portfolioRepository: PortfolioRepository;

  private readonly tokensAmount: Map<string, number> = new Map();
  private readonly tokensWeight: Map<string, number> = new Map();
  private multitokens: Multitoken[];
  private executors: Map<ExecutorType, TimeLineExecutor>;

  private startCalculationIndex: number;
  private endCalculationIndex: number;
  private maxCalculationIndex: number;
  private amount: number;
  private commissionPercent: number;
  private exchangeAmount: number;

  private listener: ProgressListener;
  private initialProportions: TokenProportion[];
  private rebalanceWeights: TokenWeight[];

  private tokenType: TokenType;
  private rebalancePeriod: number;
  private rebalanceDiffPercent: number;

  constructor(cryptocurrencyRepository: CryptocurrencyRepository,
              portfolioRepository: PortfolioRepository,
              multitokens: Multitoken[],
              executors: TimeLineExecutor[]) {
    this.resetDefaultValues();

    this.cryptocurrencyRepository = cryptocurrencyRepository;
    this.portfolioRepository = portfolioRepository;
    this.multitokens = multitokens;
    this.executors = new Map();
    this.rebalanceResult = new RebalanceResultImpl(this);

    executors.forEach(executor => this.executors.set(executor.getType(), executor));

    this.listener = this;
  }

  public getRebalanceResult(): RebalanceResult {
    return this.rebalanceResult;
  }

  public async getPortfolios(email: string): Promise<Portfolio[]> {
    return (await this.portfolioRepository.getByEmail(email))
      .map(portfolio => {
          portfolio.executors = this.getExecutorsByType(TokenType[portfolio.type])
            .map(value => value.getType());
          return portfolio;
        }
      );
  }

  public async loadPortfolio(email: string, id: number): Promise<void> {
    const portfolio: Portfolio = await this.portfolioRepository.getByEmailAndId(email, id);
    const options: PortfolioOptions = portfolio.options;

    this.resetDefaultValues();

    await this.setupTokens(options.proportions.map(value => value.name));
    this.setTokenType(TokenType[portfolio.type]);

    this.setRebalanceWeights(options.rebalanceWeights);
    this.setRebalancePeriod(options.rebalancePeriod);
    this.changeProportions(options.proportions);
    this.setAmount(portfolio.amount);
    this.setCommission(options.commissionPercents);
    this.setRebalanceDiffPercent(options.rebalanceDiffPercent);
    this.setExchangeAmount(options.exchangeAmount);
    this.changeCalculationDate(options.dateIndexStart, options.dateIndexEnd);
  }

  public savePortfolio(portfolio: Portfolio): Promise<void> {
    return this.portfolioRepository.save(portfolio);
  }

  public getBtcPrice(): TokenPriceHistory[] {
    return this.btcHistoryPrice;
  }

  public getExecutorsByTokenType(): string[] {
    try {
      return this.getExecutorsByType(this.tokenType)
        .map(value => value.getType().toString());
    } catch (e) {
      console.log(e);
    }

    return [];
  }

  public setAmount(amount: number): void {
    this.amount = amount;
  }

  public getAmount(): number {
    return this.amount;
  }

  public setTokenType(tokenType: TokenType): void {
    this.tokenType = tokenType;
  }

  public getTokenType(): TokenType {
    return this.tokenType;
  }

  public getTokens(): string[] {
    return Array.from(this.tokensAmount.keys());
  }

  public async setupTokens(tokenSymbols: string[]): Promise<Map<string, TokenPriceHistory[]>> {
    this.tokensAmount.clear();
    this.tokensWeight.clear();

    this.resetDefaultValues();
    const btcAlreadyExist: boolean = tokenSymbols.indexOf('Bitcoin') > -1;
    const completeTokenList: string[] = btcAlreadyExist ? tokenSymbols : ['Bitcoin'].concat(tokenSymbols);
    this.selectedTokensHistory = await this.cryptocurrencyRepository.getHistoryPrices(completeTokenList);

    this.btcHistoryPrice = this.selectedTokensHistory.get('Bitcoin') || [];

    this.maxCalculationIndex = this.btcHistoryPrice.length - 1;
    this.endCalculationIndex = this.maxCalculationIndex - 1;

    console.log(`${this.endCalculationIndex}, ${this.btcHistoryPrice[0].value}`);

    if (!btcAlreadyExist) {
      this.selectedTokensHistory.delete('Bitcoin');
    }

    return this.selectedTokensHistory;
  }

  public setCommission(commissionPercents: number): void {
    this.commissionPercent = commissionPercents;
  }

  public getCommission(): number {
    return this.commissionPercent;
  }

  public changeProportions(proportions: TokenProportion[]) {
    this.initialProportions = proportions;
    proportions.forEach((token) => {
      this.tokensWeight.set(token.name, token.weight);
    });
  }

  public getProportions(): TokenProportion[] {
    return this.initialProportions;
  }

  public getRebalanceWeights(): TokenWeight[] {
    return this.rebalanceWeights;
  }

  public setRebalanceWeights(tokenWeights: TokenWeight[]): void {
    this.rebalanceWeights = tokenWeights;
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

  public getCalculationDateIndex(): number | [number, number] {
    return [this.startCalculationIndex, this.endCalculationIndex];
  }

  public getCalculationTimestamp(): [number, number] {
    return [this.btcHistoryPrice[this.startCalculationIndex].time, this.btcHistoryPrice[this.endCalculationIndex].time];
  }

  public getMaxCalculationIndex(): number {
    return this.maxCalculationIndex;
  }

  public getMaxCalculationTimestamp(): number {
    return this.btcHistoryPrice[this.getMaxCalculationIndex()].time;
  }

  public getPriceHistory(): Map<string, TokenPriceHistory[]> {
    return this.selectedTokensHistory;
  }

  public async getAvailableTokens(): Promise<Map<string, string>> {
    return this.cryptocurrencyRepository.getAvailableCurrencies();
  }

  public getTokensAmounts(): Map<string, number> {
    return MapUtils.clone(this.tokensAmount);
  }

  public calculateInitialAmounts(): Map<string, number> {
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

        result.set(key, count);
        this.tokensAmount.set(key, count);
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

  public async calculate(): Promise<RebalanceResult> {
    const historyInTimeLine: Map<string, number> = new Map();
    let timestamp: number = 0;
    const btcAmount: number = this.amount / this.btcHistoryPrice[this.startCalculationIndex].value;
    const skipStep: number = 86400 /* sec in day */ / this.getStepSec();
    const result: Map<string, ExecuteResult[]> = new Map();
    const executorsByType = this.getExecutorsByType(this.tokenType);

    console.log('executors:', executorsByType);

    this.listener.onProgress(1);

    console.log(
      this.startCalculationIndex, this.endCalculationIndex, this.selectedTokensHistory, this.btcHistoryPrice.length
    );
    let txPrice: number = 1; // parseFloat((Math.random() * (1.101 - 0.9) + 0.9).toFixed(2)); // min $0.9 max $1.10;

    this.multitokens.forEach(multitoken => {
      multitoken.setup(this.tokensAmount, this.tokensWeight);
      multitoken.setFixedCommission(this.commissionPercent);
    });

    // prepare initial state for executors
    executorsByType.forEach(executor => {
      executor.prepareCalculation(
        this.btcHistoryPrice, this.cryptocurrencyRepository.getStepSec(), this.exchangeAmount,
        this.startCalculationIndex, this.endCalculationIndex
      );

      if (executor instanceof ManualRebalancerExecutorImpl) {
        (executor as ManualRebalancerExecutor).setExchangeWeights(this.rebalanceWeights);

      } else if (executor instanceof ExchangerExecutorImpl) {
        (executor as ExchangerExecutor).setExchangeAmount(this.exchangeAmount);

      } else if (executor instanceof PeriodRebalanceExecutorImpl) {
        (executor as PeriodRebalanceExecutorImpl).setupPeriod(this.rebalancePeriod);

      } else if (executor instanceof DiffPercentRebalanceExecutorImpl) {
        (executor as DiffPercentRebalanceExecutorImpl).setupDiffPercent(this.rebalanceDiffPercent);
      }

      result.set(executor.getType(), []);
    });

    for (let i = this.startCalculationIndex; i < (this.endCalculationIndex + 1); i++) {
      if (i % 10000 === 0) {
        if (this.listener) {
          this.listener.onProgress(Math.round(
            (i - this.startCalculationIndex) / ((this.endCalculationIndex - this.startCalculationIndex) + 1) * 100
          ));
        }

        await this.wait();
      }

      historyInTimeLine.clear();

      this.selectedTokensHistory.forEach((value, key) => {
        historyInTimeLine.set(key, value[i].value);
        timestamp = value[i].time;
      });

      txPrice = 0.047 + 2.3 * Math.abs(Math.sin(i / 1000)); // gas 70k; 0.047 - 1.4 Gwei. 2.3 ~ 70 Gwei.

      let executeResult: ExecuteResult | undefined;

      for (const executor of executorsByType) {
        // add only first/last days and step every one day
        if (executor.getType() === ExecutorType.CAP_CLAMP &&
          (i % skipStep) !== 0 &&
          i !== this.startCalculationIndex &&
          i !== this.endCalculationIndex) {
          continue;
        }

        executeResult = executor.execute(i, historyInTimeLine, timestamp, btcAmount, txPrice);

        if (executeResult !== undefined) {
          (result.get(executor.getType()) || []).push(executeResult);
        }
      }
    }

    this.multitokens.forEach(multitoken =>
      console.log('after: ', multitoken.getName(), multitoken.getAmounts())
    );

    const rebalanceHistory: RebalanceHistory = new RebalanceHistory(
      (result.get(ExecutorType.CAP_CLAMP) || []) as RebalanceValues[],
      (result.get(ExecutorType.ARBITRAGEUR) || []) as Arbitration[],
      (result.get(ExecutorType.EXCHANGER) || [] ) as Exchange[]
    );

    this.rebalanceResult.calculateRebalanceHistory(rebalanceHistory);

    return this.rebalanceResult;
  }

  public onProgress(percents: number): void {
    // only for implement null-object pattern
  }

  public getStepSec(): number {
    return this.cryptocurrencyRepository.getStepSec();
  }

  public setExchangeAmount(value: number): void {
    this.exchangeAmount = value;
  }

  public getExchangeAmount(): number {
    return this.exchangeAmount;
  }

  public setRebalancePeriod(seconds: number): void {
    this.rebalancePeriod = seconds;
  }

  public getRebalancePeriod(): number {
    return this.rebalancePeriod;
  }

  public setRebalanceDiffPercent(percent: number): void {
    this.rebalanceDiffPercent = percent;
  }

  public getRebalanceDiffPercent(): number {
    return this.rebalanceDiffPercent;
  }

  protected resetDefaultValues(): void {
    this.setAmount(10000);
    this.setCommission(0.2);
    this.setRebalanceWeights([]);
    this.changeProportions([]);
    this.setExchangeAmount(10000);
    this.setTokenType(TokenType.UNDEFINED);
    this.setRebalancePeriod(604800);
    this.setRebalanceDiffPercent(45.0);

    this.startCalculationIndex = 0;
    this.endCalculationIndex = 0;
    this.maxCalculationIndex = 0;
  }

  private getExecutorsByType(type: TokenType): TimeLineExecutor[] {
    const result: TimeLineExecutor[] = [];

    switch (type) {
      case TokenType.AUTO_REBALANCE:
        result.push(
          this.getExecutorByType(ExecutorType.EXCHANGER),
          this.getExecutorByType(ExecutorType.ARBITRAGEUR)
        );
        break;

      case TokenType.ADAPTIVE_PERCENT_EXCHANGER:
        result.push(
          this.getExecutorByType(ExecutorType.ADAPTIVE_EXCHANGER),
          this.getExecutorByType(ExecutorType.ARBITRAGEUR)
        );
        break;

      case TokenType.FIX_PROPORTIONS:
        break;

      case TokenType.MANUAL_REBALANCE:
        result.push(
          this.getExecutorByType(ExecutorType.EXCHANGER),
          this.getExecutorByType(ExecutorType.MANUAL_REBALANCER)
        );
        break;

      case TokenType.PERIOD_REBALANCE:
        result.push(this.getExecutorByType(ExecutorType.PERIOD_REBALANCER));
        break;

      case TokenType.DIFF_PERCENT_REBALANCE:
        result.push(this.getExecutorByType(ExecutorType.DIFF_PERCENT_REBALANCER));
        break;

      default:
        throw new Error('unknown token type!');
    }

    result.push(this.getExecutorByType(ExecutorType.CAP_CLAMP));

    return result.sort((a, b) => b.getPriority() - a.getPriority());
  }

  private getExecutorByType(type: ExecutorType): TimeLineExecutor {
    const executor: TimeLineExecutor | undefined = this.executors.get(type);
    if (executor === undefined) {
      throw new Error('unknown type of executor');
    }

    return executor;
  }

}
