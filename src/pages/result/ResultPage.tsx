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
import { ProgressListener } from '../../manager/multitoken/ProgressListener';
import { TokenManager } from '../../manager/multitoken/TokenManager';
import { TokenType } from '../../manager/multitoken/TokenManagerImpl';
import { Arbitration } from '../../repository/models/Arbitration';
import { RebalanceHistory } from '../../repository/models/RebalanceHistory';
import { RebalanceValues } from '../../repository/models/RebalanceValues';
import { TokenPriceHistory } from '../../repository/models/TokenPriceHistory';
import { TokenProportion } from '../../repository/models/TokenProportion';
import { TokenWeight } from '../../repository/models/TokenWeight';
import IcoInfo from '../../res/icons/ico_info.svg';
import { TokensHelper } from '../../utils/TokensHelper';

import './ResultPage.less';

interface Props extends RouteComponentProps<{}> {
}

interface State {
  tokenNames: Map<string, boolean>;
  tokensHistory: Map<string, TokenPriceHistory[]>;
  tokensDate: number[];
  rebalanceValuesList: RebalanceValues[];
  arbitrationList: Arbitration[];
  arbiterCap: number;
  arbiterProfit: number;
  arbiterTotalTxFee: number;
  amount: number;
  btcUSDT: number;
  btcCount: number;
  cap: number;
  progressPercents: number;
  proportionList: TokenProportion[];
  showCharts: boolean;
  showCalculationProgress: boolean;
  showMessageDialog: boolean;
  calculateRangeDateIndex: SliderValue;
  calculateMaxDateIndex: number;
  historyChartRangeDateIndex: SliderValue;
  tokensWeightList: TokenWeight[];
  tokensWeightEditItem: TokenWeight | undefined;
  tokenDialogDateList: string[];
  tokenDialogOpen: boolean;
  tokenLatestWeights: Map<string, number>;
  changeWeightMinDateIndex: number;
  commissionPercents: number;
}

export default class ResultPage extends React.Component<Props, State> implements ProgressListener {

  private refsElements: { chart?: HTMLDivElement | null; } = {};

  @lazyInject(Services.TOKEN_MANAGER)
  private tokenManager: TokenManager;
  private chartsAlreadyPrepared: boolean = false;

  constructor(props: Props) {
    super(props);

    this.tokenManager.subscribeToProgress(this);

    this.state = {
      amount: this.tokenManager.getAmount(),
      arbiterCap: this.tokenManager.getAmount(),
      arbiterProfit: 0,
      arbiterTotalTxFee: 0,
      arbitrationList: [],
      btcCount: 0,
      btcUSDT: this.tokenManager.getAmount(),
      calculateMaxDateIndex: 1,
      calculateRangeDateIndex: [0, 1],
      cap: this.tokenManager.getAmount(),
      changeWeightMinDateIndex: 1,
      commissionPercents: 0.2,
      historyChartRangeDateIndex: [0, 1],
      progressPercents: 0,
      proportionList: [],
      rebalanceValuesList: [],
      showCalculationProgress: true,
      showCharts: false,
      showMessageDialog: false,
      tokenDialogDateList: [],
      tokenDialogOpen: false,
      tokenLatestWeights: new Map(),
      tokenNames: new Map(),
      tokensDate: [],
      tokensHistory: new Map(),
      tokensWeightEditItem: undefined,
      tokensWeightList: [],
    };
  }

  public onProgress(percents: number): void {
    if (!this.state.showCalculationProgress) {
      this.setState({showCalculationProgress: true});
    }

    this.setState({progressPercents: percents});
  }

