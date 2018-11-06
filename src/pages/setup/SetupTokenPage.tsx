import { Button, Layout, Modal } from 'antd';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import BlockContent from '../../components/block-content/BlockContent';
import { TokensNamesList } from '../../components/lists/name/TokensNamesList';
import PageFooter from '../../components/page-footer/PageFooter';
import PageHeader from '../../components/page-header/PageHeader';
import { CoinItemEntity } from '../../entities/CoinItemEntity';
import { lazyInject, Services } from '../../Injections';
import { AnalyticsManager } from '../../manager/analytics/AnalyticsManager';
import { PortfolioManager } from '../../manager/multitoken/PortfolioManager';
import { RebalanceHistory } from '../../repository/models/RebalanceHistory';
import './SetupTokenPage.less';

interface Props extends RouteComponentProps<{}> {
}

interface State {
  availableTokenNames: CoinItemEntity[];
  selectedTokenNames: string[];
  showMessageDialog: boolean;
  isTokenLoading: boolean;
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
      isTokenLoading: false,
      selectedTokenNames: this.portfolioManager.getTokens(),
      showMessageDialog: false,
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
        style={{
          minHeight: '100vh',
          minWidth: 320,
          pointerEvents: this.state.isTokenLoading ? 'none' : 'auto'
        }}
      >
        <PageHeader/>

        <div className="SetupTokenPage">

          <div className="SetupTokenPage__header">
            Select coins for create `{RebalanceHistory.MULTITOKEN_NAME_REBALANCE}` (at least two)
          </div>

          <BlockContent className="SetupTokenPage__coins">
            <TokensNamesList
              data={this.state.availableTokenNames}
              checked={this.state.selectedTokenNames}
              onCheck={result => this.onCheckToken(result)}
              onChange={(name: string, checked: boolean) => this.onChangeTokens(name, checked)}
              disabled={this.state.isTokenLoading}
            />
          </BlockContent>

          <div className="SetupTokenPage__buttons">
            <Button
              className="SetupTokenPage__buttons__next"
              type="primary"
              onClick={() => this.onNextClick()}
              loading={this.state.isTokenLoading}
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
      </Layout>
    );
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

    this.setState({isTokenLoading: true});
    const {history} = this.props;

    this.state.selectedTokenNames.sort();

    this.analyticsManager.trackEvent('button', 'click', 'setup-to-next');

    this.portfolioManager.setupTokens(this.state.selectedTokenNames)
      .then(() => history.push('/calculator'))
      .catch((reason: Error) => {
        this.analyticsManager.trackException(reason);
        console.error(reason);
        alert('something went wrong');
        this.setState({isTokenLoading: false});
      });
  }

  private onHistoryClick() {
    const {history} = this.props;

    this.analyticsManager.trackEvent('button', 'click', 'to-history');

    history.push('history');
  }

}
