import { MultiPortfolioExecutor } from './MultiPortfolioExecutor';
import { PortfolioManager } from './PortfolioManager';
import { ProgressListener } from './ProgressListener';
import { RebalanceResult } from './RebalanceResult';

export class MultiPortfolioExecutorImpl implements MultiPortfolioExecutor, ProgressListener {

  private portfoliosMap: Map<PortfolioManager, RebalanceResult>;

  private progressListener: ProgressListener | undefined;
  private progressValue: number;

  constructor() {
    this.portfoliosMap = new Map();
    this.progressValue = 0;
  }

  public addPortfolioManager(portfolioManager: PortfolioManager): void {
    if (!this.portfoliosMap.has(portfolioManager)) {
      this.portfoliosMap.set(portfolioManager, portfolioManager.getRebalanceResult());
      portfolioManager.subscribeToProgress(this);
    }
  }

  public getPortfolios(): Map<PortfolioManager, RebalanceResult> {
    const result: Map<PortfolioManager, RebalanceResult> = new Map();
    this.portfoliosMap.forEach((value, key) => result.set(key, value));

    return result;
  }

  public removeAllPortfolios(): void {
    this.portfoliosMap.forEach((value, key) => key.subscribeToProgress());
    this.portfoliosMap.clear();
  }

  public async executeCalculation(): Promise<RebalanceResult[]> {
    const result: RebalanceResult[] = [];
    let rebalanceResult: RebalanceResult;

    for (const portfolio of this.portfoliosMap.keys()) {
      await portfolio.calculateInitialAmounts();
      rebalanceResult = await portfolio.calculate();

      result.push(rebalanceResult);

      this.progressValue += 100;
    }

    this.progressValue = 0;

    return result;
  }

  public subscribeToProgress(listener?: ProgressListener): void {
    this.progressListener = listener;
  }

  public onProgress(percents: number): void {
    if (this.progressListener) {
      this.progressListener.onProgress(Math.trunc((this.progressValue + percents) / this.portfoliosMap.size));
    }
  }

}
