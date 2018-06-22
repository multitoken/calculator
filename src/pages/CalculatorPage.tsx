import { Button, InputNumber, Layout } from 'antd';
import * as React from 'react';
import InputRange, { Range } from 'react-input-range';
import { RouteComponentProps } from 'react-router';
import Form from 'reactstrap/lib/Form';
import FormGroup from 'reactstrap/lib/FormGroup';
import { ChartType } from '../components/charts/AbstractChart';
import { ArbiterChart } from '../components/charts/ArbiterChart';
import { HistoryChart } from '../components/charts/HistoryChart';
import { TokensCapChart } from '../components/charts/TokensCapChart';
import { WeightChart } from '../components/charts/WeightChart';
import { ProgressDialog } from '../components/dialogs/ProgressDialog';
import { TokenWeightDialog } from '../components/dialogs/TokenWeightDialog';
import { TokensProportionsList } from '../components/lists/TokensProportionsList';
import { TokenWeightList } from '../components/lists/TokenWeightList';
import PageContent from '../components/page-content/PageContent';
import PageFooter from '../components/page-footer/PageFooter';
import PageHeader from '../components/page-header/PageHeader';
import { lazyInject, Services } from '../Injections';
import { ProgressListener } from '../manager/ProgressListener';
import { TokenManager } from '../manager/TokenManager';
import { Arbitration } from '../repository/models/Arbitration';
import Pair from '../repository/models/Pair';
import { Token } from '../repository/models/Token';
import { TokenPriceHistory } from '../repository/models/TokenPriceHistory';
import { TokenProportion } from '../repository/models/TokenProportion';
import { TokenWeight } from '../repository/models/TokenWeight';
import { DateUtils } from '../utils/DateUtils';
import './CalculatorPage.css';

const {Content, Sider} = Layout;

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
  calculateRangeDateIndex: Range | number;
  calculateMaxDateIndex: number;
  tokensWeightList: TokenWeight[];
  tokenDialogDateList: string[];
  tokenDialogOpen: boolean;
  tokenLatestWeights: Map<string, number>;
  changeWeightMinDateIndex: number;
}

