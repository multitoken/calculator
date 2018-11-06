import { Button, Layout, Modal } from 'antd';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import BlockContent from '../../components/block-content/BlockContent';
import { LoadingDialog } from '../../components/dialogs/LoadingDialog';
import { TokensNamesList } from '../../components/lists/name/TokensNamesList';
import { PreparedPortfoliosList } from '../../components/lists/prepared-portofios/PreparedPortfoliosList';
import PageFooter from '../../components/page-footer/PageFooter';
import PageHeader from '../../components/page-header/PageHeader';
import { CoinItemEntity } from '../../entities/CoinItemEntity';
import { PreparedPortfolio } from '../../entities/PreparedPortfolio';
import { lazyInject, Services } from '../../Injections';
import { AnalyticsManager } from '../../manager/analytics/AnalyticsManager';
import { PortfolioManager } from '../../manager/multitoken/PortfolioManager';
import { RebalanceHistory } from '../../repository/models/RebalanceHistory';
import { PreparedPortfoliosItems } from '../../utils/PreparedPortfoliosItems';
import './SetupTokenPage.less';

interface Props extends RouteComponentProps<{}> {
}

interface State {
  availableTokenNames: CoinItemEntity[];
  preparedHistoryData: boolean;
  preparedPortfolios: PreparedPortfolio[];
  selectedTokenNames: string[];
}

export default class SetupTokenPage extends React.Component<Props, State> {

  @lazyInject(Services.PORTFOLIO_MANAGER)
  private portfolioManager: PortfolioManager;
  @lazyInject(Services.ANALYTICS_MANAGER)
  private analyticsManager: AnalyticsManager;

  constructor(props: Props) {
    super(props);

    this.analyticsManager.trackPage('/select-tokens-page');

    this.state = {
      availableTokenNames: [],
      preparedHistoryData: false,
      preparedPortfolios: this.getPreparedPortfolios(),
      selectedTokenNames: this.portfolioManager.getTokens(),
    };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.analyticsManager.trackException(error);
  }

  public componentDidMount(): void {
    this.portfolioManager
      .getAvailableTokens()
      .then(result => this.onSyncTokens(result))
      .catch((reason: Error) => {
        this.analyticsManager.trackException(reason);
        alert(reason.message);
      });
  }

  public render() {
    return (
      <Layout
        style={{minHeight: '100vh'}}
      >
        <PageHeader/>

        <div className="SetupTokenPage">

          <div className="SetupTokenPage__header">
            Select an already prepared portfolio of coins for `{RebalanceHistory.MULTITOKEN_NAME_REBALANCE}`
          </div>

          <div className="SetupTokenPage__prepared-portfolios">
            <PreparedPortfoliosList
              items={this.state.preparedPortfolios}
              onPortfolioClick={(item) => this.onPreparedPortfolioClick(item)}
            />
          </div>

          <div className="SetupTokenPage__sub-header">
            Or
          </div>

          <div className="SetupTokenPage__header">
            Select coins for create `{RebalanceHistory.MULTITOKEN_NAME_REBALANCE}` (at least two)
          </div>

          <BlockContent className="SetupTokenPage__coins">
            <TokensNamesList
              data={this.state.availableTokenNames}
              checked={this.state.selectedTokenNames}
              onCheck={result => this.onCheckToken(result)}
              onChange={(name: string, checked: boolean) => this.onChangeTokens(name, checked)}
              disabled={false}
            />
          </BlockContent>

          <div className="SetupTokenPage__buttons">
            <Button
              className="SetupTokenPage__buttons__next"
              type="primary"
              onClick={() => this.onNextClick()}
            >
              Next
            </Button>
            <span
              className="button-simple"
              onClick={() => this.onHistoryClick()}
            >
              History
            </span>
          </div>
        </div>
        <PageFooter/>
        <LoadingDialog
          openDialog={this.state.preparedHistoryData}
          message={'Please wait. We prepare historical data of coins'}
        />
      </Layout>
    );
  }

  private getPreparedPortfolios(): PreparedPortfolio[] {
    const items: PreparedPortfolio[] = [];
    const len: number = PreparedPortfoliosItems.DATA.length - 1;

    while (items.length < 3) {
      const pos: number = Math.floor(this.random(0, len));
      const item: PreparedPortfolio = PreparedPortfoliosItems.DATA[pos];
      if (items.indexOf(item) <= -1) {
        items.push(item);
      }
    }

    return items;
  }

  private random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private onPreparedPortfolioClick(item: PreparedPortfolio): void {
    this.setState({preparedHistoryData: true});
    this.analyticsManager.trackEvent('button', 'click', 'setup-to-next');
    const {history} = this.props;

    this.portfolioManager.setupTokens(item.coins)
      .then(() => {
        this.portfolioManager.setRebalanceDiffPercent(item.diffPercent);
        history.push('/calculator');
      })
      .catch((reason: Error) => {
        this.analyticsManager.trackException(reason);
        console.error(reason);
        alert('something went wrong');
        this.setState({preparedHistoryData: false});
      });
  }

  private onSyncTokens(tokens: Map<string, string>) {
    const entities: CoinItemEntity[] = Array.from(tokens.keys())
      .map(value => new CoinItemEntity(value, 1, '', 0, 0, 0, 0));

    this.setState({availableTokenNames: entities});
  }

  private onCheckToken(checkedValue: string[]) {
    this.setState({
      selectedTokenNames: checkedValue,
    });
  }

  private onChangeTokens(name: string, checked: boolean) {
    this.analyticsManager.trackEvent('checkbox', checked ? 'check' : 'uncheck', name);
  }

  private messageInfo(): void {
    Modal.info({
      content: <p style={{fontSize: '16px', color: 'white'}}><b>Please select at least two coins</b></p>,
      title: <p style={{fontSize: '25px', color: 'white'}}>Backtest</p>,
      onOk() {
        // close
      },
    });
  }

  private onNextClick() {
    if (this.state.selectedTokenNames.length <= 1) {
      this.messageInfo();
      return;
    }

    this.setState({preparedHistoryData: true});
    const {history} = this.props;

    this.state.selectedTokenNames.sort();

    this.analyticsManager.trackEvent('button', 'click', 'setup-to-next');

    this.portfolioManager.setupTokens(this.state.selectedTokenNames)
      .then(() => history.push('/calculator'))
      .catch((reason: Error) => {
        this.analyticsManager.trackException(reason);
        console.error(reason);
        alert('something went wrong');
        this.setState({preparedHistoryData: false});
      });
  }

  private onHistoryClick() {
    const {history} = this.props;

    this.analyticsManager.trackEvent('button', 'click', 'to-history');

    history.push('history');
  }

}
