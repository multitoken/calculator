import * as Sentry from '@sentry/browser';
import { Button, Layout, Select, Slider } from 'antd';
import { SliderValue } from 'antd/es/slider';
import * as React from 'react';
import NumberFormat from 'react-number-format';
import { RouteComponentProps } from 'react-router';
import { ChartType } from '../../components/charts/AbstractChart';
import { HistoryChart } from '../../components/charts/HistoryChart';
import { WeightChart } from '../../components/charts/WeightChart';
import { TokenWeightDialog } from '../../components/dialogs/TokenWeightDialog';
import { TokensProportionsList } from '../../components/lists/proportion/TokensProportionsList';
import { TokenWeightList } from '../../components/lists/weight/TokenWeightList';
import PageContent from '../../components/page-content/PageContent';
import PageHeader from '../../components/page-header/PageHeader';
import { lazyInject, Services } from '../../Injections';
import { AnalyticsManager } from '../../manager/analytics/AnalyticsManager';
import { ExecutorType } from '../../manager/multitoken/executors/TimeLineExecutor';
import { PortfolioManager } from '../../manager/multitoken/PortfolioManager';
import { TokenType } from '../../manager/multitoken/PortfolioManagerImpl';
import { Token } from '../../repository/models/Token';
import { TokenPriceHistory } from '../../repository/models/TokenPriceHistory';
import { TokenProportion } from '../../repository/models/TokenProportion';
import { TokenWeight } from '../../repository/models/TokenWeight';
import { DateUtils } from '../../utils/DateUtils';
import { TokensHelper } from '../../utils/TokensHelper';
import './ConfiguratorPage.less';

const Option = Select.Option;

interface Props extends RouteComponentProps<{}> {
}

interface State {
  amount: number;
  calculateMaxDateIndex: number;
  calculateRangeDateIndex: SliderValue;
  changeWeightMinDates: [number, number];
  commissionPercents: number;
  diffPercentRebalance: number;
  exchangeAmount: number;
  historyChartRangeDateIndex: SliderValue;
  proportionList: TokenProportion[];
  rebalancePeriod: RebalancePeriodType;
  tokenDialogOpen: boolean;
  tokenLatestWeights: Map<string, number>;
  tokenNames: Map<string, boolean>;
  tokensDate: number[];
  tokensHistory: Map<string, TokenPriceHistory[]>;
  tokensWeightEditItem: TokenWeight | undefined;
  tokensWeightList: TokenWeight[];
}

export enum RebalancePeriodType {
  HOUR = 'HOUR',
  DAY = 'DAY',
  WEEK = 'WEEK',
  SOME_CUSTOM = 'SOME_CUSTOM',
}

export default class ConfiguratorPage extends React.Component<Props, State> {

  @lazyInject(Services.PORTFOLIO_MANAGER)
  private portfolioManager: PortfolioManager;
  @lazyInject(Services.ANALYTICS_MANAGER)
  private analyticsManager: AnalyticsManager;

  constructor(props: Props) {
    super(props);

    this.analyticsManager.trackPage('/configuration-page');

    this.state = {
      amount: this.portfolioManager.getAmount(),
      calculateMaxDateIndex: this.portfolioManager.getMaxCalculationIndex() - 1,
      calculateRangeDateIndex: this.portfolioManager.getCalculationDateIndex(),
      changeWeightMinDates: this.portfolioManager.getCalculationDateIndex() as [number, number],
      commissionPercents: this.portfolioManager.getCommission(),
      diffPercentRebalance: this.portfolioManager.getRebalanceDiffPercent(),
      exchangeAmount: this.portfolioManager.getExchangeAmount(),
      historyChartRangeDateIndex: this.portfolioManager.getCalculationDateIndex(),
      proportionList: [],
      rebalancePeriod: this.getRebalanceTypeByPeriod(this.portfolioManager.getRebalancePeriod()),
      tokenDialogOpen: false,
      tokenLatestWeights: new Map(),
      tokenNames: new Map(),
      tokensDate: [],
      tokensHistory: new Map(),
      tokensWeightEditItem: undefined,
      tokensWeightList: this.portfolioManager.getRebalanceWeights(),
    };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    Sentry.captureException(error);
  }

