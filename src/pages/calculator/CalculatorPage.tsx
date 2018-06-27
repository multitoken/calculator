import { Button, Col, InputNumber, Layout, Row, Slider } from 'antd';
import { SliderValue } from 'antd/es/slider';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import Form from 'reactstrap/lib/Form';
import FormGroup from 'reactstrap/lib/FormGroup';
import { ChartType } from '../../components/charts/AbstractChart';
import { ArbiterChart } from '../../components/charts/ArbiterChart';
import { HistoryChart } from '../../components/charts/HistoryChart';
import { TokensCapChart } from '../../components/charts/TokensCapChart';
import { WeightChart } from '../../components/charts/WeightChart';
import { ProgressDialog } from '../../components/dialogs/ProgressDialog';
import { TokenWeightDialog } from '../../components/dialogs/TokenWeightDialog';
import { TokensProportionsList } from '../../components/lists/TokensProportionsList';
import { TokenWeightList } from '../../components/lists/TokenWeightList';
import PageContent from '../../components/page-content/PageContent';
import PageFooter from '../../components/page-footer/PageFooter';
import PageHeader from '../../components/page-header/PageHeader';
import { lazyInject, Services } from '../../Injections';
import { ProgressListener } from '../../manager/ProgressListener';
import { TokenManager } from '../../manager/TokenManager';
import { Arbitration } from '../../repository/models/Arbitration';
import Pair from '../../repository/models/Pair';
import { Token } from '../../repository/models/Token';
import { TokenPriceHistory } from '../../repository/models/TokenPriceHistory';
import { TokenProportion } from '../../repository/models/TokenProportion';
import { TokenWeight } from '../../repository/models/TokenWeight';
import { DateUtils } from '../../utils/DateUtils';
import './CalculatorPage.less';

interface Props extends RouteComponentProps<{}> {
}

interface State {
  tokenNames: Map<string, boolean>;
  tokensHistory: Map<string, TokenPriceHistory[]>;
  tokensDate: number[];
  arbitrationList: Arbitration[];
  arbiterCap: number;
  arbiterProfit: number;
  arbiterTotalTxFee: number;
  amount: number;
  cap: number;
  progressPercents: number;
  proportionList: TokenProportion[];
  showCalculationProgress: boolean;
  calculateRangeDateIndex: SliderValue;
  calculateMaxDateIndex: number;
  historyChartRangeDateIndex: SliderValue;
  tokensWeightSelectedIndex: number;
  tokensWeightList: TokenWeight[];
  tokenDialogDateList: string[];
  tokenDialogOpen: boolean;
  tokenLatestWeights: Map<string, number>;
  changeWeightMinDateIndex: number;
  commissionPercents: number;
}

