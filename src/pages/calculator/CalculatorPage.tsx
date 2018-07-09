import { Button, InputNumber, Layout, Slider } from 'antd';
import { SliderValue } from 'antd/es/slider';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { ChartType } from '../../components/charts/AbstractChart';
import { HistoryChart } from '../../components/charts/HistoryChart';
import { WeightChart } from '../../components/charts/WeightChart';
import { TokenWeightDialog } from '../../components/dialogs/TokenWeightDialog';
import { LegendStyle } from '../../components/holders/legend/TokenLegendHolder';
import { TokensLegendList } from '../../components/lists/legend/TokensLegendList';
import { TokensProportionsList } from '../../components/lists/proportion/TokensProportionsList';
import { TokenWeightList } from '../../components/lists/weight/TokenWeightList';
import PageContent from '../../components/page-content/PageContent';
import PageHeader from '../../components/page-header/PageHeader';
import { TokenLegend } from '../../entities/TokenLegend';
import { lazyInject, Services } from '../../Injections';
import { TokenManager } from '../../manager/TokenManager';
import { Token } from '../../repository/models/Token';
import { TokenPriceHistory } from '../../repository/models/TokenPriceHistory';
import { TokenProportion } from '../../repository/models/TokenProportion';
import { TokenWeight } from '../../repository/models/TokenWeight';
import { DateUtils } from '../../utils/DateUtils';
import { TokensHelper } from '../../utils/TokensHelper';
import './CalculatorPage.less';

interface Props extends RouteComponentProps<{}> {
}

interface State {
  tokenNames: Map<string, boolean>;
  tokensHistory: Map<string, TokenPriceHistory[]>;
  tokensLegend: TokenLegend[];
  tokensDate: number[];
  amount: number;
  proportionList: TokenProportion[];
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

export default class CalculatorPage extends React.Component<Props, State> {

  @lazyInject(Services.TOKEN_MANAGER)
  private tokenManager: TokenManager;

  constructor(props: Props) {
    super(props);

    this.state = {
      amount: this.tokenManager.getAmount(),
      calculateMaxDateIndex: this.tokenManager.getMaxCalculationIndex() - 1,
      calculateRangeDateIndex: this.tokenManager.getCalculationDate(),
      changeWeightMinDateIndex: this.tokenManager.getCalculationDate()[0],
      commissionPercents: this.tokenManager.getCommission(),
      historyChartRangeDateIndex: this.tokenManager.getCalculationDate(),
      proportionList: [],
      tokenDialogDateList: [],
      tokenDialogOpen: false,
      tokenLatestWeights: new Map(),
      tokenNames: new Map(),
      tokensDate: [],
      tokensHistory: new Map(),
      tokensLegend: [],
      tokensWeightEditItem: undefined,
      tokensWeightList: this.tokenManager.getExchangedWeights(),
    };
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
        <div className="CalculatorPage__content">
          <PageContent className="CalculatorPage__content-left">
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
                Period:
              </div>
              <div
                style={{
                  marginBottom: '10px',
                  width: '100%',
                }}
              >
                <Slider
                  step={1}
                  range={true}
                  disabled={this.state.tokensWeightList.length > 0}
                  max={this.state.calculateMaxDateIndex}
                  min={0}
                  defaultValue={[0, 10]}
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
          </PageContent>
          <PageContent className="CalculatorPage__content-right-top">
            <div
              className="CalculatorPage__content-rebalance-blocked"
              style={{
                display: this.tokenManager.disabledManualRebalance() ? 'block' : 'none',
              }}
            >
              Disabled in selected type of multitoken.
            </div>
            <div
              className="CalculatorPage__options-title"
              style={{display: this.tokenManager.disabledManualRebalance() ? 'none' : 'block'}}
            >
              Change token weight:
            </div>
            <div
              className="CalculatorPage__result-chart"
              style={{display: this.tokenManager.disabledManualRebalance() ? 'none' : 'block'}}
            >
              <div style={{margin: '0px 20px 0px -20px'}}>
                <WeightChart
                  applyScale={false}
                  data={this.state.tokensWeightList}
                  colors={TokensHelper.COLORS}
                  initialDate={this.state.tokensDate[this.state.calculateRangeDateIndex[0]]}
                  initialState={this.state.proportionList}
                  finishDate={this.state.tokensDate[this.state.calculateRangeDateIndex[1]]}
                  showRange={false}
                  type={ChartType.BAR}
                />
              </div>
              <div style={{margin: '10px 20px 0px 45px'}}>
                <TokensLegendList
                  style={LegendStyle.LINE}
                  columnCount={4}
                  data={this.state.tokensLegend}
                />
              </div>
              <div style={{margin: '0 20px 0px 45px'}}>
                <TokenWeightList
                  maxHeight="200px"
                  onAddClick={() => this.onChangeTokenExchangeWeightClick(-1)}
                  onEditClick={(model, position) => this.onChangeTokenExchangeWeightClick(position, model)}
                  onDeleteClick={(model, position) => this.onDeleteTokenWeightClick(position)}
                  data={this.state.tokensWeightList}
                />
              </div>
            </div>
            <div className="CalculatorPage__content-calculate">
              <Button
                type="primary"
                size="large"
                onClick={() => this.onCalculateClick()}
              >
                Calculate
              </Button>
              <span className="m-2"/>
              <Button
                type="primary"
                size="large"
                onClick={() => {
                  window.location.replace('/simulator');
                }}
              >
                Start new
              </Button>
            </div>
          </PageContent>
          <PageContent className="CalculatorPage__content-bottom">
            <HistoryChart
              timeStep={this.tokenManager.getStepSec()}
              data={this.state.tokensHistory}
              colors={TokensHelper.COLORS}
              start={this.state.historyChartRangeDateIndex[0]}
              end={this.state.historyChartRangeDateIndex[1]}
              applyScale={!this.tokenManager.isFakeMode()}
              showRange={false}
            />
          </PageContent>
        </div>

        <TokenWeightDialog
          onOkClick={(tokenWeight, oldModel) => this.onTokenDialogOkClick(tokenWeight, oldModel)}
          onCancel={() => this.setState({tokenDialogOpen: false})}
          openDialog={this.state.tokenDialogOpen}
          tokenWeights={this.state.tokenLatestWeights}
          editTokenWeights={this.state.tokensWeightEditItem}
          maxWeight={10}
          minDateIndex={this.state.changeWeightMinDateIndex}
          tokenNames={Array.from(this.tokenManager.getPriceHistory().keys())}
          dateList={this.state.tokensDate}
        />

      </Layout>
    );
  }

