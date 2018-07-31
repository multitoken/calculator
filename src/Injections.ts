import { Container } from 'inversify';
import getDecorators from 'inversify-inject-decorators';
import 'reflect-metadata';
import Config from './Config';
import { AnalyticsManager } from './manager/analytics/AnalyticsManager';
import { AnalyticsManagerImpl } from './manager/analytics/AnalyticsManagerImpl';
import { GoogleAnalyticsImpl } from './manager/analytics/GoogleAnalitycsImpl';
import { PortfolioFactory } from './manager/multitoken/PortfolioFactory';
import { PortfolioManager } from './manager/multitoken/PortfolioManager';

export enum Services {
  PORTFOLIO_MANAGER = 'PortfolioManager',
  ANALYTICS_MANAGER = 'AnalyticsManager'
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

kernel.bind<PortfolioManager>(Services.PORTFOLIO_MANAGER)
  .toConstantValue(PortfolioFactory.createDefaultPortfolio());

const googleAnalytics: GoogleAnalyticsImpl =
  new GoogleAnalyticsImpl(Config.getGoogleAnalyticsTrackId(), Config.isDebug());

const analyticsManager: AnalyticsManager = new AnalyticsManagerImpl([googleAnalytics]);

kernel.bind<AnalyticsManager>(Services.ANALYTICS_MANAGER)
  .toConstantValue(analyticsManager);
