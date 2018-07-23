import { RebalanceHistory } from '../../repository/models/RebalanceHistory';
import { MultiPortfolioExecutor } from './MultiPortfolioExecutor';
import { PortfolioManager } from './PortfolioManager';
import { ProgressListener } from './ProgressListener';

export class MultiPortfolioExecutorImpl implements MultiPortfolioExecutor, ProgressListener {

  private portfoliosSet: Set<PortfolioManager>;
  private progressListener: ProgressListener | undefined;
  private progressValue: number;

  constructor() {
    this.portfoliosSet = new Set();
    this.progressValue = 0;
  }

  public addPortfolioManager(portfolioManager: PortfolioManager): void {
    this.portfoliosSet.add(portfolioManager);
    portfolioManager.subscribeToProgress(this);
  }

  public async executeCalculation(): Promise<RebalanceHistory[]> {
    const result: RebalanceHistory[] = [];

    for (const portfolio of this.portfoliosSet) {
      await portfolio.calculateInitialAmounts();
      result.push(await portfolio.calculate());
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
      this.progressListener.onProgress((this.progressValue + percents) / this.portfoliosSet.size);
    }
  }

}
