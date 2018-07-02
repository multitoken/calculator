import { Col, Layout, Row } from 'antd';
import { SliderValue } from 'antd/es/slider';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { ArbiterChart } from '../../components/charts/ArbiterChart';
import { HistoryChart } from '../../components/charts/HistoryChart';
import { TokensCapChart } from '../../components/charts/TokensCapChart';
import { ProgressDialog } from '../../components/dialogs/ProgressDialog';
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

  @lazyInject(Services.TOKEN_MANAGER)
  private tokenManager: TokenManager;

  constructor(props: Props) {
    super(props);

    this.tokenManager.subscribeToProgress(this);

    this.state = {
      amount: 10000,
      arbiterCap: 0,
      arbiterProfit: 0,
      arbiterTotalTxFee: 0,
      arbitrationList: [],
      btcCount: 0,
      btcUSDT: 0,
      calculateMaxDateIndex: 1,
      calculateRangeDateIndex: [0, 1],
      cap: 0,
      changeWeightMinDateIndex: 1,
      commissionPercents: 0.2,
      historyChartRangeDateIndex: [0, 1],
      progressPercents: 0,
      proportionList: [],
      showCalculationProgress: false,
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
      // window.location.replace('/arbitrator-simulator');
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
          background: '#f5f8fa',
          minHeight: '100vh',
        }}
      >
        <PageHeader/>
        <header className="ResultPage__header">
          Result
        </header>
        <div className="ResultPage__content">
          <div>
            <Row>
              <Col className="ResultPage__result-name">
                Result cap <b>without/with</b> arbitrage:
              </Col>
              <Col>
                <span className="ResultPage__result-value">
                  ${this.state.cap.toFixed(0)} /&nbsp;
                  ${this.state.arbiterCap.toFixed(0)}
                  &nbsp;
                  (${(this.state.arbiterCap - this.state.cap).toFixed(0)})
                </span>
              </Col>
            </Row>
            <Row>
              <Col className="ResultPage__result-name">
                Result <b>BTC</b>:
              </Col>
              <Col>
                <span className="ResultPage__result-value">
                  {this.state.btcCount} &nbsp; (${this.state.btcUSDT.toFixed(2)})
                </span>
              </Col>
            </Row>
            <Row>
              <Col className="ResultPage__result-name">
                Profit percent. in {this.calcCountDays()} days <b>without</b> arbitrage:&nbsp;
              </Col>
              <Col span={5}>
                <span className="ResultPage__result-value">
                  {
                    Math.max(0, (((this.state.cap - this.state.amount) / this.state.amount * 100) || 0))
                      .toFixed(0)
                  }%
                </span>
              </Col>
            </Row>

            <Row>
              <Col className="ResultPage__result-name">
                Profit percent. in {this.calcCountDays()} days <b>with</b> arbitrage:&nbsp;
              </Col>
              <Col span={5}>
                <span className="ResultPage__result-value">
                 {
                   Math.max(0, (((this.state.arbiterCap - this.state.amount) / this.state.amount * 100) || 0))
                     .toFixed(0)
                 }%
                </span>
              </Col>
            </Row>

            <Row>
              <Col className="ResultPage__result-name">
                Profit <b>diff</b> percent. in {this.calcCountDays()} days <b>with</b> arbitrage:&nbsp;
              </Col>
              <Col span={5}>
                <span className="ResultPage__result-value">
                 {
                   ((this.state.arbiterCap === 0)
                       ? 0
                       : ((this.state.arbiterCap - this.state.cap) / this.state.cap * 100) || 0
                   ).toFixed(0)
                 }%
                </span>
              </Col>
            </Row>

            <Row>
              <Col className="ResultPage__result-name">
                Arbitrage count:&nbsp;
              </Col>
              <Col span={5}>
                <span className="ResultPage__result-value">
                  {this.getArbitrationListLen()}
                </span>
              </Col>
            </Row>
            <Row>
              <Col className="ResultPage__result-name">
                Total Arbiter transactions fee:&nbsp;
              </Col>
              <Col span={5}>
                <span className="ResultPage__result-value">
                  ${this.state.arbiterTotalTxFee.toFixed(0)}
                </span>
              </Col>
            </Row>
            <Row>
              <Col className="ResultPage__result-name">
                Average Arbiter transactions fee:&nbsp;
              </Col>
              <Col span={5}>
                <span className="ResultPage__result-value">
                  ${(this.state.arbiterTotalTxFee / (this.getArbitrationListLen() || 1)).toFixed(3)}
                </span>
              </Col>
            </Row>

            <Row>
              <Col className="ResultPage__result-name">
                Total Arbiter profit:&nbsp;
              </Col>
              <Col span={5}>
                <span className="ResultPage__result-value">
                  ${this.state.arbiterProfit.toFixed(0)}
                </span>
              </Col>
            </Row>

            <Row>
              <Col className="ResultPage__result-name">
                Average Arbiter profit:&nbsp;
              </Col>
              <Col span={5}>
                <span className="ResultPage__result-value">
                  ${(this.state.arbiterProfit / (this.getArbitrationListLen() || 1)).toFixed(3)}
                </span>
              </Col>
            </Row>
          </div>
        </div>

        <div className="ResultPage__result-chart mt-5">
          <b>Tokens history price $</b>
          <HistoryChart
            data={this.state.tokensHistory}
            colors={this.COLORS}
            start={this.state.historyChartRangeDateIndex[0]}
            end={this.state.historyChartRangeDateIndex[1]}
            showRange={false}
          />
        </div>

        <div className="ResultPage__result-chart">
          <b>
            Manipulation by the arbitrators (cap)$<br/>
            (Operations count: {this.getArbitrationListLen()})
          </b>
          <ArbiterChart
            data={this.state.arbitrationList}
            colors={this.COLORS}
            showRange={false}
          />
        </div>

        <div className="ResultPage__result-chart">
          <b>
            Tokens history price when manipulation by the arbitrators (cap per token)$<br/>
            (Operations count:{this.getArbitrationListLen()})
          </b>
          <TokensCapChart
            data={this.state.arbitrationList}
            colors={this.COLORS}
            showRange={false}
          />
        </div>

        <ProgressDialog
          openDialog={this.state.showCalculationProgress}
          percentProgress={this.state.progressPercents}
        />

      </Layout>
    );
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

    this.setState({
      proportionList: proportions,
      tokenNames: tokenItems,
      tokensHistory: this.tokenManager.getPriceHistory(),
      tokensLegend: proportions.map((value, i) => new TokenLegend(value.name, this.COLORS[i])),
    });

    this.processCalculate();
  }

  private processCalculate() {
    this.tokenManager
      .getBtcPrice()
      .then(btcusdt => {
        const count: number = this.state.amount / btcusdt[this.state.historyChartRangeDateIndex[0]].value;
        const btcUsdt: number = count * btcusdt[this.state.historyChartRangeDateIndex[1]].value;
        console.log(
          this.state.historyChartRangeDateIndex[0],
          this.state.historyChartRangeDateIndex[1],
          btcusdt[this.state.historyChartRangeDateIndex[0]].value,
          btcusdt[this.state.historyChartRangeDateIndex[1]].value
        );
        this.setState({btcCount: count, btcUSDT: btcUsdt});

        return this.tokenManager.calculateInitialAmounts();
      })
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
      .then(cap => Promise.resolve(this.setState({cap})));
  }

}
