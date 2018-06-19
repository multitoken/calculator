import { Button, InputNumber, Layout } from 'antd';
import * as React from 'react';
import InputRange, { Range } from 'react-input-range';
import { RouteComponentProps } from 'react-router';
import Form from 'reactstrap/lib/Form';
import FormGroup from 'reactstrap/lib/FormGroup';
import { ArbiterChart } from '../components/charts/ArbiterChart';
import { HistoryChart } from '../components/charts/HistoryChart';
import { TokensCapChart } from '../components/charts/TokensCapChart';
import { WeightChart } from '../components/charts/WeightChart';
import { TokenWeightDialog } from '../components/dialogs/TokenWeightDialog';
import { TokensProportionsList } from '../components/lists/TokensProportionsList';
import { TokenWeightList } from '../components/lists/TokenWeightList';
import PageContent from '../components/page-content/PageContent';
import PageFooter from '../components/page-footer/PageFooter';
import PageHeader from '../components/page-header/PageHeader';
import Config from '../Config';
import { lazyInject, Services } from '../Injections';
import { TokenManager } from '../manager/TokenManager';
import { Arbitration } from '../repository/models/Arbitration';
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
  proportionList: TokenProportion[];
  calculateRangeDateIndex: Range | number;
  calculateMaxDateIndex: number;
  tokensWeightList: TokenWeight[];
  tokenWeightSelected: number;
  tokenDialogDateList: string[];
  tokenDialogOpen: boolean;
}

function inputNumberParser(value: string) {
  return Number(value.replace(/\$\s?|(,*)/g, ''));
}

export default class CalculatorPage extends React.Component<Props, State> {
  private readonly COLORS: string[] = [
    '#8884d8', '#82ca9d', '#f4f142', '#a6f441', '#41f497', '#41f4df', '#414cf4', '#d941f4',
    '#f4419d', '#720009'
  ];

  @lazyInject(Services.TOKEN_MANAGER)
  private tokenManager: TokenManager;

  constructor(props: Props) {
    super(props);

    this.state = {
      amount: 10000,
      arbiterCap: 0,
      arbiterProfit: 0,
      arbiterTotalTxFee: 0,
      arbitrationList: [],
      calculateMaxDateIndex: 1,
      calculateRangeDateIndex: {min: 0, max: 1},
      cap: 0,
      proportionList: [],
      tokenDialogDateList: [],
      tokenDialogOpen: false,
      tokenNames: new Map(),
      tokenWeightSelected: -1,
      tokensDate: [],
      tokensHistory: new Map(),
      tokensWeightList: [],
    };
  }

