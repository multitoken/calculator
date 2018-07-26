import { BackTop, Button, Col, Layout, Row, Switch } from 'antd';
import { SliderValue } from 'antd/es/slider';
import Tooltip from 'antd/lib/tooltip';
import * as React from 'react';
import ReactDOM from 'react-dom';
import { RouteComponentProps } from 'react-router';
import { BalancesCapChart } from '../../components/charts/BalancesCapChart';
import { HistoryChart } from '../../components/charts/HistoryChart';
import { MessageDialog } from '../../components/dialogs/MessageDialog';
import { ProgressDialog } from '../../components/dialogs/ProgressDialog';
import { TokenWeightSimpleList } from '../../components/lists/weight-simple/TokenWeightSimpleList';
import PageContent from '../../components/page-content/PageContent';
import PageHeader from '../../components/page-header/PageHeader';
import { lazyInject, Services } from '../../Injections';
import { PortfolioManager } from '../../manager/multitoken/PortfolioManager';
import { TokenType } from '../../manager/multitoken/PortfolioManagerImpl';
import { ProgressListener } from '../../manager/multitoken/ProgressListener';
import { RebalanceHistory } from '../../repository/models/RebalanceHistory';
import { RebalanceValues } from '../../repository/models/RebalanceValues';
import { TokenPriceHistory } from '../../repository/models/TokenPriceHistory';
import IcoInfo from '../../res/icons/ico_info.svg';
import { RebalanceHistoryHelper } from '../../utils/RebalanceHistoryHelper';
import { TokensHelper } from '../../utils/TokensHelper';

import './ResultPage.less';

interface Props extends RouteComponentProps<{}> {
}

interface State {
  historyChartRangeDateIndex: SliderValue;
  progressPercents: number;
  rebalanceValuesList: RebalanceValues[];
  showCalculationProgress: boolean;
  showCharts: boolean;
  showMessageDialog: boolean;
  tokensHistory: Map<string, TokenPriceHistory[]>;
}

export default class ResultPage extends React.Component<Props, State> implements ProgressListener {

  private refsElements: { chart?: HTMLDivElement | null; } = {};

  @lazyInject(Services.PORTFOLIO_MANAGER)
  private portfolioManager: PortfolioManager;
  private chartsAlreadyPrepared: boolean = false;
  private calculation: RebalanceHistoryHelper;

  constructor(props: Props) {
    super(props);

    this.portfolioManager.subscribeToProgress(this);
    this.calculation = new RebalanceHistoryHelper(this.portfolioManager);

    this.state = {
      historyChartRangeDateIndex: [0, 1],
      progressPercents: 0,
      rebalanceValuesList: [],
      showCalculationProgress: true,
      showCharts: false,
      showMessageDialog: false,
      tokensHistory: new Map(),
    };
  }

  public onProgress(percents: number): void {
    if (!this.state.showCalculationProgress) {
      this.setState({showCalculationProgress: true});
    }

    this.setState({progressPercents: percents});
  }

  public componentDidMount(): void {
    if (this.portfolioManager.getPriceHistory().size === 0) {
      // Redirect to root
      window.location.replace('/simulator');
    }

    this.portfolioManager
      .getAvailableTokens()
      .then(this.onSyncTokens.bind(this))
      .catch(reason => {
        console.log(reason);
      });
  }

