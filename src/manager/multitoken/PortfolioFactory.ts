import Config from '../../Config';
import { CryptocurrencyRepository } from '../../repository/cryptocurrency/CryptocurrencyRepository';
import { CryptocurrencyTokensRepositoryImpl } from '../../repository/cryptocurrency/CryptocurrencyTokensRepositoryImpl';
import { RebalanceHistory } from '../../repository/models/RebalanceHistory';
import { ArbitrageursExecutor } from './executors/ArbitrageurExecutor';
import { CapCalculatorExecutor } from './executors/CapCalculatorExecutor';
import { DiffPercentRebalanceExecutorImpl } from './executors/DiffPercentRebalanceExecutorImpl';
import { ExchangerPercentsExecutorImpl } from './executors/ExchangePercentsExecutorImpl';
import { ExchangerExecutorImpl } from './executors/ExchangerExecutorImpl';
import { ManualRebalancerExecutorImpl } from './executors/ManualRebalancerExecutorImpl';
import { PeriodRebalanceExecutorImpl } from './executors/PeriodRebalanceExecutorImpl';
import { TimeLineExecutor } from './executors/TimeLineExecutor';
import { FakePortfolioManagerImpl } from './FakePortfolioManagerImpl';
import { Multitoken } from './multitoken/Multitoken';
import { MultitokenImpl } from './multitoken/MultitokenImpl';
import { PortfolioManager } from './PortfolioManager';
import PortfolioManagerImpl from './PortfolioManagerImpl';

export class PortfolioFactory {

  public static createDefaultPortfolio(): PortfolioManager {
    const cryptocurrencyRepository: CryptocurrencyRepository =
      new CryptocurrencyTokensRepositoryImpl(Config.getStatic(), true);

    const multitoken: Multitoken = new MultitokenImpl(RebalanceHistory.MULTITOKEN_NAME_REBALANCE);
    const standardMultitoken: Multitoken = new MultitokenImpl(RebalanceHistory.MULTITOKEN_NAME_STANDARD);

    const exchanger: TimeLineExecutor = new ExchangerExecutorImpl(multitoken, 10);
    const arbitrageurs: TimeLineExecutor = new ArbitrageursExecutor(multitoken, 9);
    const manualRebalancer: TimeLineExecutor = new ManualRebalancerExecutorImpl(multitoken, 8);
    const periodRebalancer: TimeLineExecutor = new PeriodRebalanceExecutorImpl(multitoken, 7);
    const diffPercentRebalancer: TimeLineExecutor = new DiffPercentRebalanceExecutorImpl(multitoken, 6);
    const capCalculator: TimeLineExecutor = new CapCalculatorExecutor([multitoken, standardMultitoken], 0);

    return new PortfolioManagerImpl(
      cryptocurrencyRepository,
      [multitoken, standardMultitoken],
      [exchanger, arbitrageurs, manualRebalancer, periodRebalancer, diffPercentRebalancer, capCalculator]
    );
  }

  public static createDynamicPercentExchangePortfolio(): PortfolioManager {
    const cryptocurrencyRepository: CryptocurrencyRepository =
      new CryptocurrencyTokensRepositoryImpl(Config.getStatic(), true);

    const multitoken: Multitoken = new MultitokenImpl(RebalanceHistory.MULTITOKEN_NAME_REBALANCE);
    const standardMultitoken: Multitoken = new MultitokenImpl(RebalanceHistory.MULTITOKEN_NAME_STANDARD);

    const exchanger: TimeLineExecutor = new ExchangerPercentsExecutorImpl(multitoken, 10);
    const arbitrageurs: TimeLineExecutor = new ArbitrageursExecutor(multitoken, 9);
    const manualRebalancer: TimeLineExecutor = new ManualRebalancerExecutorImpl(multitoken, 8);
    const periodRebalancer: TimeLineExecutor = new PeriodRebalanceExecutorImpl(multitoken, 7);
    const diffPercentRebalancer: TimeLineExecutor = new DiffPercentRebalanceExecutorImpl(multitoken, 6);
    const capCalculator: TimeLineExecutor = new CapCalculatorExecutor([multitoken, standardMultitoken], 0);

    return new PortfolioManagerImpl(
      cryptocurrencyRepository,
      [multitoken, standardMultitoken],
      [exchanger, arbitrageurs, manualRebalancer, periodRebalancer, diffPercentRebalancer, capCalculator]
    );
  }

  public static createFakePortfolio(): PortfolioManager {
    const cryptocurrencyRepository: CryptocurrencyRepository =
      new CryptocurrencyTokensRepositoryImpl(Config.getStatic(), false);

    return new FakePortfolioManagerImpl(cryptocurrencyRepository, [], []);
  }

}
