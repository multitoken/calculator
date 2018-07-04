import { Button, Col, Layout, Row } from 'antd';
import { SliderValue } from 'antd/es/slider';
import * as React from 'react';
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
      amount: this.tokenManager.getAmount(),
      arbiterCap: this.tokenManager.getAmount(),
      arbiterProfit: 0,
      arbiterTotalTxFee: 0,
      arbitrationList: [],
      btcCount: 0,
      btcUSDT: 0,
      calculateMaxDateIndex: 1,
      calculateRangeDateIndex: [0, 1],
      cap: this.tokenManager.getAmount(),
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
      window.location.replace('/arbitrator-simulator');
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

          <div className="ResultPage__content-block-profit">
            <Row>
              <Col span={8} className="ResultPage__content-text-title">
                Result cap with arbitrage:
              </Col>
              <Col span={8} className="ResultPage__content-text-title">
                Profit with arbitrage:
              </Col>
              <Col span={8} className="ResultPage__content-text-title">
                Annual percentage:
              </Col>
            </Row>
            <Row>
              <Col span={8} className={'ResultPage__content-text-result_big'}>
                ${this.state.arbiterCap.toFixed(0)}
              </Col>
              <Col
                span={8}
                className={
                  'ResultPage__content-text-result_big' +
                  this.getModif((this.state.arbiterCap - this.state.amount).toFixed(0))
                }
              >
                ${(this.state.arbiterCap - this.state.amount).toFixed(0)}
              </Col>
              <Col
                span={8}
                className={
                  'ResultPage__content-text-result_big' +
                  this.getModif(
                    (((this.state.arbiterCap - this.state.amount) / this.state.amount * 100 / 12) || 0).toFixed(0)
                  )
                }>
                {(((this.state.arbiterCap - this.state.amount) / this.state.amount * 100 / 12) || 0).toFixed(0)}%
              </Col>
            </Row>
          </div>

          {/*------------------*/}

          <div className="ResultPage__content-block">
            <Row>
              <Col span={8} className="ResultPage__content-text-title">
                Result cap without arbitrage:
              </Col>
              <Col span={8} className="ResultPage__content-text-title">
                Profit without arbitrage:
              </Col>
              <Col span={8} className="ResultPage__content-text-title">
                Annual percentage:
              </Col>
            </Row>
            <Row>
              <Col span={8} className="ResultPage__content-text-result">
                ${this.state.cap.toFixed(0)}
              </Col>
              <Col
                span={8}
                className={
                  'ResultPage__content-text-result' +
                  this.getModif((this.state.cap - this.state.amount).toFixed(0))
                }
              >
                ${(this.state.cap - this.state.amount).toFixed(0)}
              </Col>
              <Col
                span={8}
                className={
                  'ResultPage__content-text-result' +
                  this.getModif(
                    Math.max(0, (((this.state.cap - this.state.amount) / this.state.amount * 100 / 12) || 0))
                      .toFixed(0)
                  )
                }
              >
                {Math.max(0, (((this.state.cap - this.state.amount) / this.state.amount * 100 / 12) || 0))
                  .toFixed(0)}%
              </Col>
            </Row>
          </div>

          {/*----------------------*/}

          <Row gutter={16}>
            <Col span={12}>
              <div className="ResultPage__content-block">
                <div className="ResultPage__content-text-title">
                  Profit percent. in {this.calcCountDays()} days <b>without</b> arbitrage:
                </div>
                <div
                  className={
                    'ResultPage__content-text-result' +
                    this.getModif(Math.max(0, (((this.state.cap - this.state.amount) / this.state.amount * 100) || 0))
                      .toFixed(0))
                  }
                >
                  {
                    Math.max(0, (((this.state.cap - this.state.amount) / this.state.amount * 100) || 0))
                      .toFixed(0)
                  }%
                </div>
              </div>
            </Col>

            <Col span={12}>
              <div className="ResultPage__content-block">
                <div className="ResultPage__content-text-title">
                  Profit percent. in {this.calcCountDays()} days <b>with</b> arbitrage:
                </div>
                <div
                  className={
                    'ResultPage__content-text-result' +
                    this.getModif(
                      Math.max(0, (((this.state.arbiterCap - this.state.amount) / this.state.amount * 100) || 0))
                        .toFixed(0)
                    )
                  }
                >
                  {
                    Math.max(0, (((this.state.arbiterCap - this.state.amount) / this.state.amount * 100) || 0))
                      .toFixed(0)
                  }%
                </div>
              </div>
            </Col>
          </Row>

          {/*----------------------*/}

          <Row gutter={16}>
            <Col span={12}>
              <div className="ResultPage__content-block">
                <div className="ResultPage__content-text-title">
                  Profit <b>diff</b> percent. in {this.calcCountDays()} days <b>with</b> arbitrage:&nbsp;
                </div>
                <div className="ResultPage__content-text-result">
                  {
                    ((this.state.arbiterCap === 0)
                        ? 0
                        : ((this.state.arbiterCap - this.state.cap) / this.state.cap * 100) || 0
                    ).toFixed(0)
                  }%
                </div>
              </div>
            </Col>

            <Col span={12}>
              <div className="ResultPage__content-block">
                <div className="ResultPage__content-text-title">
                  Arbitrage count:
                </div>
                <div className="ResultPage__content-text-result">
                  {this.getArbitrationListLen()}
                </div>
              </div>
            </Col>
          </Row>

          {/*-----------------------*/}

          <Row gutter={16}>
            <Col span={12}>
              <div className="ResultPage__content-block">
                <div className="ResultPage__content-text-title">
                  Total Arbiter transactions fee:
                </div>
                <div className="ResultPage__content-text-result">
                  ${this.state.arbiterTotalTxFee.toFixed(0)}
                </div>
              </div>
            </Col>

            <Col span={12}>
              <div className="ResultPage__content-block">
                <div className="ResultPage__content-text-title">
                  Average Arbiter transactions fee:
                </div>
                <div className="ResultPage__content-text-result">
                  ${(this.state.arbiterTotalTxFee / (this.getArbitrationListLen() || 1)).toFixed(3)}
                </div>
              </div>
            </Col>
          </Row>

          {/*-----------------------*/}

          <Row gutter={16}>
            <Col span={12}>
              <div className="ResultPage__content-block">
                <div className="ResultPage__content-text-title">
                  Total Arbiter profit:
                </div>
                <div className="ResultPage__content-text-result">
                  ${this.state.arbiterProfit.toFixed(0)}
                </div>
              </div>
            </Col>

            <Col span={12}>
              <div className="ResultPage__content-block">
                <div className="ResultPage__content-text-title">
                  Average Arbiter profit:
                </div>
                <div className="ResultPage__content-text-result">
                  ${(this.state.arbiterProfit / (this.getArbitrationListLen() || 1)).toFixed(3)}
                </div>
              </div>
            </Col>
          </Row>

          {/*-----------------------*/}

          <Row gutter={16}>
            <Col span={12}>
              <div className="ResultPage__content-block">
                <div className="ResultPage__content-text-title">
                  BTC count:
                </div>
                <div className="ResultPage__content-text-result">
                  {this.state.btcCount}
                </div>
              </div>
            </Col>

            <Col span={12}>
              <div className="ResultPage__content-block">
                <div className="ResultPage__content-text-title">
                  BTC CAP
                </div>
                <div className="ResultPage__content-text-result">
                  ${this.state.btcUSDT.toFixed(2)}
                </div>
              </div>
            </Col>
          </Row>

          {/*-----------------------*/}

          <div style={{textAlign: 'center'}}>
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
                window.location.replace('/arbitrator-simulator');
              }}
            >
              Reset tokens
            </Button>
          </div>

        </PageContent>

        <PageContent className="ResultPage__content">
          <div className="ResultPage__result-chart">
            <span className="ResultPage__result-chart-title">Tokens history price $</span>
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
              Manipulation by the arbitrators (cap)$<br/>
              (Operations count: {this.getArbitrationListLen()})
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
              Tokens history price when manipulation by the arbitrators (cap per token)$<br/>
              (Operations count:{this.getArbitrationListLen()})
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

        <ProgressDialog
          openDialog={this.state.showCalculationProgress}
          percentProgress={this.state.progressPercents}
        />

      </Layout>
    );
  }

  private getModif(value: string): string {
    if (parseFloat(value) > 0) {
      return '_success';

    } else if (parseFloat(value) === 0) {
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
      .then(resultCap => Promise.resolve(this.setState({cap: resultCap})));
  }

}