  public render() {
    return (
      <Layout
        style={{
          minHeight: '100vh',
        }}
      >
        <PageHeader/>
        <PageContent className="ResultPage__content">

          <Tooltip title={this.getTooltipInfo()} placement={'rightTop'}>
            <img src={IcoInfo} alt={'i'} className="ResultPage__content-info"/>
          </Tooltip>

          <div
            className="ResultPage__content-text-caption"
            style={{
              display: this.portfolioManager.getTokenType() === TokenType.FIX_PROPORTIONS
                ? 'none'
                : 'block',
            }}
          >
            The results of the portfolio with rebalancing
          </div>
          <div
            className="ResultPage__content-block-profit"
            style={{
              display: this.portfolioManager.getTokenType() === TokenType.FIX_PROPORTIONS
                ? 'none'
                : 'block',
            }}
          >
            <Row>
              <Col span={8} className="ResultPage__content-text-title">
                Portfolio capitalization:
              </Col>
              <Col span={8} className="ResultPage__content-text-title">
                Profit for the period:
              </Col>
              <Col span={8} className="ResultPage__content-text-title">
                ROI {this.calculation.calcCountDays()} days / ROI annual:
              </Col>
            </Row>
            <Row>
              <Col
                span={8}
                className={
                  'ResultPage__content-text-result_big' + this.getModif(this.calculation.profitWithRebalance())
                }
              >
                ${this.calculation.capWithRebalance()}
              </Col>
              <Col
                span={8}
                className={
                  'ResultPage__content-text-result_big' + this.getModif(this.calculation.profitWithRebalance())
                }
              >
                ${this.calculation.profitWithRebalance()}
              </Col>
              <Col
                span={8}
                className={
                  'ResultPage__content-text-result_big' + this.getModif(this.calculation.profitPercentWithRebalance())
                }>
                {this.calculation.profitPercentWithRebalance()}% / {this.calculation.profitPercentYearWithRebalance()}%
              </Col>
            </Row>
          </div>

          {/*----------3------------*/}

          <div className="ResultPage__content-text-caption">The results of the portfolio without rebalancing</div>
          <div className="ResultPage__content-block">
            <Row>
              <Col span={8} className="ResultPage__content-text-title">
                Portfolio capitalization:
              </Col>
              <Col span={8} className="ResultPage__content-text-title">
                Profit for the period:
              </Col>
              <Col span={8} className="ResultPage__content-text-title">
                ROI {this.calculation.calcCountDays()} days / ROI annual:
              </Col>
            </Row>
            <Row>
              <Col
                span={8}
                className={'ResultPage__content-text-result' + this.getModif(this.calculation.profitWithoutRebalance())}
              >
                ${this.calculation.capWithoutRebalance()}
              </Col>
              <Col
                span={8}
                className={'ResultPage__content-text-result' + this.getModif(this.calculation.profitWithoutRebalance())}
              >
                ${this.calculation.profitWithoutRebalance()}
              </Col>
              <Col
                span={8}
                className={
                  'ResultPage__content-text-result' + this.getModif(this.calculation.profitPercentWithoutRebalance())
                }
              >
                {this.calculation.profitPercentWithoutRebalance()}%
                / {this.calculation.profitPercentYearWithoutRebalance()}%
              </Col>
            </Row>
          </div>

          {/*----------4------------*/}

          <div className="ResultPage__content-text-caption">
            Portfolio Bitcoin only
            <br/>(It shows investor will get by investing in bitcoin the same amount of cash)
          </div>
          <div className="ResultPage__content-block">
            <Row>
              <Col span={8} className="ResultPage__content-text-title">
                Portfolio capitalization:
              </Col>
              <Col span={8} className="ResultPage__content-text-title">
                Profit for the period:
              </Col>
              <Col span={8} className="ResultPage__content-text-title">
                ROI {this.calculation.calcCountDays()} days / ROI annual:
              </Col>
            </Row>
            <Row>
              <Col span={8} className="ResultPage__content-text-result">
                ${this.calculation.capBtc()}
              </Col>
              <Col
                span={8}
                className={'ResultPage__content-text-result' + this.getModif(this.calculation.profitBtc())}
              >
                ${this.calculation.profitBtc()}
              </Col>
              <Col
                span={8}
                className={'ResultPage__content-text-result' + this.getModif(this.calculation.profitPercentBtc())}
              >
                {this.calculation.profitPercentBtc()}% / {this.calculation.profitPercentYearBtc()}%
              </Col>
            </Row>
          </div>

          {/*------------5-----------*/}
          <div
            className="ResultPage__content-text-caption"
            style={{
              display: this.portfolioManager.getTokenType() !== TokenType.AUTO_REBALANCE ? 'none' : 'block',
            }}
          >
            Arbitrage transactions
          </div>
          <div
            className="ResultPage__content-block"
            style={{
              display: this.portfolioManager.getTokenType() !== TokenType.AUTO_REBALANCE ? 'none' : 'block',
            }}
          >
            <Row>
              <Col span={8} className="ResultPage__content-text-title">
                Transactions count:
              </Col>
              <Col span={8} className="ResultPage__content-text-title">
                Total Ethereum fee:
              </Col>
              <Col span={8} className="ResultPage__content-text-title">
                Average Ethereum fee:
              </Col>
            </Row>
            <Row>
              <Col span={8} className="ResultPage__content-text-result">
                {this.calculation.getArbitrageListLen()}
              </Col>
              <Col span={8} className="ResultPage__content-text-result">
                ${this.calculation.totalEthFee()}
              </Col>
              <Col span={8} className="ResultPage__content-text-result">
                ${this.calculation.avgEthFee()}
              </Col>
            </Row>
          </div>

          {/*-----------------------*/}

          <div
            className="ResultPage__content-block"
            style={{
              display: this.portfolioManager.getTokenType() !== TokenType.AUTO_REBALANCE ? 'none' : 'block',
              marginLeft: '32.45%',
            }}
          >
            <Row
              style={{
                display: this.portfolioManager.getTokenType() !== TokenType.AUTO_REBALANCE ? 'none' : 'block',
              }}
            >
              <Col span={12}>
                <div className="ResultPage__content-text-title">
                  Total arbitrage profit:
                </div>
                <div className="ResultPage__content-text-result">
                  ${this.calculation.totalArbiterProfit()}
                </div>
              </Col>

              <Col span={12}>
                <div className="ResultPage__content-text-title">
                  The average arbitrage profit:
                </div>
                <div className="ResultPage__content-text-result">
                  ${this.calculation.avgArbiterProfit()}
                </div>
              </Col>
            </Row>
          </div>
          {/*-----------------------*/}

          <div style={{textAlign: 'center', margin: '20px'}}>
            <Button
              type="primary"
              onClick={() => {
                const {history} = this.props;
                history.goBack();
              }}
            >
              Edit options
            </Button>
            <span className="m-2"/>
            <Button
              type="primary"
              onClick={() => {
                window.location.replace('/simulator');
              }}
            >
              Start new
            </Button>

            <div className="ResultPage__content-switch-block">
              <span className="ResultPage__content-switch-block-text">Show Charts</span>
              <Switch
                onChange={checked => {
                  this.setState({showMessageDialog: checked});
                  setTimeout(
                    () => {
                      this.setState({showCharts: checked});
                      this.setState({showMessageDialog: false});
                    },
                    1000
                  );
                }}
              />
            </div>
          </div>
        </PageContent>

        {this.prepareChartsComponents()}
        <ProgressDialog
          openDialog={this.state.showCalculationProgress}
          percentProgress={this.state.progressPercents}
        />

        <MessageDialog openDialog={this.state.showMessageDialog}/>

        <div>
          <BackTop>
            <div className="ant-back-top-inner">UP</div>
          </BackTop>
        </div>
      </Layout>
    );
  }

