import Config from '../../Config';
import { CryptocurrencyRepository } from '../../repository/cryptocurrency/CryptocurrencyRepository';
import { CryptocurrencyTokensRepositoryImpl } from '../../repository/cryptocurrency/CryptocurrencyTokensRepositoryImpl';
import { RebalanceHistory } from '../../repository/models/RebalanceHistory';
import { ArbitrageursExecutor } from './executors/ArbitrageurExecutor';
import { CapCalculatorExecutor } from './executors/CapCalculatorExecutor';
import { ExchangerPercentsExecutorImpl } from './executors/ExchangePercentsExecutorImpl';
import { ManualRebalancerExecutorImpl } from './executors/ManualRebalancerExecutorImpl';
import { TimeLineExecutor } from './executors/TimeLineExecutor';
import { Multitoken } from './multitoken/Multitoken';
import { MultitokenImpl } from './multitoken/MultitokenImpl';
import { PortfolioManager } from './PortfolioManager';
import PortfolioManagerImpl from './PortfolioManagerImpl';

export class PortfolioFactory {

  public static createDefaultPortfolio(): PortfolioManager {
    const cryptocurrencyRepository: CryptocurrencyRepository =
      new CryptocurrencyTokensRepositoryImpl(Config.getStatic());

    const multitoken: Multitoken = new MultitokenImpl(RebalanceHistory.MULTITOKEN_NAME_REBALANCE);
    const standardMultitoken: Multitoken = new MultitokenImpl(RebalanceHistory.MULTITOKEN_NAME_STANDARD);

    const exchanger: TimeLineExecutor = new ExchangerPercentsExecutorImpl(multitoken, 10);
    const arbitrageurs: TimeLineExecutor = new ArbitrageursExecutor(multitoken, 9);
    const manualRebalancer: TimeLineExecutor = new ManualRebalancerExecutorImpl(multitoken, 8);
    const capCalculator: TimeLineExecutor = new CapCalculatorExecutor([multitoken, standardMultitoken], 7);

    return new PortfolioManagerImpl(
      cryptocurrencyRepository,
      [multitoken, standardMultitoken],
      [exchanger, arbitrageurs, manualRebalancer, capCalculator]
    );
  }

}
