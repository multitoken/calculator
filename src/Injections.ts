import { Container } from 'inversify';
import getDecorators from 'inversify-inject-decorators';
import 'reflect-metadata';
import Config from './Config';
import { TokenManager } from './manager/TokenManager';
import TokenManagerImpl from './manager/TokenManagerImpl';
import { CryptocurrencyRepository } from './repository/cryptocurrency/CryptocurrencyRepository';
import { CryptocurrencyTokensRepositoryImpl } from './repository/cryptocurrency/CryptocurrencyTokensRepositoryImpl';

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

kernel.bind<TokenManager>(Services.TOKEN_MANAGER)
  .toConstantValue(new TokenManagerImpl(cryptocurrencyRepository));