function inputNumberParser(value: string) {
  return Number(value.replace(/\$\s?|(,*)/g, ''));
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
      calculateRangeDateIndex: {min: 0, max: 1},
      cap: 0,
      changeWeightMinDateIndex: 1,
      progressPercents: 0,
      proportionList: [],
      tokenDialogDateList: [],
      tokenDialogOpen: false,
      tokenLatestWeights: new Map(),
      tokenNames: new Map(),
      tokensDate: [],
      tokensHistory: new Map(),
      tokensWeightList: [],
    };
  }

  public onProgress(percents: number): void {
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
          minWidth: 1000
        }}
      >
        <PageHeader/>
        <PageContent>
          <Form style={{width: 900, marginBottom: 50}}>
            <FormGroup>
              <span>Amount of money:&nbsp;</span>
              <InputNumber
                value={this.state.amount}
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={inputNumberParser}
                onChange={value => this.onAmountChange(value)}
                style={{width: 200}}
              />

              <div>
                <div>
                  Period of time
                </div>
                <div
                  style={{
                    padding: '25px 50px 50px 50px',
                    width: 700,
                  }}
                >
                  <InputRange
                    disabled={this.state.tokensWeightList.length > 0}
                    maxValue={this.state.calculateMaxDateIndex}
                    minValue={0}
                    formatLabel={value => this.inputRangeTrackValue(value)}
                    value={this.state.calculateRangeDateIndex}
                    onChange={value => this.setState({calculateRangeDateIndex: value})}
                    onChangeComplete={(value: Range) => {
                      this.tokenManager.changeCalculationDate(value.min, value.max);
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

            <div className="CalculatorPage-result-chart">
              <b>
                tokens weight:
              </b>
              <WeightChart
                applyScale={false}
                data={this.state.tokensWeightList}
                colors={this.COLORS}
                initialDate={this.state.tokensDate[(this.state.calculateRangeDateIndex as Range).min]}
                initialState={this.state.proportionList}
                finishDate={this.state.tokensDate[(this.state.calculateRangeDateIndex as Range).max]}
                width={800}
                height={200}
                showRange={false}
                type={ChartType.BAR}
              />
              <div>
                <Layout
                  style={{
                    background: 'transparent',
                    marginLeft: '65px',
                    maxHeight: '200px',
                    width: '945px'
                  }}>
                  <Content>
                    <TokenWeightList
                      bordered={true}
                      selectedPosition={-1}
                      data={this.state.tokensWeightList}
                    />
                  </Content>

                  <Sider
                    style={{
                      background: 'transparent',
                      marginLeft: '15px'
                    }}>
                    <div className="pb-2">
                      <Button
                        type="primary"
                        size="small"
                        shape="circle"
                        icon="plus"
                        onClick={() => this.onAddTokenExchangeWeightClick()}
                      />
                    </div>
                    <div>
                      <Button
                        type="primary"
                        size="small"
                        disabled={this.state.tokensWeightList.length <= 0}
                        onClick={() => this.onDeleteTokenWeightClick()}
                      >
                        Remove last item
                      </Button>
                    </div>
                  </Sider>
                </Layout>
              </div>
            </div>

            <Button
              type="primary"
              size="large"
              onClick={() => this.onCalculateClick()}
              style={{
                padding: '0 30px',
              }}
            >
              Calculate
            </Button>
          </Form>

          <div>
            <h4>Result</h4>

            <div>
              <p>
                Result cap <b>without/with</b> arbitrage $:&nbsp;
                <span className="CalculatorPage-result-value">
                  {this.state.cap} /&nbsp;
                  {this.state.arbiterCap}
                  &nbsp;
                  ({(this.state.arbiterCap - this.state.cap)})
                </span>
              </p>

              <p>
                Profit percent. in {this.calcCountDays()} days <b>without</b> arbitrage:&nbsp;
                <span className="CalculatorPage-result-value">
                  {((this.state.cap - this.state.amount) / this.state.amount * 100).toFixed(4) || 0}%
                </span>
              </p>

              <p>
                Profit percent. in {this.calcCountDays()} days <b>with</b> arbitrage:&nbsp;
                <span className="CalculatorPage-result-value">
                 {((this.state.arbiterCap - this.state.amount) / this.state.amount * 100).toFixed(4) || 0}%
                </span>
              </p>

              <p>
                Profit <b>diff</b> percent. in {this.calcCountDays()} days <b>with</b> arbitrage:&nbsp;
                <span className="CalculatorPage-result-value">
                 {((this.state.arbiterCap - this.state.cap) / this.state.cap * 100).toFixed(4) || 0}%
                </span>
              </p>

              <p>
                Total Arbiter transactions fee:&nbsp;
                <span className="CalculatorPage-result-value">
                  ${this.state.arbiterTotalTxFee}
                </span>
              </p>

              <p>
                Arbiter profit:&nbsp;
                <span className="CalculatorPage-result-value">
                  ${this.state.arbiterProfit}
                </span>
              </p>
            </div>
          </div>

          <div className="CalculatorPage-result-chart">
            <b>Tokens history price $</b>
            <HistoryChart
              data={this.state.tokensHistory}
              colors={this.COLORS}
              start={(this.state.calculateRangeDateIndex as Range).min}
              end={(this.state.calculateRangeDateIndex as Range).max}
              showRange={true}
              width={800}
              height={200}
            />
          </div>

          <div className="CalculatorPage-result-chart">
            <b>
              Manipulation by the arbitrators (cap)$<br/>
              (Operations count: {this.getArbitrationListLen()})
            </b>
            <ArbiterChart
              data={this.state.arbitrationList}
              colors={this.COLORS}
              width={800}
              height={200}
              showRange={true}
            />
          </div>

          <div className="CalculatorPage-result-chart"
               style={{
                 marginBottom: 200,
               }}
          >
            <b>
              Tokens history price when manipulation by the arbitrators (cap per token)$<br/>
              (Operations count:{this.getArbitrationListLen()})
            </b>
            <TokensCapChart
              data={this.state.arbitrationList}
              colors={this.COLORS}
              width={800}
              height={200}
              showRange={true}
            />
          </div>

          <TokenWeightDialog
            onOkClick={(tokenWeight: TokenWeight) => this.onTokenDialogOkClick(tokenWeight)}
            onCancel={() => this.setState({tokenDialogOpen: false})}
            openDialog={this.state.tokenDialogOpen}
            tokenWeights={this.state.tokenLatestWeights}
            maxWeight={10}
            minDateIndex={this.state.changeWeightMinDateIndex}
            tokenNames={Array.from(this.tokenManager.getPriceHistory().keys())}
            dateList={this.state.tokensDate}
          />
          <ProgressDialog
            openDialog={this.state.progressPercents > 0}
            percentProgress={this.state.progressPercents}
          />
        </PageContent>
        <PageFooter/>
      </Layout>
    );
  }

  private onAddTokenExchangeWeightClick(): void {
    const latestTokensWeight: Map<string, number> = new Map();

    this.state.tokensWeightList.forEach(value => {
      value.tokens.toArray().forEach((value2: Token) => {
        latestTokensWeight.set(value2.name, value2.weight);
      });
    });

    this.state.proportionList.forEach(value => {
      if (!latestTokensWeight.has(value.name)) {
        latestTokensWeight.set(value.name, value.weight);
      }
    });

    const weightList: TokenWeight[] = this.state.tokensWeightList;
    const minDateIndex: number = weightList.length > 0
      ? weightList[weightList.length - 1].index
      : (this.state.calculateRangeDateIndex as Range).min;

    this.setState({
      changeWeightMinDateIndex: minDateIndex + 1,
      tokenDialogOpen: true,
      tokenLatestWeights: latestTokensWeight,
    });
  }

  private onDeleteTokenWeightClick(): void {
    const list: TokenWeight [] = this.state.tokensWeightList.slice(0, this.state.tokensWeightList.length);

    list.pop();

    this.setState({
      tokensWeightList: list,
    });
  }

  private onTokenDialogOkClick(model: TokenWeight) {
    this.setState({tokenDialogOpen: false});
    const list: TokenWeight [] = this.state.tokensWeightList.slice(0, this.state.tokensWeightList.length);
    list.push(model);

    this.setState({tokensWeightList: list});
  }

  private calcCountDays(): number {
    const max: number = (this.state.calculateRangeDateIndex as Range).max;
    const min: number = (this.state.calculateRangeDateIndex as Range).min;
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
      proportions.push(new TokenProportion(key, 1, 1, 10));
    });
    const firstTokenName: string = Array.from(this.tokenManager.getPriceHistory().keys())[0];
    const history: TokenPriceHistory[] = this.tokenManager.getPriceHistory().get(firstTokenName) || [];

    this.setState({tokensDate: history.map(value => value.time)});

    const maxIndex: number = this.tokenManager.getMaxCalculationIndex() - 1;
    this.setState({
      calculateMaxDateIndex: maxIndex,
      calculateRangeDateIndex: {min: 0, max: maxIndex}
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

  private onCalculateClick() {
    const mapProportions: Map<string, number> = new Map();

    this.state.proportionList.forEach(value => {
      mapProportions.set(value.name, value.weight);
    });

    this.tokenManager.changeProportions(mapProportions);

    this.applyTimelineProportions();

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
      .then(cap => this.setState({arbiterCap: cap}));
  }

  private applyTimelineProportions(): void {
    const result: Map<number, Pair<Token, Token>> = new Map();

    this.state.tokensWeightList.forEach(weights => {
      result.set(weights.index, weights.tokens);
    });

    this.tokenManager.setExchangeWeights(result);
  }

}