  private onChangeTokenExchangeWeightClick(position: number, model?: TokenWeight): void {
    const latestTokensWeight: Map<string, number> = new Map();
    const len: number = model ? this.state.tokensWeightList.length - 1 : this.state.tokensWeightList.length;

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

    this.setState({
      changeWeightMinDateIndex: this.tokenManager.getCalculationDate()[0],
      tokenDialogOpen: true,
      tokenLatestWeights: latestTokensWeight,
      tokensWeightEditItem: model,
    });
  }

  private onDeleteTokenWeightClick(position: number): void {
    const list: TokenWeight [] = this.state.tokensWeightList.slice(0, this.state.tokensWeightList.length);

    list.splice(position, 1);

    this.setState({tokensWeightList: list});
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

  private inputRangeTrackValue(value: number): string {
    if (value > -1 && value <= this.state.tokensDate.length - 1) {
      return DateUtils.toFormat(this.state.tokensDate[value], DateUtils.DATE_FORMAT_SHORT);
    } else {
      return 'wrong date';
    }
  }

  private onChangeProportion(name: string, value: number, position: number) {
    const result: TokenProportion[] = this.state.proportionList.slice(0, this.state.proportionList.length);
    result[position].weight = value;
    this.setState({proportionList: result});
  }

  private onSyncTokens(tokens: Map<string, string>) {
    const tokenItems: Map<string, boolean> = new Map();
    let proportions: TokenProportion[] = [];

    tokens.forEach((value, key) => tokenItems.set(key, false));

    if (this.tokenManager.getProportions().length === 0) {
      this.tokenManager.getPriceHistory().forEach((value, key) => {
        proportions.push(new TokenProportion(key, 10, 1, 10));
      });
    } else {
      proportions = this.tokenManager.getProportions();
    }

    const firstTokenName: string = Array.from(this.tokenManager.getPriceHistory().keys())[0];
    const history: TokenPriceHistory[] = this.tokenManager.getPriceHistory().get(firstTokenName) || [];

    this.setState({tokensDate: history.map(value => value.time)});

    this.setState({
      proportionList: proportions,
      tokenNames: tokenItems,
      tokensHistory: this.tokenManager.getPriceHistory(),
      tokensLegend: proportions.map((value, i) => new TokenLegend(value.name, TokensHelper.getColor(i))),
    });
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
    this.tokenManager.changeProportions(this.state.proportionList);

    this.tokenManager.setExchangeWeights(this.state.tokensWeightList);
    this.tokenManager.setCommission(this.state.commissionPercents);
    this.tokenManager.setAmount(this.state.amount);
    const {history} = this.props;
    history.push('calculator/result');
  }

}