  public componentDidMount(): void {
    if (this.tokenManager.getPriceHistory().size === 0) {
      // Redirect to root
      window.location.replace('/simulator');
    }

    this.tokenManager
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
              display: this.tokenManager.getTokenType() === TokenType.FIX_PROPORTIONS
                ? 'none'
                : 'block',
            }}
          >
            The results of the portfolio with rebalancing
          </div>
          <div
            className="ResultPage__content-block-profit"
            style={{
              display: this.tokenManager.getTokenType() === TokenType.FIX_PROPORTIONS
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
                ROI {this.calcCountDays()} days / ROI annual:
              </Col>
            </Row>
            <Row>
              <Col
                span={8}
                className={'ResultPage__content-text-result_big' + this.getModif(this.profitWithRebalance())}
              >
                ${this.capWithRebalance()}
              </Col>
              <Col
                span={8}
                className={'ResultPage__content-text-result_big' + this.getModif(this.profitWithRebalance())}
              >
                ${this.profitWithRebalance()}
              </Col>
              <Col
                span={8}
                className={'ResultPage__content-text-result_big' + this.getModif(this.profitPercentWithRebalance())}>
                {this.profitPercentWithRebalance()}% / {this.profitPercentYearWithRebalance()}%
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
                ROI {this.calcCountDays()} days / ROI annual:
              </Col>
            </Row>
            <Row>
              <Col
                span={8}
                className={'ResultPage__content-text-result' + this.getModif(this.profitWithoutRebalance())}
              >
                ${this.capWithoutRebalance()}
              </Col>
              <Col
                span={8}
                className={'ResultPage__content-text-result' + this.getModif(this.profitWithoutRebalance())}
              >
                ${this.profitWithoutRebalance()}
              </Col>
              <Col
                span={8}
                className={'ResultPage__content-text-result' + this.getModif(this.profitPercentWithoutRebalance())}
              >
                {this.profitPercentWithoutRebalance()}% / {this.profitPercentYearWithoutRebalance()}%
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
                ROI {this.calcCountDays()} days / ROI annual:
              </Col>
            </Row>
            <Row>
              <Col span={8} className="ResultPage__content-text-result">
                ${this.capBtc()}
              </Col>
              <Col
                span={8}
                className={'ResultPage__content-text-result' + this.getModif(this.profitBtc())}
              >
                ${this.profitBtc()}
              </Col>
              <Col
                span={8}
                className={'ResultPage__content-text-result' + this.getModif(this.profitPercentBtc())}
              >
                {this.profitPercentBtc()}% / {this.profitPercentYearBtc()}%
              </Col>
            </Row>
          </div>

          {/*------------5-----------*/}
          <div
            className="ResultPage__content-text-caption"
            style={{
              display: this.tokenManager.getTokenType() !== TokenType.AUTO_REBALANCE ? 'none' : 'block',
            }}
          >
            Arbitrage transactions
          </div>
          <div
            className="ResultPage__content-block"
            style={{
              display: this.tokenManager.getTokenType() !== TokenType.AUTO_REBALANCE ? 'none' : 'block',
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
                {this.getArbitrageListLen()}
              </Col>
              <Col span={8} className="ResultPage__content-text-result">
                ${this.totalEthFee()}
              </Col>
              <Col span={8} className="ResultPage__content-text-result">
                ${this.avgEthFee()}
              </Col>
            </Row>
          </div>

          {/*-----------------------*/}

          <div
            className="ResultPage__content-block"
            style={{
              display: this.tokenManager.getTokenType() !== TokenType.AUTO_REBALANCE ? 'none' : 'block',
              marginLeft: '32.45%',
            }}
          >
            <Row
              style={{
                display: this.tokenManager.getTokenType() !== TokenType.AUTO_REBALANCE ? 'none' : 'block',
              }}
            >
              <Col span={12}>
                <div className="ResultPage__content-text-title">
                  Total arbitrage profit:
                </div>
                <div className="ResultPage__content-text-result">
                  ${this.totalArbiterProfit()}
                </div>
              </Col>

              <Col span={12}>
                <div className="ResultPage__content-text-title">
                  The average arbitrage profit:
                </div>
                <div className="ResultPage__content-text-result">
                  ${this.avgArbiterProfit()}
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
              timeStep={this.tokenManager.getStepSec()}
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
              showRebalanceCap={this.tokenManager.getTokenType() !== TokenType.FIX_PROPORTIONS}
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
            $ {this.tokenManager.getAmount().toLocaleString()}
          </span>
        </div>
        {this.getCommissionPercent()}
        {this.getTokensProportions()}
        {this.getManualRebalanceList()}
      </div>
    );
  }

  private getTitleOfType(): string {
    if (this.tokenManager.getTokenType() === TokenType.AUTO_REBALANCE) {
      return 'Fix proportions:';

    } else if (this.tokenManager.getTokenType() !== TokenType.MANUAL_REBALANCE) {
      return 'Manual rebalance:';

    } else {
      return 'Auto rebalance:';
    }
  }

  private getCommissionPercent(): React.ReactNode {
    return '';

    if (this.tokenManager.getTokenType() === TokenType.AUTO_REBALANCE) {
      return (
        <div>
          <div className="ResultPage__tooltip_param">
          <span className="ResultPage__tooltip_param_name">
            Commission percent:
          </span>
            <span className="ResultPage__tooltip_param_value">
            $ {this.tokenManager.getCommission().toLocaleString()}
          </span>
          </div>
        </div>
      );
    }

    return '';
  }

  private getTokensProportions(): React.ReactNode {
    return this.tokenManager.getProportions().map(value => {
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
    if (this.tokenManager.getTokenType() === TokenType.MANUAL_REBALANCE) {
      return <TokenWeightSimpleList
        data={this.tokenManager.getRebalanceWeights()}
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

  private capWithRebalance(): string {
    return this.formatCurrency(this.state.arbiterCap.toFixed(0));
  }

  private profitWithRebalance(): string {
    return this.formatCurrency((this.state.arbiterCap - this.state.amount).toFixed(0));
  }

  private profitPercentWithRebalance(): string {
    return ((this.state.arbiterCap - this.state.amount) / this.state.amount * 100).toFixed(0);
  }

  private profitPercentYearWithRebalance(): string {
    const percents: number = (this.state.arbiterCap - this.state.amount) / this.state.amount * 100;
    return ((percents / this.calcCountDays() * 365) || 0).toFixed(0);
  }

  private capWithoutRebalance(): string {
    return this.formatCurrency(this.state.cap.toFixed(0));
  }

  private profitWithoutRebalance(): string {
    return this.formatCurrency((this.state.cap - this.state.amount).toFixed(0));
  }

  private profitPercentWithoutRebalance(): string {
    return ((this.state.cap - this.state.amount) / this.state.amount * 100).toFixed(0);
  }

  private profitPercentYearWithoutRebalance(): string {
    const percents: number = (this.state.cap - this.state.amount) / this.state.amount * 100;
    return ((percents / this.calcCountDays() * 365) || 0).toFixed(0);
  }

  private totalEthFee(): string {
    return this.formatCurrency(this.state.arbiterTotalTxFee.toFixed(0));
  }

  private avgEthFee(): string {
    return this.formatCurrency(((this.state.arbiterTotalTxFee / (this.getArbitrageListLen() || 1))).toFixed(3));
  }

  private capBtc(): string {
    return this.formatCurrency(this.state.btcUSDT.toFixed(0));
  }

  private profitBtc(): string {
    return this.formatCurrency((this.state.btcUSDT - this.state.amount).toFixed(0));
  }

  private profitPercentBtc(): string {
    return ((this.state.btcUSDT - this.state.amount) / this.state.amount * 100).toFixed(0);
  }

  private profitPercentYearBtc(): string {
    const percents: number = (this.state.btcUSDT - this.state.amount) / this.state.amount * 100;
    return ((percents / this.calcCountDays() * 365) || 0).toFixed(0);
  }

  private totalArbiterProfit(): string {
    return this.formatCurrency(this.state.arbiterProfit.toFixed(3));
  }

  private avgArbiterProfit(): string {
    return this.formatCurrency((this.state.arbiterProfit / (this.getArbitrageListLen() || 1)).toFixed(3));
  }

  private formatCurrency(value: string): string {
    return parseFloat(value).toLocaleString();
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

  private calcCountDays(): number {
    const min: number = this.state.calculateRangeDateIndex[0];
    const max: number = this.state.calculateRangeDateIndex[1];

    return Math.floor(((max - min) / (60 / this.tokenManager.getStepSec())) / 60 / 24);
  }

  private getArbitrageListLen(): number {
    return Math.max(0, this.state.arbitrationList.length);
  }

  private onSyncTokens(tokens: Map<string, string>) {
    const tokenItems: Map<string, boolean> = new Map();
    const proportions: TokenProportion[] = [];

    tokens.forEach((value, key) => tokenItems.set(key, false));

    this.tokenManager.getPriceHistory().forEach((value, key) => {
      proportions.push(new TokenProportion(key, 10, 1, 10));
    });
    const firstTokenName: string = Array.from(this.tokenManager.getPriceHistory().keys())[0];
    const history: TokenPriceHistory[] = this.tokenManager.getPriceHistory().get(firstTokenName) || [];

    this.setState({tokensDate: history.map(value => value.time)});

    this.setState({
      calculateMaxDateIndex: this.tokenManager.getMaxCalculationIndex(),
      calculateRangeDateIndex: this.tokenManager.getCalculationDate(),
      historyChartRangeDateIndex: this.tokenManager.getCalculationDate()
    });

    this.setState({
      proportionList: proportions,
      tokenNames: tokenItems,
      tokensHistory: this.tokenManager.getPriceHistory(),
    });

    this.processCalculate();
  }

  private processCalculate() {
    const btcusdt: TokenPriceHistory[] = this.tokenManager.getBtcPrice();
    const count: number = this.state.amount / btcusdt[this.state.historyChartRangeDateIndex[0]].value;
    const btcUsdt: number = count * btcusdt[this.state.historyChartRangeDateIndex[1]].value;

    this.setState({btcCount: count, btcUSDT: btcUsdt});

    this.tokenManager.calculateInitialAmounts()
      .then(() => this.tokenManager.calculateArbitration())
      .then((result: RebalanceHistory) => {
        this.setState({
          arbitrationList: result.arbitrage,
          rebalanceValuesList: this.tokenManager.getTokenType() === TokenType.AUTO_REBALANCE
            ? result.capByArbitrage
            : result.rebalanceValues
        });

        console.log(result);

        let profit: number = 0;
        let totalTxPrice: number = 0;

        result.arbitrage.forEach(value => {
          profit += value.arbiterProfit;
          totalTxPrice += value.txPrice;
        });

        this.setState({
          arbiterProfit: profit,
          arbiterTotalTxFee: totalTxPrice,
        });

        this.setState({
          arbiterCap: result.getRebalancedCap(),
          cap: result.getCap(),
          showCalculationProgress: false,
        });
      });
  }

}