  public componentDidMount(): void {
    if (this.tokenManager.getPriceHistory().size === 0) {
      // Redirect to root
      window.location.replace('/arbitrator-simulator');
    }

    // console.log( this.tokenManager.cryptocurrencyRepository);
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
                data={this.state.tokensWeightList}
                colors={this.COLORS}
                width={800}
                height={200}
                showRange={false}
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
                      selectedPosition={this.state.tokenWeightSelected}
                      data={this.state.tokensWeightList}
                      onItemSelect={(model, position) => this.setState({tokenWeightSelected: position})}
                    />
                  </Content>

                  <Sider
                    style={{
                      background: 'transparent',
                      marginLeft: '15px'
                    }}>
                    <div>
                      <Button
                        type="primary"
                        size="small"
                        shape="circle"
                        icon="plus"
                        onClick={() => this.onChangeTokenWeightClick(false)}
                      />
                    </div>
                    <div>
                      <Button
                        type="primary"
                        size="small"
                        shape="circle"
                        icon="delete"
                        disabled={this.state.tokenWeightSelected === -1}
                        onClick={() => this.onDeleteTokenWeightClick()}
                      />
                    </div>
                    <div>
                      <Button
                        type="primary"
                        size="small"
                        shape="circle"
                        icon="edit"
                        disabled={this.state.tokenWeightSelected === -1}
                        onClick={() => this.onChangeTokenWeightClick(true)}
                      />
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
                Result cap <b>without/with</b> arbitrage BTC:&nbsp;
                <span className="CalculatorPage-result-value">
                  {this.state.cap} / {this.state.arbiterCap}
                  </span>
              </p>

              <p>
                Result cap <b>without/with</b> arbitrage $:&nbsp;
                <span className="CalculatorPage-result-value">
                  {this.state.cap * Config.getBtcUsdPrice()} /&nbsp;
                  {this.state.arbiterCap * Config.getBtcUsdPrice()}
                  &nbsp;
                  ({(this.state.arbiterCap - this.state.cap) * Config.getBtcUsdPrice()})
                </span>
              </p>

              <p>
                Result percent. in {this.calcCountDays()} days:&nbsp;
                <span className="CalculatorPage-result-value">
                  {(1 - (this.state.cap / this.state.arbiterCap)) * 100}%
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
                  ${this.state.arbiterProfit * Config.getBtcUsdPrice()}
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
            onOkClick={(token: string, dateIndex: number, weight: number, oldModel?: TokenWeight) => {
              this.onTokenDialogOkClick(token, dateIndex, weight, oldModel);
            }}
            onCancel={() => this.setState({tokenDialogOpen: false})}
            openDialog={this.state.tokenDialogOpen}
            tokenWeight={
              this.state.tokenWeightSelected >= 0
                ? this.state.tokensWeightList[this.state.tokenWeightSelected]
                : undefined
            }
            maxWeight={10}
            tokenNames={Array.from(this.tokenManager.getPriceHistory().keys())}
            dateList={this.state.tokensDate}
          />
        </PageContent>
        <PageFooter/>
      </Layout>
    );
  }

  private onChangeTokenWeightClick(edit: boolean): void {
    if (edit && this.state.tokenWeightSelected > -1) {
      this.setState({tokenDialogOpen: true});

    } else if (!edit) {
      this.setState({tokenWeightSelected: -1, tokenDialogOpen: true});
    }
  }

  private onDeleteTokenWeightClick(): void {
    if (this.state.tokenWeightSelected < 0) {
      return;
    }

    const list: TokenWeight [] = this.state.tokensWeightList.slice(0, this.state.tokensWeightList.length);

    list.splice(this.state.tokenWeightSelected, 1);
    list.sort((a, b) => a.timestamp - b.timestamp);

    this.setState({
      tokenWeightSelected: -1,
      tokensWeightList: list,
    });
  }

  private onTokenDialogOkClick(token: string, dateIndex: number, weight: number, oldModel?: TokenWeight) {
    this.setState({tokenDialogOpen: false});
    const model: TokenWeight = new TokenWeight(token, weight, this.state.tokensDate[dateIndex], dateIndex);
    const list: TokenWeight [] = this.state.tokensWeightList.slice(0, this.state.tokensWeightList.length);

    if (oldModel) {
      const position: number = list.indexOf(oldModel);
      list.splice(position, 1, model);

    } else {
      list.push(model);
    }

    list.sort((a, b) => a.timestamp - b.timestamp);
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
    this.state.proportionList[position].proportion = value;
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
      mapProportions.set(value.name, value.proportion);
    });

    this.tokenManager.changeProportions(mapProportions);

    this.applyTimelineProportions();

    this.tokenManager.calculateInitialAmounts(this.state.amount)
      .then(result => this.tokenManager.calculateCap())
      .then(cap => {
        this.setState({cap});

        return this.tokenManager.calculateArbitration();
      })
      .then(result => {
        this.setState({arbitrationList: result});
        // console.log(result);
        let profit: number = 0;
        let totalTxPrice: number = 0;

        result.forEach(value => {
          profit += value.arbiterProfit;
          totalTxPrice += value.txPrice;
        });

        this.setState({
          arbiterProfit: profit,
          arbiterTotalTxFee: totalTxPrice * Config.getBtcUsdPrice(),
        });

        return this.tokenManager.calculateCap();
      })
      .then(cap => this.setState({arbiterCap: cap}));
  }

  private applyTimelineProportions(): void {
    const result: Map<number, Map<string, number>> = new Map();

    this.state.tokensWeightList.forEach(value => {
      const map: Map<string, number> = result.get(value.index) || new Map();
      map.set(value.tokenName, value.weight);
      result.set(value.index, map);
    });

    this.tokenManager.resetTimelineProportions();

    result.forEach((value, key) => this.tokenManager.setTimelineProportion(key, value));
  }

}