  private prepareChartsComponents(): any {
    if (!this.state.showCharts && !this.chartsAlreadyPrepared) {
      return null;
    }
    this.chartsAlreadyPrepared = true;

    return (
      <div style={{overflow: 'hidden', height: this.chartsAlreadyPrepared && !this.state.showCharts ? '0' : '100%'}}>
        <PageContent className="ResultPage__content">
          <div ref={(div) => this.refsElements.chart = div} className="ResultPage__result-chart">
            <span className="ResultPage__result-chart-title">Currency price history $:</span>
            <HistoryChart
              data={this.state.tokensHistory}
              colors={TokensHelper.COLORS}
              timeStep={this.portfolioManager.getStepSec()}
              isDebugMode={false}
              start={this.state.historyChartRangeDateIndex[0]}
              end={this.state.historyChartRangeDateIndex[1]}
              showRange={false}
              showLegendCheckBox={true}
            />
          </div>
        </PageContent>

        <PageContent className="ResultPage__content">
          <div className="ResultPage__result-chart">
            <span className="ResultPage__result-chart-title">
              Portfolio capitalization:
            </span>
            <BalancesCapChart
              showRebalanceCap={this.portfolioManager.getTokenType() !== TokenType.FIX_PROPORTIONS}
              isDebugMode={false}
              applyScale={true}
              data={this.state.rebalanceValuesList}
              colors={TokensHelper.COLORS}
              showRange={false}
              showLegendCheckBox={true}
            />
          </div>
        </PageContent>
        {this.scrollToCharts()}
      </div>
    );
  }

