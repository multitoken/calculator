import { Container } from 'inversify';
import getDecorators from 'inversify-inject-decorators';
import 'reflect-metadata';
import Config from './Config';
import { ArbitrageursExecutor } from './manager/multitoken/executors/ArbitrageurExecutor';
import { CapCalculatorExecutor } from './manager/multitoken/executors/CapCalculatorExecutor';
import { ExchangerExecutor } from './manager/multitoken/executors/ExchangerExecutor';
import { ManualRebalancerExecutor } from './manager/multitoken/executors/ManualRebalancerExecutor';
import { ManualRebalancerExecutorImpl } from './manager/multitoken/executors/ManualRebalancerExecutorImpl';
import { TimeLineExecutor } from './manager/multitoken/executors/TimeLineExecutor';
import { Multitoken } from './manager/multitoken/multitoken/Multitoken';
import { MultitokenImpl } from './manager/multitoken/multitoken/MultitokenImpl';
import { TokenManager } from './manager/multitoken/TokenManager';
import TokenManagerImpl from './manager/multitoken/TokenManagerImpl';
import { CryptocurrencyRepository } from './repository/cryptocurrency/CryptocurrencyRepository';
import { CryptocurrencyTokensRepositoryImpl } from './repository/cryptocurrency/CryptocurrencyTokensRepositoryImpl';
import { RebalanceHistory } from './repository/models/RebalanceHistory';

export enum Services {
  TOKEN_MANAGER = 'TokenManager'
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

const exchanger: TimeLineExecutor = new ExchangerExecutor(multitoken, 10);
const arbitrageurs: TimeLineExecutor = new ArbitrageursExecutor(multitoken, 9);
const manualRebalancer: ManualRebalancerExecutor = new ManualRebalancerExecutorImpl(multitoken, 8);
const capCalculator: TimeLineExecutor = new CapCalculatorExecutor([multitoken, standardMultitoken], 7);

const tokenManager: TokenManager = new TokenManagerImpl(
  cryptocurrencyRepository,
  [multitoken, standardMultitoken],
  [exchanger, arbitrageurs, manualRebalancer, capCalculator]
);

kernel.bind<TokenManager>(Services.TOKEN_MANAGER)
  .toConstantValue(tokenManager);