  public componentDidMount(): void {
    if (this.portfolioManager.getPriceHistory().size === 0) {
      // Redirect to root
      window.location.replace('/calculator');
    }

    this.portfolioManager
      .getAvailableTokens()
      .then(this.onSyncTokens.bind(this))
      .catch(reason => {
        Sentry.captureException(reason);
        console.log(reason);
        alert(reason.message);
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
        <div className="ConfiguratorPage__content">
          <PageContent className="ConfiguratorPage__content-left">
            <div className="ConfiguratorPage__options-title">Amount of money:&nbsp;</div>
            <NumberFormat
              value={this.state.amount}
              thousandSeparator={true}
              prefix={'$ '}
              allowNegative={false}
              onValueChange={value => this.onAmountChange(value.floatValue)}
            />
            <div style={{display: this.rebalancePeriodVisibility() ? 'block' : 'none'}}>
              <div className="ConfiguratorPage__options-title">Rebalance every:&nbsp;</div>
              <Select
                onChange={value => this.onRebalancePeriodChange(RebalancePeriodType[value.toString()])}
                value={this.state.rebalancePeriod}
              >
                {this.preparePeriodValues()}
              </Select>
            </div>

            <div style={{display: this.exchangeAmountVisibility() ? 'block' : 'none'}}>
              <div className="ConfiguratorPage__options-title">Exchange Amount / day:&nbsp;</div>
              <NumberFormat
                value={this.state.exchangeAmount}
                thousandSeparator={true}
                prefix={'$ '}
                allowNegative={false}
                onValueChange={(value) => {
                  this.setState({exchangeAmount: Math.min(100000000, value.floatValue)});
                  this.analyticsManager.trackEvent(
                    'input',
                    'exchange-amount',
                    value.toLocaleString()
                  );
                }}
              />
            </div>

            <div style={{display: this.commissionPercentsVisibility() ? 'block' : 'none'}}>
              <div className="ConfiguratorPage__options-title">
                Commission percents:&nbsp;
              </div>
              <NumberFormat
                value={this.state.commissionPercents}
                thousandSeparator={true}
                suffix={'%'}
                allowNegative={false}
                onValueChange={value => this.onCommissionChange(value.floatValue)}
              />

            </div>
            <div style={{display: this.diffPercentPercentsRebalanceVisibility() ? 'block' : 'none'}}>
              <div className="ConfiguratorPage__options-title">
                Diff percent rebalance:&nbsp;
              </div>
              <NumberFormat
                value={this.state.diffPercentRebalance}
                thousandSeparator={true}
                suffix={'%'}
                allowNegative={false}
                onValueChange={(value) => this.onRebalanceDiffPercentChange(value.floatValue)}
              />
            </div>
            <div>
              <div className="ConfiguratorPage__options-title">
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
                    this.analyticsManager.trackEvent('slider', 'change-date-range', '');
                    this.setState({historyChartRangeDateIndex: this.state.calculateRangeDateIndex});
                    this.portfolioManager.changeCalculationDate(value[0], value[1]);
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
          <div className="ConfiguratorPage__content-right-top">
            <PageContent className="ConfiguratorPage__content-weights">
              <div
                className="ConfiguratorPage__content-rebalance-blocked"
                style={{
                  display: this.portfolioManager.getTokenType() !== TokenType.MANUAL_REBALANCE ? 'block' : 'none',
                }}
              >
                Disabled in selected type of multitoken.
              </div>
              <div
                className="ConfiguratorPage__options-title"
                style={{opacity: this.portfolioManager.getTokenType() !== TokenType.MANUAL_REBALANCE ? 0.3 : 1}}
              >
                Change token weight:
              </div>
              <div
                className="ConfiguratorPage__result-chart"
                style={{opacity: this.portfolioManager.getTokenType() !== TokenType.MANUAL_REBALANCE ? 0.3 : 1}}
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
                    aspect={3.5}
                    type={ChartType.BAR}
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
              <div className="ConfiguratorPage__content-calculate">
                <Button
                  type="primary"
                  onClick={() => this.onCalculateClick()}
                >
                  Calculate
                </Button>
                <span className="m-2"/>
                <span
                  className="ConfiguratorPage__content-button-start"
                  onClick={e => {
                    this.props.history.push('/');
                    this.analyticsManager.trackEvent('button', 'click', 'to-new');
                  }}
                >
                  Start new
                </span>
              </div>
            </PageContent>
            <PageContent className="ConfiguratorPage__content-bottom">
              <HistoryChart
                timeStep={this.portfolioManager.getStepSec()}
                data={this.state.tokensHistory}
                colors={TokensHelper.COLORS}
                legendColumnCount={3}
                start={this.state.historyChartRangeDateIndex[0]}
                end={this.state.historyChartRangeDateIndex[1]}
                applyScale={true}
                showRange={false}
                showLegendCheckBox={true}
              />
            </PageContent>
          </div>
        </div>

        <TokenWeightDialog
          onOkClick={(tokenWeight, oldModel) => this.onTokenDialogOkClick(tokenWeight, oldModel)}
          onCancel={() => this.setState({tokenDialogOpen: false})}
          openDialog={this.state.tokenDialogOpen}
          tokenWeights={this.state.tokenLatestWeights}
          editTokenWeights={this.state.tokensWeightEditItem}
          maxWeight={10}
          rangeDateIndex={this.state.changeWeightMinDates}
          tokenNames={Array.from(this.portfolioManager.getPriceHistory().keys())}
          dateList={this.state.tokensDate}
        />

      </Layout>
    );
  }

  private rebalancePeriodVisibility(): boolean {
    return this.portfolioManager
      .getExecutorsByTokenType()
      .indexOf(ExecutorType.PERIOD_REBALANCER) > -1;
  }

  private exchangeAmountVisibility(): boolean {
    return this.portfolioManager
      .getExecutorsByTokenType()
      .indexOf(ExecutorType.EXCHANGER) > -1;
  }

  private commissionPercentsVisibility(): boolean {
    const executors: string[] = this.portfolioManager.getExecutorsByTokenType();

    return executors.indexOf(ExecutorType.EXCHANGER) > -1 || executors.indexOf(ExecutorType.ARBITRAGEUR) > -1;
  }

  private diffPercentPercentsRebalanceVisibility(): boolean {
    return this.portfolioManager
      .getExecutorsByTokenType()
      .indexOf(ExecutorType.DIFF_PERCENT_REBALANCER) > -1;
  }

  private onRebalancePeriodChange(period: RebalancePeriodType): void {
    console.log('period', period);

    if (period === RebalancePeriodType.HOUR) {
      this.portfolioManager.setRebalancePeriod(3600);
    } else if (period === RebalancePeriodType.DAY) {
      this.portfolioManager.setRebalancePeriod(86400);
    } else if (period === RebalancePeriodType.WEEK) {
      this.portfolioManager.setRebalancePeriod(604800);
    }

    this.setState({rebalancePeriod: period});
  }

  private getRebalanceTypeByPeriod(seconds: number): RebalancePeriodType {
    if (seconds === 3600) {
      return RebalancePeriodType.HOUR;
    } else if (seconds === 86400) {
      return RebalancePeriodType.DAY;
    } else if (seconds === 604800) {
      return RebalancePeriodType.WEEK;
    }

    return RebalancePeriodType.SOME_CUSTOM;
  }

  private onRebalanceDiffPercentChange(value: number): void {
    let valueNumber = Math.max(0.01, Math.min(100, value)) || 0;
    valueNumber = isNaN(valueNumber) ? 0.01 : valueNumber;

    if (value > 0) {
      this.setState({diffPercentRebalance: valueNumber});
      this.portfolioManager.setRebalanceDiffPercent(valueNumber);
      this.analyticsManager.trackEvent('input', 'change-rebalance-diff-percent', valueNumber.toString());
    }
  }

  private preparePeriodValues(): React.ReactNode {
    const periods: string[] = [RebalancePeriodType.HOUR, RebalancePeriodType.DAY, RebalancePeriodType.WEEK];

    return periods.map(name => <Option key={name}>{name}</Option>);
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

    const weightList: TokenWeight[] = this.state.tokensWeightList;
    const minDateIndex: number = weightList.length > 0
      ? weightList[weightList.length - 1].index
      : this.state.calculateRangeDateIndex[0];

    this.analyticsManager.trackEvent(
      'button',
      'click',
      'change-weight-' + (model ? 'edit' : 'add')
    );

    this.setState({
      changeWeightMinDates: [model ? model.index : minDateIndex + 1, this.state.calculateRangeDateIndex[1]],
      tokenDialogOpen: true,
      tokenLatestWeights: latestTokensWeight,
      tokensWeightEditItem: model,
    });
  }

  private onDeleteTokenWeightClick(position: number): void {
    const list: TokenWeight [] = this.state.tokensWeightList.slice(0, this.state.tokensWeightList.length);

    this.analyticsManager.trackEvent('button', 'click', 'weights-delete-item');
    list.splice(position, 1);

    this.setState({tokensWeightList: list});
  }

  private onTokenDialogOkClick(model: TokenWeight, oldModel: TokenWeight | undefined) {
    this.analyticsManager.trackEvent(
      'button',
      'click',
      'weights-accept-item' + (oldModel === undefined ? 'add' : 'edit')
    );

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
    this.analyticsManager.trackEvent('slider', 'change-proportion', name);
  }

  private onSyncTokens(tokens: Map<string, string>) {
    const tokenItems: Map<string, boolean> = new Map();
    let proportions: TokenProportion[] = [];

    tokens.forEach((value, key) => tokenItems.set(key, false));

    if (this.portfolioManager.getProportions().length === 0) {
      this.portfolioManager.getPriceHistory().forEach((value, key) => {
        proportions.push(new TokenProportion(key, 10, 1, 10));
      });
    } else {
      proportions = this.portfolioManager.getProportions();
    }

    const firstTokenName: string = Array.from(this.portfolioManager.getPriceHistory().keys())[0];
    const history: TokenPriceHistory[] = this.portfolioManager.getPriceHistory().get(firstTokenName) || [];

    this.setState({tokensDate: history.map(value => value.time)});

    this.setState({
      proportionList: proportions,
      tokenNames: tokenItems,
      tokensHistory: this.portfolioManager.getPriceHistory(),
    });
  }

  private onAmountChange(value: number) {
    value = isNaN(value) ? 0 : value;

    if (value > 0) {
      this.setState({amount: Math.min(100000000, value)});
      this.analyticsManager.trackEvent('input', 'change-amount', value.toString());
    }
  }

  private onCommissionChange(value: number) {
    let valueNumber = Math.max(0.0, Math.min(99.99, Number(value)));
    valueNumber = isNaN(valueNumber) ? 0.0 : valueNumber;

    if (valueNumber > 0) {
      this.setState({commissionPercents: valueNumber});
      this.analyticsManager.trackEvent('input', 'change-commission', valueNumber.toString());
    }
  }

  private onCalculateClick() {
    this.analyticsManager.trackEvent('button', 'click', 'configuration-to-calculate');
    this.portfolioManager.setExchangeAmount(this.state.exchangeAmount || 0);
    this.portfolioManager.changeProportions(this.state.proportionList);

    this.portfolioManager.setRebalanceWeights(this.state.tokensWeightList);
    this.portfolioManager.setCommission(this.state.commissionPercents);
    this.portfolioManager.setAmount(this.state.amount);
    const {history} = this.props;
    history.push('calculator/result');
  }

}
