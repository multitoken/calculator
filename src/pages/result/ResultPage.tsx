import { BackTop, Button, Col, Layout, Row, Switch } from 'antd';
import { SliderValue } from 'antd/es/slider';
import * as React from 'react';
import ReactDOM from 'react-dom';
import { RouteComponentProps } from 'react-router';
import { ArbiterChart } from '../../components/charts/ArbiterChart';
import { HistoryChart } from '../../components/charts/HistoryChart';
import { TokensCapChart } from '../../components/charts/TokensCapChart';
import { ProgressDialog } from '../../components/dialogs/ProgressDialog';
import { LegendStyle } from '../../components/holders/legend/TokenLegendHolder';
import { TokensLegendList } from '../../components/lists/legend/TokensLegendList';
import PageContent from '../../components/page-content/PageContent';
import PageHeader from '../../components/page-header/PageHeader';
import { TokenLegend } from '../../entities/TokenLegend';
import { lazyInject, Services } from '../../Injections';
import { ProgressListener } from '../../manager/ProgressListener';
import { TokenManager } from '../../manager/TokenManager';
import { Arbitration } from '../../repository/models/Arbitration';
import { TokenPriceHistory } from '../../repository/models/TokenPriceHistory';
import { TokenProportion } from '../../repository/models/TokenProportion';
import { TokenWeight } from '../../repository/models/TokenWeight';

import './ResultPage.less';

interface Props extends RouteComponentProps<{}> {
}

interface State {
  tokenNames: Map<string, boolean>;
  tokensHistory: Map<string, TokenPriceHistory[]>;
  tokensLegend: TokenLegend[];
  tokensDate: number[];
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
  private readonly COLORS: string[] = [
    '#FFD484', '#FF7658', '#3294E4', '#50E3C2', '#8B572A', '#D7CB37', '#A749FA', '#3DD33E', '#4455E8',
    '#DF8519', '#F44A8B', '#E53737', '#A227BB', '#2D9D5C', '#D2FF84',
  ];

  private refsElements: { chart?: HTMLDivElement | null; } = {};

  @lazyInject(Services.TOKEN_MANAGER)
  private tokenManager: TokenManager;

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
      showCalculationProgress: true,
      showCharts: false,
      tokenDialogDateList: [],
      tokenDialogOpen: false,
      tokenLatestWeights: new Map(),
      tokenNames: new Map(),
      tokensDate: [],
      tokensHistory: new Map(),
      tokensLegend: [],
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
      .catch(reason => alert(reason.message));
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
          <div className="ResultPage__content-text-caption">The results of the portfolio with auto rebalancing</div>
          <div className="ResultPage__content-block-profit">
            <Row>
              <Col span={8} className="ResultPage__content-text-title">
                Portfolio capitalization:
              </Col>
              <Col span={8} className="ResultPage__content-text-title">
                Profit for the period:
              </Col>
              <Col span={8} className="ResultPage__content-text-title">
                Profit for the {this.calcCountDays()} days / annual:
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

          {/*---------2---------*/}
          <div className="ResultPage__content-text-caption">The difference in the percentage with</div>
          <Row gutter={16}>
            <Col span={12}>
              <div className="ResultPage__content-block">
                <div className="ResultPage__content-text-title">
                  The portfolio without auto rebalancing:
                </div>
                <div className={'ResultPage__content-text-result' + this.profitPercentsWithoutRebalance()}>
                  {this.profitPercentsWithoutRebalance()}%
                </div>
              </div>
            </Col>

            <Col span={12}>
              <div className="ResultPage__content-block">
                <div className="ResultPage__content-text-title">
                  Portfolio from bitcoin only:
                </div>
                <div className={'ResultPage__content-text-result' + this.profitPercentBitcoin()}>
                  {this.profitPercentBitcoin()}%
                </div>
              </div>
            </Col>
          </Row>

          {/*----------3------------*/}

          <div className="ResultPage__content-text-caption">The results of the portfolio without auto rebalancing</div>
          <div className="ResultPage__content-block">
            <Row>
              <Col span={8} className="ResultPage__content-text-title">
                Portfolio capitalization:
              </Col>
              <Col span={8} className="ResultPage__content-text-title">
                Profit for the period:
              </Col>
              <Col span={8} className="ResultPage__content-text-title">
                Profit for the {this.calcCountDays()} days / annual:
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

          <div className="ResultPage__content-text-caption">Portfolio from bitcoin only</div>
          <div className="ResultPage__content-block">
            <Row>
              <Col span={8} className="ResultPage__content-text-title">
                Portfolio capitalization:
              </Col>
              <Col span={8} className="ResultPage__content-text-title">
                Profit for the period:
              </Col>
              <Col span={8} className="ResultPage__content-text-title">
                Profit for the {this.calcCountDays()} days / annual:
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
          <div className="ResultPage__content-text-caption">Arbitrage transactions</div>
          <div className="ResultPage__content-block">
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
                {this.state.arbitrationList.length}
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

          <Row gutter={16}>
            <Col span={12}>
              <div className="ResultPage__content-block">
                <div className="ResultPage__content-text-title">
                  Total arbitrage profit:
                </div>
                <div className="ResultPage__content-text-result">
                  ${this.state.arbiterProfit.toFixed(0)}
                </div>
              </div>
            </Col>

            <Col span={12}>
              <div className="ResultPage__content-block">
                <div className="ResultPage__content-text-title">
                  The average arbitrage profit:
                </div>
                <div className="ResultPage__content-text-result">
                  ${(this.state.arbiterProfit / (this.getArbitrationListLen() || 1)).toFixed(3)}
                </div>
              </div>
            </Col>
          </Row>

          {/*-----------------------*/}