export default class CalculatorPage extends React.Component<Props, State> implements ProgressListener {
  private readonly COLORS: string[] = [
    '#8884d8', '#82ca9d', '#f4f142', '#a6f441', '#41f497', '#41f4df', '#414cf4', '#d941f4',
    '#f4419d', '#720009'
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
      tokensWeightList: [],
      tokensWeightSelectedIndex: -1,
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
        <header className="CalculatorPage__header">
          Options
        </header>

        <PageContent>
          <Form style={{width: '100%'}}>
            <FormGroup>
              <div className="CalculatorPage__options-title">Amount of money:&nbsp;</div>
              <InputNumber
                value={this.state.amount}
                formatter={value => `$ ${value || '0'}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => parseInt((value || '0').replace(/\$\s?|(,*)/g, ''), 10)}
                onChange={value => this.onAmountChange(value)}
                style={{width: '100%'}}
              />

              <div className="CalculatorPage__options-title">Commission percents:&nbsp;</div>
              <InputNumber
                value={this.state.commissionPercents}
                step={0.01}
                formatter={value => `${value || '0'}%`}
                parser={value => parseFloat((value || '0').replace('%', ''))}
                max={99.99}
                min={0.01}
                onChange={value => this.onFeeChange(value)}
                style={{width: '100%'}}
              />

              <div>
                <div className="CalculatorPage__options-title">
                  Period of date:
                </div>
                <div
                  style={{
                    width: '100%',
                  }}
                >
                  <Slider
                    step={1}
                    range={true}
                    disabled={this.state.tokensWeightList.length > 0}
                    max={this.state.calculateMaxDateIndex}
                    min={0}
                    tipFormatter={value => this.inputRangeTrackValue(value)}
                    value={this.state.calculateRangeDateIndex}
                    onChange={value => this.setState({calculateRangeDateIndex: value})}
                    onAfterChange={(value: SliderValue) => {
                      this.setState({historyChartRangeDateIndex: this.state.calculateRangeDateIndex});
                      this.tokenManager.changeCalculationDate(value[0], value[1]);
                    }}
                  />
                </div>
              </div>

              <TokensProportionsList
                data={this.state.proportionList}
                disabled={this.state.tokensWeightList.length > 0}
                onChangeProportion={
                  (name, value, position) => this.onChangeProportion(name, value, position)
                }
              />
            </FormGroup>

            <div className="CalculatorPage__result-chart">
              <b>
                tokens weight:
              </b>
              <WeightChart
                applyScale={false}
                data={this.state.tokensWeightList}
                colors={this.COLORS}
                initialDate={this.state.tokensDate[this.state.calculateRangeDateIndex[0]]}
                initialState={this.state.proportionList}
                finishDate={this.state.tokensDate[this.state.calculateRangeDateIndex[1]]}
                width={1000}
                height={200}
                showRange={false}
                type={ChartType.BAR}
              />
              <div style={{marginLeft: '65px'}}>
                <div className="pb-4 text-right">
                  <Button
                    className="mr-2"
                    type="primary"
                    size="small"
                    icon="delete"
                    disabled={this.state.tokensWeightSelectedIndex <= -1}
                    onClick={() => this.onDeleteTokenWeightClick()}
                  />
                  <Button
                    className="mr-2"
                    type="primary"
                    size="small"
                    icon="edit"
                    disabled={this.state.tokensWeightSelectedIndex <= -1}
                    onClick={() => this.onChangeTokenExchangeWeightClick(true)}
                  />
                  <Button
                    type="primary"
                    size="small"
                    icon="plus"
                    onClick={() => this.onChangeTokenExchangeWeightClick(false)}
                  />
                </div>

                <TokenWeightList
                  bordered={true}
                  selectedPosition={this.state.tokensWeightSelectedIndex}
                  maxHeight="200px"
                  data={this.state.tokensWeightList}
                  onItemSelect={(model, pos) => this.setState({tokensWeightSelectedIndex: pos})}
                />
              </div>
            </div>

            <div className="text-center mt-3">
              <Button
                type="primary"
                size="large"
                onClick={() => this.onCalculateClick()}
              >
                Calculate
              </Button>
            </div>
          </Form>
        </PageContent>

        <header className="CalculatorPage__header">
          Result
        </header>

        <PageContent>
          <div>
            <div>
              <Row>
                <Col className="CalculatorPage__result-name">
                  Result cap <b>without/with</b> arbitrage:
                </Col>
                <Col>
                <span className="CalculatorPage__result-value">
                  ${this.state.cap.toFixed(0)} /&nbsp;
                  ${this.state.arbiterCap.toFixed(0)}
                  &nbsp;
                  (${(this.state.arbiterCap - this.state.cap).toFixed(0)})
                </span>
                </Col>
              </Row>

              <Row>
                <Col className="CalculatorPage__result-name">
                  Profit percent. in {this.calcCountDays()} days <b>without</b> arbitrage:&nbsp;
                </Col>
                <Col span={5}>
                <span className="CalculatorPage__result-value">
                  {
                    Math.max(0, (((this.state.cap - this.state.amount) / this.state.amount * 100) || 0))
                      .toFixed(0)
                  }%
                </span>
                </Col>
              </Row>

              <Row>
                <Col className="CalculatorPage__result-name">
                  Profit percent. in {this.calcCountDays()} days <b>with</b> arbitrage:&nbsp;
                </Col>
                <Col span={5}>
                <span className="CalculatorPage__result-value">
                 {
                   Math.max(0, (((this.state.arbiterCap - this.state.amount) / this.state.amount * 100) || 0))
                     .toFixed(0)
                 }%
                </span>
                </Col>
              </Row>

              <Row>
                <Col className="CalculatorPage__result-name">
                  Profit <b>diff</b> percent. in {this.calcCountDays()} days <b>with</b> arbitrage:&nbsp;
                </Col>
                <Col span={5}>
                <span className="CalculatorPage__result-value">
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
                <Col className="CalculatorPage__result-name">
                  Arbitrage count:&nbsp;
                </Col>
                <Col span={5}>
                <span className="CalculatorPage__result-value">
                  {this.getArbitrationListLen()}
                </span>
                </Col>
              </Row>
              <Row>
                <Col className="CalculatorPage__result-name">
                  Total Arbiter transactions fee:&nbsp;
                </Col>
                <Col span={5}>
                <span className="CalculatorPage__result-value">
                  ${this.state.arbiterTotalTxFee.toFixed(0)}
                </span>
                </Col>
              </Row>
              <Row>
                <Col className="CalculatorPage__result-name">
                  Average Arbiter transactions fee:&nbsp;
                </Col>
                <Col span={5}>
                <span className="CalculatorPage__result-value">
                  ${(this.state.arbiterTotalTxFee / (this.getArbitrationListLen() || 1)).toFixed(3)}
                </span>
                </Col>
              </Row>

              <Row>
                <Col className="CalculatorPage__result-name">
                  Total Arbiter profit:&nbsp;
                </Col>
                <Col span={5}>
                <span className="CalculatorPage__result-value">
                  ${this.state.arbiterProfit.toFixed(0)}
                </span>
                </Col>
              </Row>

              <Row>
                <Col className="CalculatorPage__result-name">
                  Average Arbiter profit:&nbsp;
                </Col>
                <Col span={5}>
                <span className="CalculatorPage__result-value">
                  ${(this.state.arbiterProfit / (this.getArbitrationListLen() || 1)).toFixed(3)}
                </span>
                </Col>
              </Row>
            </div>
          </div>

          <div className="CalculatorPage__result-chart mt-5">
            <b>Tokens history price $</b>
            <HistoryChart
              data={this.state.tokensHistory}
              colors={this.COLORS}
              start={this.state.historyChartRangeDateIndex[0]}
              end={this.state.historyChartRangeDateIndex[1]}
              showRange={false}
              width={1000}
              height={200}
            />
          </div>

          <div className="CalculatorPage__result-chart">
            <b>
              Manipulation by the arbitrators (cap)$<br/>
              (Operations count: {this.getArbitrationListLen()})
            </b>
            <ArbiterChart
              data={this.state.arbitrationList}
              colors={this.COLORS}
              width={1000}
              height={200}
              showRange={false}
            />
          </div>

          <div className="CalculatorPage__result-chart">
            <b>
              Tokens history price when manipulation by the arbitrators (cap per token)$<br/>
              (Operations count:{this.getArbitrationListLen()})
            </b>
            <TokensCapChart
              data={this.state.arbitrationList}
              colors={this.COLORS}
              width={1000}
              height={200}
              showRange={false}
            />
          </div>

          <TokenWeightDialog
            onOkClick={(tokenWeight, oldModel) => this.onTokenDialogOkClick(tokenWeight, oldModel)}
            onCancel={() => this.setState({tokenDialogOpen: false})}
            openDialog={this.state.tokenDialogOpen}
            tokenWeights={this.state.tokenLatestWeights}
            editTokenWeights={
              this.state.tokensWeightSelectedIndex > -1
                ? this.state.tokensWeightList[this.state.tokensWeightSelectedIndex]
                : undefined
            }
            maxWeight={10}
            minDateIndex={this.state.changeWeightMinDateIndex}
            tokenNames={Array.from(this.tokenManager.getPriceHistory().keys())}
            dateList={this.state.tokensDate}
          />
          <ProgressDialog
            openDialog={this.state.showCalculationProgress}
            percentProgress={this.state.progressPercents}
          />
        </PageContent>
        <PageFooter/>
      </Layout>
    );
  }

  private onChangeTokenExchangeWeightClick(edit: boolean): void {
    const latestTokensWeight: Map<string, number> = new Map();
    const len: number = edit ? this.state.tokensWeightList.length - 1 : this.state.tokensWeightList.length;

    for (let i = 0; i < len; i++) {
      const tokenPair = this.state.tokensWeightList[i].tokens;
      tokenPair.toArray().forEach((value2: Token) => {
        latestTokensWeight.set(value2.name, value2.weight);
      });
    }

    this.state.proportionList.forEach(value => {
      if (!latestTokensWeight.has(value.name)) {
        latestTokensWeight.set(value.name, value.weight);
      }
    });

    const weightList: TokenWeight[] = this.state.tokensWeightList;
    const minDateIndex: number = weightList.length > 0
      ? weightList[weightList.length - 1].index
      : this.state.calculateRangeDateIndex[0];

    if (edit) {
      this.setState({
        changeWeightMinDateIndex: this.state.tokensWeightList[this.state.tokensWeightSelectedIndex].index,
        tokenDialogOpen: true,
        tokenLatestWeights: latestTokensWeight,
      });

    } else {
      this.setState({
        changeWeightMinDateIndex: minDateIndex + 1,
        tokenDialogOpen: true,
        tokenLatestWeights: latestTokensWeight,
        tokensWeightSelectedIndex: -1,
      });
    }
  }

  private onDeleteTokenWeightClick(): void {
    const list: TokenWeight [] = this.state.tokensWeightList.slice(0, this.state.tokensWeightList.length);

    list.splice(this.state.tokensWeightSelectedIndex, 1);

    this.setState({
      tokensWeightList: list,
      tokensWeightSelectedIndex: -1,
    });
  }

  private onTokenDialogOkClick(model: TokenWeight, oldModel: TokenWeight | undefined) {
    this.setState({tokenDialogOpen: false});
    const list: TokenWeight [] = this.state.tokensWeightList.slice(0, this.state.tokensWeightList.length);
    if (oldModel === undefined) {
      list.push(model);

    } else {
      list.splice(list.indexOf(oldModel), 1, model);
    }

    list.sort((a, b) => a.timestamp - b.timestamp);

    this.setState({tokensWeightList: list});
  }

  private calcCountDays(): number {
    const min: number = this.state.calculateRangeDateIndex[0];
    const max: number = this.state.calculateRangeDateIndex[1];

    return Math.floor((max - min) / 60 / 24);
  }

  private inputRangeTrackValue(value: number): string {
    if (value > -1 && value <= this.state.tokensDate.length - 1) {
      return DateUtils.toStringDate(this.state.tokensDate[value], DateUtils.DATE_FORMAT_SHORT);
    } else {
      return 'wrong date';
    }
  }

  private getArbitrationListLen(): number {
    return Math.max(0, this.state.arbitrationList.length - 1);
  }

  private onChangeProportion(name: string, value: number, position: number) {
    this.state.proportionList[position].weight = value;
    this.setState({proportionList: this.state.proportionList});
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

    this.setState({proportionList: proportions});
    this.setState({tokenNames: tokenItems});
    this.setState({tokensHistory: this.tokenManager.getPriceHistory()});
  }

  private onAmountChange(value: number | string | undefined) {
    const valueNumber = Number(value);

    if (valueNumber > 0) {
      this.setState({amount: valueNumber});
    }
  }

  private onFeeChange(value: number | string | undefined) {
    const valueNumber = Math.max(0.01, Math.min(99.99, Number(value)));

    if (valueNumber > 0) {
      this.setState({commissionPercents: valueNumber});
    }
  }

  private onCalculateClick() {
    const mapProportions: Map<string, number> = new Map();

    this.state.proportionList.forEach(value => {
      mapProportions.set(value.name, value.weight);
    });

    this.tokenManager.changeProportions(mapProportions);

    this.applyTimelineProportions();

    this.tokenManager.setCommission(this.state.commissionPercents);

    this.tokenManager
      .calculateInitialAmounts(this.state.amount)
      .then(() => this.tokenManager.calculateCap())
      .then(cap => Promise.resolve(this.setState({cap})))
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

        return this.tokenManager.calculateCap();
      })
      .then(cap => this.setState({
        arbiterCap: cap,
        showCalculationProgress: false,
      }));
  }

  private applyTimelineProportions(): void {
    const result: Map<number, Pair<Token, Token>> = new Map();

    this.state.tokensWeightList.forEach(weights => {
      result.set(weights.index, weights.tokens);
    });

    this.tokenManager.setExchangeWeights(result);
  }

}