  private getTooltipInfo(): React.ReactNode {
    return (
      <div className="ResultPage__tooltip">
        <div className="ResultPage__tooltip_title">{this.getTitleOfType()}</div>
        <div className="ResultPage__tooltip_param">
          <span className="ResultPage__tooltip_param_name">
            Amount of money:
          </span>
          <span className="ResultPage__tooltip_param_value">
            $ {this.portfolioManager.getAmount().toLocaleString()}
          </span>
        </div>
        {this.getCommissionPercent()}
        {this.getTokensProportions()}
        {this.getManualRebalanceList()}
      </div>
    );
  }

  private getTitleOfType(): string {
    if (this.portfolioManager.getTokenType() === TokenType.AUTO_REBALANCE) {
      return 'Fix proportions:';

    } else if (this.portfolioManager.getTokenType() !== TokenType.MANUAL_REBALANCE) {
      return 'Manual rebalance:';

    } else {
      return 'Auto rebalance:';
    }
  }

  private getCommissionPercent(): React.ReactNode {
    return '';

    if (this.portfolioManager.getTokenType() === TokenType.AUTO_REBALANCE) {
      return (
        <div>
          <div className="ResultPage__tooltip_param">
          <span className="ResultPage__tooltip_param_name">
            Commission percent:
          </span>
            <span className="ResultPage__tooltip_param_value">
            $ {this.portfolioManager.getCommission().toLocaleString()}
          </span>
          </div>
        </div>
      );
    }

    return '';
  }

  private getTokensProportions(): React.ReactNode {
    return this.portfolioManager.getProportions().map(value => {
      return (
        <div key={value.name}>
          <div className="ResultPage__tooltip_param">
          <span className="ResultPage__tooltip_param_name">
            {value.name} weight:
          </span>
            <span className="ResultPage__tooltip_param_value">
            {value.weight}
          </span>
          </div>
        </div>
      );
    });
  }

  private getManualRebalanceList(): React.ReactNode {
    if (this.portfolioManager.getTokenType() === TokenType.MANUAL_REBALANCE) {
      return <TokenWeightSimpleList
        data={this.portfolioManager.getRebalanceWeights()}
      />;
    }
    return '';
  }

  private scrollToCharts() {
    if (!this.state.showCharts) {
      return;
    }

    setTimeout(
      () => {
        if (this.refsElements.chart) {
          const chart = ReactDOM.findDOMNode(this.refsElements.chart);
          if (chart !== null) {
            (chart as HTMLDivElement).scrollIntoView({block: 'center', behavior: 'smooth'});
          }
        } else {
          this.scrollToCharts();
        }
      }
      ,
      500);
  }

  private getModif(value: string): string {
    const numb: number = parseFloat(value.replace(' ', ''));
    if (numb > 0) {
      return '_success';

    } else if (numb === 0) {
      return '';
    }

    return '_warn';
  }

  private onSyncTokens(tokens: Map<string, string>) {
    this.setState({
      historyChartRangeDateIndex: this.portfolioManager.getCalculationDate(),
      tokensHistory: this.portfolioManager.getPriceHistory(),
    });

    this.processCalculate();
  }

  private processCalculate() {
    this.portfolioManager.calculateInitialAmounts()
      .then(() => this.portfolioManager.calculate())
      .then((result: RebalanceHistory) => {
        this.calculation.calculateRebalanceHistory(result);

        this.setState({
          rebalanceValuesList: result.rebalanceValues
        });

        console.log(result);

        this.setState({
          showCalculationProgress: false,
        });
      });
  }

}
