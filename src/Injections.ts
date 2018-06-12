import getDecorators from 'inversify-inject-decorators';
import { Container } from 'inversify';
import 'reflect-metadata';
import { TokenManager } from './manager/TokenManager';
import TokenManagerImpl from './manager/TokenManagerImpl';
import Config from './Config';
import { CryptocurrencyRepository } from './repository/cryptocurrency/CryptocurrencyRepository';
import { CryptocurrencyRepositoryImpl } from './repository/cryptocurrency/CryptocurrencyRepositoryImpl';

export enum Services {
    TOKEN_MANAGER = 'TokenManager'
}

let kernel = new Container();

let {
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
    new CryptocurrencyRepositoryImpl(Config.getCryptoCurrencyPriceApi());

kernel.bind<TokenManager>(Services.TOKEN_MANAGER)
    .toConstantValue(new TokenManagerImpl(cryptocurrencyRepository));
