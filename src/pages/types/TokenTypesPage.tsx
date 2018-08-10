import * as Sentry from '@sentry/browser';
import { Layout } from 'antd';
import * as React from 'react';
import PageHeader from '../../components/page-header/PageHeader';
import TokenTypeHolder from '../../components/token-type/TokenTypeHolder';
import { lazyInject, Services } from '../../Injections';
import { AnalyticsManager } from '../../manager/analytics/AnalyticsManager';
import { PortfolioManager } from '../../manager/multitoken/PortfolioManager';
import { TokenType } from '../../manager/multitoken/PortfolioManagerImpl';
import ImgBalance from '../../res/icons/balance.svg';
import ImgBalanceCustom from '../../res/icons/balance_custom.svg';
import ImgBalanceOff from '../../res/icons/balance_off.svg';
import './TokenTypesPage.less';

export default class TokenTypesPage extends React.Component<any, {}> {

  @lazyInject(Services.PORTFOLIO_MANAGER)
  private portfolioManager: PortfolioManager;
  @lazyInject(Services.ANALYTICS_MANAGER)
  private analyticsManager: AnalyticsManager;

  constructor(props: any, context: any) {
    super(props, context);

    this.analyticsManager.trackPage('/select-type-page');
  }

  public componentDidMount(): void {
    if (this.portfolioManager.getPriceHistory().size === 0) {
      // Redirect to root
      window.location.replace('/calculator');
    }
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    Sentry.captureException(error);
  }

  public render() {
    return (
      <Layout
        style={{
          minHeight: '100vh',
          minWidth: 320,
        }}
      >
        <PageHeader/>
        <header className="TokenTypesPage__header">
          Select of rebalancing
        </header>

        <div className="TokenTypesPage__content">
          <TokenTypeHolder
            title="Period rebalance"
            img={ImgBalanceCustom}
            desc={<span>Change the proportion of assets by time period after creating a multitoken.</span>}
            onItemClick={() => this.onTokenTypeSelected(TokenType.PERIOD_REBALANCE)}
          />
          <TokenTypeHolder
            title="Diff percent rebalance"
            img={ImgBalanceCustom}
            desc={<span>Change the proportion of assets by diff percent</span>}
            onItemClick={() => this.onTokenTypeSelected(TokenType.DIFF_PERCENT_REBALANCE)}
          />
          <TokenTypeHolder
            title="Auto rebalance"
            img={ImgBalance}
            onItemClick={() => this.onTokenTypeSelected(TokenType.AUTO_REBALANCE)}
            desc={<span>Keeps the specified ratio of portfolio proportions.</span>}
          />
          <TokenTypeHolder
            title="Auto rebalance with dynamic exchange"
            img={ImgBalance}
            onItemClick={() => this.onTokenTypeSelected(TokenType.ADAPTIVE_PERCENT_EXCHANGER)}
            desc={<span>Keeps the specified ratio of portfolio proportions. With adaptive exchange proportions</span>}
          />
          <TokenTypeHolder
            title="Fix proportions"
            img={ImgBalanceOff}
            desc={<span>The number of tokens in the portfolio will be constant.</span>}
            onItemClick={() => this.onTokenTypeSelected(TokenType.FIX_PROPORTIONS)}
          />
          <TokenTypeHolder
            title="Manual rebalance"
            img={ImgBalanceCustom}
            desc={<span>Change the proportion of assets manually after creating a multitoken.</span>}
            onItemClick={() => this.onTokenTypeSelected(TokenType.MANUAL_REBALANCE)}
          />
        </div>

      </Layout>
    );
  }

  private onTokenTypeSelected(type: TokenType): void {
    this.analyticsManager.trackEvent('button', 'click', type);
    this.portfolioManager.setTokenType(type);
    const {history} = this.props;
    history.push('calculator');
  }

}
