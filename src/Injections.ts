import { Container } from 'inversify';
import getDecorators from 'inversify-inject-decorators';
import 'reflect-metadata';
import Config from './Config';
import { ArbitrageursExecutor } from './manager/multitoken/executors/ArbitrageurExecutor';
import { CapCalculatorExecutor } from './manager/multitoken/executors/CapCalculatorExecutor';
import { ExchangerExecutorImpl } from './manager/multitoken/executors/ExchangerExecutorImpl';
import { ManualRebalancerExecutorImpl } from './manager/multitoken/executors/ManualRebalancerExecutorImpl';
import { TimeLineExecutor } from './manager/multitoken/executors/TimeLineExecutor';
import { Multitoken } from './manager/multitoken/multitoken/Multitoken';
import { MultitokenImpl } from './manager/multitoken/multitoken/MultitokenImpl';
import { PortfolioManager } from './manager/multitoken/PortfolioManager';
import PortfolioManagerImpl from './manager/multitoken/PortfolioManagerImpl';
import { CryptocurrencyRepository } from './repository/cryptocurrency/CryptocurrencyRepository';
import { CryptocurrencyTokensRepositoryImpl } from './repository/cryptocurrency/CryptocurrencyTokensRepositoryImpl';
import { RebalanceHistory } from './repository/models/RebalanceHistory';

export enum Services {
  PORTFOLIO_MANAGER = 'PortfolioManager'
}

const kernel = new Container();

const {
  lazyInject,
  lazyInjectNamed,
  lazyInjectTagged,
  lazyMultiInject
} = getDecorators(kernel);

export {
  kernel,
  lazyInject,
  lazyInjectNamed,
  lazyInjectTagged,
  lazyMultiInject
};

const cryptocurrencyRepository: CryptocurrencyRepository =
  new CryptocurrencyTokensRepositoryImpl(Config.getStatic());

const multitoken: Multitoken = new MultitokenImpl(RebalanceHistory.MULTITOKEN_NAME_REBALANCE);
const standardMultitoken: Multitoken = new MultitokenImpl(RebalanceHistory.MULTITOKEN_NAME_STANDARD);

const exchanger: TimeLineExecutor = new ExchangerExecutorImpl(multitoken, 10);
const arbitrageurs: TimeLineExecutor = new ArbitrageursExecutor(multitoken, 9);
const manualRebalancer: TimeLineExecutor = new ManualRebalancerExecutorImpl(multitoken, 8);
const capCalculator: TimeLineExecutor = new CapCalculatorExecutor([multitoken, standardMultitoken], 7);

const portfolioManager: PortfolioManager = new PortfolioManagerImpl(
  cryptocurrencyRepository,
  [multitoken, standardMultitoken],
  [exchanger, arbitrageurs, manualRebalancer, capCalculator]
);

kernel.bind<PortfolioManager>(Services.PORTFOLIO_MANAGER)
  .toConstantValue(portfolioManager);