          <div style={{textAlign: 'center', margin: '20px'}}>
            <div className="ResultPage__content-switch-block">
              <Switch
                checkedChildren="Show charts"
                unCheckedChildren="Hide charts"
                onChange={checked => {
                  this.setState({showCharts: checked});
                  if (checked) {
                    this.scrollToCharts();
                  }
                }}
              />
            </div>

            <Button
              type="primary"
              size="large"
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
              size="large"
              onClick={() => {
                window.location.replace('/simulator');
              }}
            >
              Reset tokens
            </Button>
          </div>

        </PageContent>

        {this.prepareChartsComponents()}
        <ProgressDialog
          openDialog={this.state.showCalculationProgress}
          percentProgress={this.state.progressPercents}
        />

        <div>
          <BackTop>
            <div className="ant-back-top-inner">UP</div>
          </BackTop>
        </div>
      </Layout>
    );
  }

  private prepareChartsComponents(): any {
    return (
      <div
        style={{
          display: (this.state.showCharts || this.state.showCalculationProgress) ? 'block' : 'none',
          zIndex: this.state.showCalculationProgress ? -1 : 0,
        }}
      >
        <PageContent className="ResultPage__content">
          <div ref={(div) => this.refsElements.chart = div} className="ResultPage__result-chart">
            <span className="ResultPage__result-chart-title">Currency price history $:</span>
            <HistoryChart
              data={this.state.tokensHistory}
              colors={this.COLORS}
              start={this.state.historyChartRangeDateIndex[0]}
              end={this.state.historyChartRangeDateIndex[1]}
              showRange={false}
            />
            <div className="ResultPage__result-legend">
              <TokensLegendList
                style={LegendStyle.LINE}
                columnCount={4}
                data={this.state.tokensLegend}
              />
            </div>
          </div>
        </PageContent>

        <PageContent className="ResultPage__content">
          <div className="ResultPage__result-chart">
            <span className="ResultPage__result-chart-title">
              Portfolio capitalization:
            </span>
            <ArbiterChart
              data={this.state.arbitrationList}
              colors={this.COLORS}
              showRange={false}
            />
            <div className="ResultPage__result-legend">
              <TokensLegendList
                style={LegendStyle.LINE}
                columnCount={4}
                data={this.state.tokensLegend}
              />
            </div>
          </div>
        </PageContent>

        <PageContent className="ResultPage__content">
          <div className="ResultPage__result-chart">
            <span className="ResultPage__result-chart-title">
              Capitalization of each token in the portfolio with and without arbitrage:
            </span>
            <TokensCapChart
              data={this.state.arbitrationList}
              colors={this.COLORS}
              showRange={false}
            />
            <div className="ResultPage__result-legend">
              <TokensLegendList
                style={LegendStyle.LINE}
                columnCount={4}
                data={this.state.tokensLegend}
              />
            </div>
          </div>
        </PageContent>
      </div>
    );
  }

  private scrollToCharts() {
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
      200);

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
    const diff: number = this.state.arbiterCap / this.state.amount;
    return Math.pow(diff, 365 / this.calcCountDays()).toFixed(0);
  }

  private profitPercentsWithoutRebalance(): string {
    return ((this.state.cap - this.state.amount) / this.state.amount * 100).toFixed(0);
  }

  private profitPercentBitcoin(): string {
    return ((this.state.btcUSDT - this.state.amount) / this.state.amount * 100).toFixed(0);
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
    const diff: number = this.state.cap / this.state.amount;
    return Math.pow(diff, 365 / this.calcCountDays()).toFixed(0);
  }

  private totalEthFee(): string {
    return this.formatCurrency(this.state.arbiterTotalTxFee.toFixed(0));
  }

  private avgEthFee(): string {
    return this.formatCurrency(((this.state.arbiterTotalTxFee / (this.getArbitrationListLen() || 1))).toFixed(3));
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
    const diff: number = this.state.btcUSDT / this.state.amount;
    return Math.pow(diff, 365 / this.calcCountDays()).toFixed(0);
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

    return Math.floor((max - min) / 60 / 24);
  }

  private getArbitrationListLen(): number {
    return Math.max(0, this.state.arbitrationList.length - 1);
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

    const maxIndex: number = this.tokenManager.getMaxCalculationIndex() - 1;
    this.setState({
      calculateMaxDateIndex: maxIndex || 0,
      calculateRangeDateIndex: [0, maxIndex || 0],
      historyChartRangeDateIndex: [0, maxIndex || 0]
    });

    const historyMap: Map<string, TokenPriceHistory[]> = new Map();
    this.tokenManager.getPriceHistory().forEach((value, key) => historyMap.set(key, value));

    historyMap.set('Bitcoin', this.tokenManager.getBtcPrice()
      .slice(this.state.historyChartRangeDateIndex[0], this.state.historyChartRangeDateIndex[1]));

    this.setState({
      proportionList: proportions,
      tokenNames: tokenItems,
      tokensHistory: historyMap,
      tokensLegend: proportions.map((value, i) => new TokenLegend(value.name, this.COLORS[i])),
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
      .then(result => {
        this.setState({arbitrationList: result});
        console.log(result);
        let profit: number = 0;
        let totalTxPrice: number = 0;

        result.forEach(value => {
          profit += value.arbiterProfit;
          totalTxPrice += value.txPrice;
        });

        this.setState({
          arbiterProfit: profit,
          arbiterTotalTxFee: totalTxPrice,
        });

        return this.tokenManager.calculateCap(false);
      })
      .then(cap => this.setState({
        arbiterCap: cap,
        showCalculationProgress: false,
      }))
      .then(() => this.tokenManager.calculateCap(true))
      .then(resultCap => Promise.resolve(this.setState({cap: resultCap})));
  }

}
