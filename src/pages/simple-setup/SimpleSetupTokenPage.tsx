import { Button, InputNumber, Layout } from 'antd';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import PageFooter from '../../components/page-footer/PageFooter';
import PageHeader from '../../components/page-header/PageHeader';
import { lazyInject, Services, } from '../../Injections';
import { AnalyticsManager } from '../../manager/analytics/AnalyticsManager';
import { FakeRebalanceResultImpl } from '../../manager/multitoken/FakeRebalanceResultImpl';
import { MultiPortfolioExecutor } from '../../manager/multitoken/MultiPortfolioExecutor';
import { PortfolioFactory } from '../../manager/multitoken/PortfolioFactory';
import { PortfolioManager } from '../../manager/multitoken/PortfolioManager';
import { TokenType } from '../../manager/multitoken/PortfolioManagerImpl';
import { TokenProportion } from '../../repository/models/TokenProportion';
import './SimpleSetupTokenPage.less';

interface Props extends RouteComponentProps<{}> {
}

interface State {
  amountBtc: number;
  isTokenLoading: boolean;
}

export default class SimpleSetupTokenPage extends React.Component<Props, State> {

  private static readonly PORTFOLIOS_COINS: string[][] = [
    ['Eth', 'Eth Classic', 'Verge', 'Waltonchain'],
    ['BAT', 'Cardano', 'Status'],
    ['BAT', 'Populous', 'Verge', 'Waltonchain'],
    ['Bitcoin', 'Eth Classic', 'Status'],
    ['BitShares', 'Populous', 'Status'],
    ['Populous', 'Verge', 'Waltonchain'],
    ['0x', 'Dash', 'Waltonchain'],
    ['Dash', 'Litecoin', 'Status'],
    ['Dash', 'Eth Classic', 'OmiseGO', 'Waltonchain'],
    ['EOS', 'Verge', 'Zcash'],
    ['BitShares', 'Cardano', 'Eth Classic', 'Populous'],
    ['BAT', 'Eth', 'Eth Classic', 'NEO'],
    ['Cardano', 'Monero', 'OmiseGO', 'Waltonchain'],
    ['NEO', 'Status', 'Zcash'],
    ['BAT', 'Eth Classic', 'NEO', 'OmiseGO']
  ];

  @lazyInject(Services.PORTFOLIOS_EXECUTOR)
  private portfolioExecutor: MultiPortfolioExecutor;
  @lazyInject(Services.ANALYTICS_MANAGER)
  private analyticsManager: AnalyticsManager;

  constructor(props: Props) {
    super(props);

    this.analyticsManager.trackPage('/simple-setup-page');

    this.state = {
      amountBtc: 1.00000000,
      isTokenLoading: false,
    };
  }

  public render() {
    return (
      <Layout
        style={{
          minHeight: '100vh',
          minWidth: 320,
          pointerEvents: this.state.isTokenLoading ? 'none' : 'auto'
        }}
      >
        <PageHeader/>

        <header className="SimpleSetupTokenPage__header">
          Enter the number of BTC that you hold. And Click next button.
        </header>

        <div className="SimpleSetupTokenPage">

          <InputNumber
            value={this.state.amountBtc}
            max={99999999}
            step={0.00000001}
            formatter={value => Math.min(99999999, parseFloat((value || '0').toString())).toFixed(8)}
            defaultValue={1.00000000}
            onChange={value => this.onAmountChange(parseFloat((value || '0.0000001').toString()))}
            style={{width: '200px'}}
          />

          <div>
            <span
              className="SimpleSetupTokenPage__content-button-back"
              onClick={e => {
                this.props.history.push('/');
                this.analyticsManager.trackEvent('button', 'click', 'to-new');
              }}
            >
              Start new
            </span>
            <Button
              type="primary"
              onClick={() => this.onCalculateClick()}
              loading={this.state.isTokenLoading}
              style={{
                marginLeft: 15,
                marginTop: 30}}
            >
              Calculate
            </Button>
          </div>
        </div>
        <PageFooter/>
      </Layout>
    );
  }

  private onAmountChange(value: number) {
    this.setState({amountBtc: value});
  }

  private getIdByCoins(coins: string[]): string {
    coins.sort((a, b) => a.localeCompare(b));

    return coins.join().toLowerCase();
  }

  private random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private onCalculateClick() {
    this.setState({isTokenLoading: true});
    this.analyticsManager.trackEvent('button', 'click', 'setup-to-calculate');

    this.preparePortfolios()
      .then(() => {
        console.log('portfolios success created');
        this.props.history.push('calculator/result');
      });
  }

  private async preparePortfolios(): Promise<void> {
    let portfolio: PortfolioManager;
    const coinsResult: Map<string, string[]> = new Map();
    let coins: string[];

    this.portfolioExecutor.removeAllPortfolios();
    while (true) {
      coins =
        SimpleSetupTokenPage.PORTFOLIOS_COINS[Math.trunc(this.random(0, SimpleSetupTokenPage.PORTFOLIOS_COINS.length))];

      if (!coinsResult.has(this.getIdByCoins(coins))) {
        coinsResult.set(this.getIdByCoins(coins), coins);

        if (coinsResult.size === 3) {
          break;
        }
      }
    }

    const coinsList: string[][] = Array.from(coinsResult.values());

    for (const items of coinsList) {
      portfolio = PortfolioFactory.createFakePortfolio();
      await portfolio.setupTokens(items);
      portfolio.setTokenType(TokenType.AUTO_REBALANCE);
      portfolio.setCommission(0.5);
      portfolio.setExchangeAmount(0);
      portfolio.changeProportions(items.map(value => new TokenProportion(value, 1, 1, 1)));

      portfolio.setAmount(this.state.amountBtc * portfolio.getBtcPrice()[0].value);
      await portfolio.calculateInitialAmounts();

      this.portfolioExecutor.addPortfolioManager(portfolio, new FakeRebalanceResultImpl(portfolio));
    }
  }

}
