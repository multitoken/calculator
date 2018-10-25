import { Button, Col, Dropdown, Icon, Input, Layout, Menu, Popover, Row, Slider, Switch } from 'antd';
import { SliderValue } from 'antd/es/slider';
import * as QueryString from 'querystring';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import BlockContent from '../../components/block-content/BlockContent';
import { ChartType } from '../../components/charts/AbstractChart';
import { BalancesCapChart } from '../../components/charts/BalancesCapChart';
import { HistoryChart } from '../../components/charts/HistoryChart';
import { WeightChart } from '../../components/charts/WeightChart';
import { CoinsProportions } from '../../components/coins-proportions/CoinsProportions';
import { ConfigurationBlock } from '../../components/config-block/ConfigurationBlock';
import { LoadingDialog } from '../../components/dialogs/LoadingDialog';
import { MessageDialog } from '../../components/dialogs/MessageDialog';
import { ProgressDialog } from '../../components/dialogs/ProgressDialog';
import { TokenWeightDialog } from '../../components/dialogs/TokenWeightDialog';
import { TokenWeightList } from '../../components/lists/weight/TokenWeightList';
import PageHeader from '../../components/page-header/PageHeader';
import { StatisticItem } from '../../components/statistic-item/StatisticItem';
import { CoinItemEntity } from '../../entities/CoinItemEntity';
import { lazyInject, Services } from '../../Injections';
import { AnalyticsManager } from '../../manager/analytics/AnalyticsManager';
import { ExecutorType } from '../../manager/multitoken/executors/TimeLineExecutor';
import { PortfolioManager } from '../../manager/multitoken/PortfolioManager';
import { TokenType } from '../../manager/multitoken/PortfolioManagerImpl';
import { ProgressListener } from '../../manager/multitoken/ProgressListener';
import { RebalanceResult } from '../../manager/multitoken/RebalanceResult';
import { Portfolio } from '../../repository/models/Portfolio';
import { RebalanceHistory } from '../../repository/models/RebalanceHistory';
import { RebalanceValues } from '../../repository/models/RebalanceValues';
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
  calculateMaxDateIndex: number;
  calculateRangeDateIndex: SliderValue;
  changeWeightMinDates: [number, number];
  coins: CoinItemEntity[];
  emailForSaveResult: string;
  isEditMode: boolean;
  preparedHistoryData: boolean;
  professionalMode: boolean;
  progressPercents: number;
  proportionList: TokenProportion[];
  showCalculationProgress: boolean;
  showMessageDialog: boolean;
  selectedRebalanceType: string;
  showPopoverSave: boolean;
  tokenDialogOpen: boolean;
  tokenLatestWeights: Map<string, number>;
  tokenNames: Map<string, boolean>;
  tokensDate: number[];
  tokensHistory: Map<string, TokenPriceHistory[]>;
  tokensWeightEditItem: TokenWeight | undefined;
  tokensWeightList: TokenWeight[];
}

export default class CalculatorPage extends React.Component<Props, State> implements ProgressListener {

  private static readonly REBALANCE_TYPES: Map<TokenType, string> = new Map([
    [TokenType.PERIOD_REBALANCE, 'Period rebalance'],
    [TokenType.DIFF_PERCENT_REBALANCE, 'Diff percent rebalance'],
    [TokenType.AUTO_REBALANCE, 'Auto rebalance'],
    [TokenType.ADAPTIVE_PERCENT_EXCHANGER, 'Auto rebalance with dynamic exchange'],
    [TokenType.FIX_PROPORTIONS, 'Fix proportions'],
    [TokenType.MANUAL_REBALANCE, 'Manual rebalance']
  ]);

  @lazyInject(Services.PORTFOLIO_MANAGER as string)
  private portfolioManager: PortfolioManager;
  @lazyInject(Services.ANALYTICS_MANAGER as string)
  private analyticsManager: AnalyticsManager;

  constructor(props: Props) {
    super(props);

    this.portfolioManager.subscribeToProgress(this);

    this.portfolioManager.setTokenType(TokenType.DIFF_PERCENT_REBALANCE);

    this.state = {
      calculateMaxDateIndex: this.portfolioManager.getMaxCalculationIndex() - 1,
      calculateRangeDateIndex: this.portfolioManager.getCalculationDateIndex(),
      changeWeightMinDates: this.portfolioManager.getCalculationDateIndex() as [number, number],
      coins: [],
      emailForSaveResult: '',
      isEditMode: true,
      preparedHistoryData: true,
      professionalMode: false,
      progressPercents: 0,
      proportionList: [],
      selectedRebalanceType: CalculatorPage.REBALANCE_TYPES.get(this.portfolioManager.getTokenType()) || 'undefined',
      showCalculationProgress: false,
      showMessageDialog: false,
      showPopoverSave: false,
      tokenDialogOpen: false,
      tokenLatestWeights: new Map(),
      tokenNames: new Map(),
      tokensDate: [],
      tokensHistory: new Map(),
      tokensWeightEditItem: undefined,
      tokensWeightList: [],
    };
    this.analyticsManager.trackPage('/calculator/configurator');
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.analyticsManager.trackException(error);
  }

  public componentDidMount(): void {
    const {email, id} = QueryString.parse(this.props.location.search.replace('?', ''));

    if (email && id) {
      this.setState({preparedHistoryData: false});

      this.loadByEmailAndId(email as string, Number(id))
        .then(() => {
          this.setState({preparedHistoryData: true});
          console.log('load by query finished');
        });

      return;

    } else if (this.portfolioManager.getMaxCalculationIndex() <= 0) {
      this.loadExample().then(() => {
        console.log('load example finished');
      });
      return;
    }

    this.portfolioManager
      .getAvailableTokens()
      .then(this.onSyncTokens.bind(this))
      .catch(reason => {
        this.analyticsManager.trackException(reason);
        console.log(reason);
        alert(reason.message);
      });
  }

  public render() {
    const rebalanceResult: RebalanceResult = this.portfolioManager.getRebalanceResult();
    const hasRebalance: boolean = rebalanceResult.getRebalanceHistory().rebalanceValues.length > 0;

    return (
      <Layout>
        <PageHeader/>
        <div className="CalculatorPage__content">
          <div className="CalculatorPage__content__title">Token history price $:</div>
          <div>
            <div className="CalculatorPage__content-left">
              <BlockContent className="CalculatorPage__content__block-left">
                <BalancesCapChart
                  showRebalanceCap={true}
                  isDebugMode={false}
                  applyScale={true}
                  aspect={1.7}
                  data={rebalanceResult.getRebalanceHistory().rebalanceValues}
                  colors={TokensHelper.COLORS}
                  showRange={false}
                  showLegendCheckBox={true}
                />
              </BlockContent>
            </div>
            <div className="CalculatorPage__content_right">
              <div className="CalculatorPage__content_right-top">
                <StatisticItem
                  name={RebalanceHistory.MULTITOKEN_NAME_REBALANCE}
                  compareCap={hasRebalance ? rebalanceResult.capBtc() : '0'}
                  cap={hasRebalance ? rebalanceResult.capWithRebalance() : '0'}
                  roi={hasRebalance ? rebalanceResult.roiYearWithRebalance() : '0'}
                />
              </div>
              <div className="CalculatorPage__content_right-bottom">
                <StatisticItem
                  name={RebalanceHistory.BITCOIN_NAME}
                  compareCap={hasRebalance ? rebalanceResult.capWithRebalance() : '0'}
                  cap={hasRebalance ? rebalanceResult.capBtc() : '0'}
                  roi={hasRebalance ? rebalanceResult.profitPercentYearBtc() : '0'}
                />
              </div>
            </div>
          </div>
          <Row>
            <Col span={8}>
              <div className="CalculatorPage__content__title">Portfolio:</div>
            </Col>
            {this.prepareChangeButtons()}
          </Row>
          <div>
            <CoinsProportions
              coins={this.getCoins()}
              disabled={this.state.tokensWeightList.length > 0}
              isEditMode={this.state.isEditMode}
              maxWeight={10}
              onChangeProportion={
                (name: string, value: number, position: number) => this.onChangeProportion(name, value, position)
              }
            />
          </div>
          {this.prepareRebalanceMethods()}
          {this.prepareConfiguration()}
          {this.prepareFinishButtons()}
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

        <ProgressDialog
          openDialog={this.state.showCalculationProgress && this.state.preparedHistoryData}
          percentProgress={this.state.progressPercents}
        />

        <MessageDialog openDialog={this.state.showMessageDialog}/>

        <LoadingDialog
          openDialog={!this.state.preparedHistoryData}
          message={'Please wait. We prepare historical data of coins'}
        />

      </Layout>
    );
  }

  public onProgress(percents: number): void {
    if (!this.state.showCalculationProgress) {
      this.setState({showCalculationProgress: true});
    }

    this.setState({progressPercents: percents});
  }

  private async loadByEmailAndId(email: string, id: number): Promise<void> {
    try {
      await this.portfolioManager.loadPortfolio(email, id);
      await this.applyLoadedPortfolio();
      this.analyticsManager.trackPage('/calculator/result');

    } catch (error) {
      console.error(error);
      this.analyticsManager.trackException(error);
      alert('Something went wrong!');
      window.location.replace('/tokens');
    }
  }

  private async loadExample(): Promise<void> {
    this.setState({preparedHistoryData: false});

    await this.portfolioManager.setupTokens(['Binance', 'Cardano', 'EOS', 'Tron']);
    this.portfolioManager.setTokenType(TokenType.DIFF_PERCENT_REBALANCE);
    this.portfolioManager.setRebalanceDiffPercent(45);
    const availableTokens: Map<string, string> = await this.portfolioManager.getAvailableTokens();
    await this.onSyncTokens(availableTokens);

    const proportions: TokenProportion[] = this.portfolioManager
      .getTokens()
      .map(name => new TokenProportion(name, 10, 1, 10));

    this.portfolioManager.changeProportions(proportions);

    this.setState({preparedHistoryData: true});

    await this.applyLoadedPortfolio();
    this.analyticsManager.trackPage('/calculator/result');
  }

  private async applyLoadedPortfolio(): Promise<void> {
    try {
      this.setState({preparedHistoryData: true});

      await this.portfolioManager.calculateInitialAmounts();
      await this.portfolioManager.calculate();
      const firstTokenName: string = Array.from(this.portfolioManager.getPriceHistory().keys())[0];
      const history: TokenPriceHistory[] = this.portfolioManager.getPriceHistory().get(firstTokenName) || [];

      this.setState({
        calculateMaxDateIndex: this.portfolioManager.getMaxCalculationIndex() - 1,
        calculateRangeDateIndex: this.portfolioManager.getCalculationDateIndex(),
        changeWeightMinDates: this.portfolioManager.getCalculationDateIndex() as [number, number],
        isEditMode: false,
        proportionList: this.portfolioManager.getProportions(),
        selectedRebalanceType: CalculatorPage.REBALANCE_TYPES.get(this.portfolioManager.getTokenType()) || 'undefined',
        showCalculationProgress: false,
        tokensDate: history.map(value => value.time),
        tokensHistory: this.portfolioManager.getPriceHistory(),
        tokensWeightList: this.portfolioManager.getRebalanceWeights(),
      });
    } catch (error) {
      console.error(error);
      this.analyticsManager.trackException(error);
      alert('Something went wrong!');
      window.location.replace('/tokens');
    }
  }

  private onChangeProportion(name: string, value: number, position: number) {
    const result: TokenProportion[] = this.state.proportionList.slice(0, this.state.proportionList.length);
    result[position].weight = value;
    this.portfolioManager.changeProportions(result);
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

    this.onCalculateClick();
  }

  private prepareChangeButtons() {
    if (!this.state.isEditMode) {
      return null;
    }

    return (
      <span className="CalculatorPage__content__edit">
      <Col span={8}>
        <div className="CalculatorPage__content__edit__switch-block">
          <span className="CalculatorPage__content__edit__switch-block__text">Professional mode</span>
          <Switch
            checked={this.state.professionalMode}
            onChange={checked => this.setState({professionalMode: checked})}
          />
        </div>
      </Col>
      <Col span={8}>
        <span
          className="CalculatorPage__content__edit__button-change"
          onClick={() => this.onChangeCoinsClick()}
        >
          Change coins
        </span>
      </Col>
        </span>
    );
  }

  private prepareRebalanceMethods(): React.ReactNode {
    if (!this.state.isEditMode || !this.state.professionalMode) {
      return null;
    }

    return (
      <Row className="CalculatorPage__content__prof-mode">
        <Col span={8}>
          <div className="CalculatorPage__content__prof-mode__title">Professional mode:</div>
        </Col>
        <Col span={16} className="CalculatorPage__content__prof-mode__menu">
          <span className="CalculatorPage__content__prof-mode__menu__title">Method:</span>
          <Dropdown overlay={this.getAvailableRebalanceMenu()} trigger={['click']}>
            <span className="CalculatorPage__content__prof-mode__menu__name">
            {this.state.selectedRebalanceType}
              <Icon className="CalculatorPage__content__prof-mode__menu__arrow" type="down"/>
            </span>
          </Dropdown>
        </Col>
      </Row>
    );
  }

  private getAvailableRebalanceMenu(): React.ReactNode {
    const items: string[] = Array.from(CalculatorPage.REBALANCE_TYPES.values());
    return (
      <Menu onClick={(e: any) => {
        CalculatorPage.REBALANCE_TYPES.forEach((value, key) => {
          if (value === e.key) {
            this.portfolioManager.setTokenType(key);
            this.setState({selectedRebalanceType: e.key});
            return;
          }
        });
      }}>
        {items.map((item) => <Menu.Item key={item}>{item}</Menu.Item>)}
      </Menu>
    );
  }

  private getCoins(): CoinItemEntity[] {
    const history: RebalanceHistory = this.portfolioManager.getRebalanceResult().getRebalanceHistory();
    const prices: Map<string, TokenPriceHistory[]> = this.portfolioManager.getPriceHistory();

    const rebalanceValues: RebalanceValues[] = history.rebalanceValues;

    let tokensAmount: Map<string, number>;
    let tokensCount: Map<string, number>;

    if (rebalanceValues.length > 0 && !this.state.isEditMode) {
      tokensAmount = rebalanceValues[rebalanceValues.length - 1]
        .multitokenTokensCap.get(RebalanceHistory.MULTITOKEN_NAME_REBALANCE) || new Map();
      tokensCount = rebalanceValues[rebalanceValues.length - 1]
        .multitokenTokensCount.get(RebalanceHistory.MULTITOKEN_NAME_REBALANCE) || new Map();

    } else {
      tokensAmount = this.portfolioManager.calculateInitialAmounts();
      tokensAmount.forEach((value, key) => {
        const price: TokenPriceHistory[] = prices.get(key) || [];

        tokensAmount.set(key, value * price[this.state.calculateRangeDateIndex[0]].value);
      });
      tokensCount = tokensAmount;
    }

    const counts: number[] = Array.from(tokensAmount.values());

    return this.state.proportionList.map(proportion => {
      const price: TokenPriceHistory[] = prices.get(proportion.name) || [new TokenPriceHistory()];
      const minIndex: number = Math.max(this.state.calculateRangeDateIndex[0], 0);
      const maxIndex: number = Math.min(this.state.calculateRangeDateIndex[1], price.length - 1);
      const diffPercents: number = (price[maxIndex].value - price[minIndex].value) / price[minIndex].value * 100;

      return new CoinItemEntity(
        proportion.name,
        proportion.weight,
        TokensHelper.getSymbol(proportion.name),
        Number(price[maxIndex].value.toFixed(2)),
        this.calculateProportionPercents(counts, tokensAmount.get(proportion.name) || 0),
        tokensCount.get(proportion.name) || 0,
        Number(diffPercents.toFixed(2))
      );
    });
  }

  private calculateProportionPercents(counts: number[], value: number): number {
    let max = 0;
    for (const count of counts) {
      max += count;
    }

    return Number((value / max * 100).toFixed(1));
  }

  private onChangeCoinsClick(): void {
    const {history} = this.props;
    history.push('tokens');
  }

  private prepareConfiguration(): React.ReactNode {
    if (!this.state.isEditMode || !this.state.professionalMode) {
      return null;
    }

    const isManualRebalance: boolean = this.portfolioManager.getTokenType() !== TokenType.MANUAL_REBALANCE;

    return (
      <div>
        <ConfigurationBlock
          amount={this.portfolioManager.getAmount()}
          exchangeAmount={this.portfolioManager.getExchangeAmount()}
          commission={this.portfolioManager.getCommission()}
          diffPercentExchange={this.portfolioManager.getRebalanceDiffPercent()}
          rebalancePeriod={this.portfolioManager.getRebalancePeriod()}

          exchangeAmountVisibility={this.exchangeAmountVisibility()}
          commissionVisibility={this.commissionPercentsVisibility()}
          diffPercentExchangeVisibility={this.diffPercentPercentsRebalanceVisibility()}
          rebalancePeriodVisibility={this.rebalancePeriodVisibility()}

          onAmountChange={(amount: number) => this.onAmountChange(amount)}
          onExchangeAmountChange={(exchangeAmount: number) => this.onExchangeAmountChange(exchangeAmount)}
          onCommissionChange={(commission: number) => this.onCommissionChange(commission)}
          onDiffPercentExchangeChange={(percent: number) => this.onDiffPercentExchangeChange(percent)}
          onPeriodChange={(period: number) => this.onPeriodChange(period)}
        />

        <BlockContent>
          <div className="CalculatorPage__content__prof-mode__period">
            <div className="CalculatorPage__content__prof-mode__period__title">
              Period:
            </div>
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
              onAfterChange={(value: SliderValue) => this.onDateRangeChange(value)}
            />
          </div>

          <div className="CalculatorPage__content__prof-mode__history">
            <div className="CalculatorPage__content__prof-mode__history__title">
              Tokens history price $:
            </div>
            <HistoryChart
              timeStep={this.portfolioManager.getStepSec()}
              data={this.state.tokensHistory}
              colors={TokensHelper.COLORS}
              legendColumnCount={4}
              start={this.state.calculateRangeDateIndex[0]}
              end={this.state.calculateRangeDateIndex[1]}
              applyScale={true}
              showRange={false}
              showLegendCheckBox={true}
            />
          </div>

          <div
            className="CalculatorPage__content__prof-mode__manual-rebalance"
            style={
              {
                position: isManualRebalance ? 'fixed' : 'relative',
                visibility: isManualRebalance ? 'hidden' : 'visible',
              }
            }
          >
            <div
              className="CalculatorPage__content__prof-mode__manual-rebalance__title"
            >
              Change coins weights:
            </div>
            <WeightChart
              applyScale={false}
              data={this.state.tokensWeightList}
              colors={TokensHelper.COLORS}
              initialDate={this.state.tokensDate[this.portfolioManager.getCalculationDateIndex()[0]]}
              initialState={this.state.proportionList}
              finishDate={this.state.tokensDate[this.portfolioManager.getCalculationDateIndex()[1]]}
              showRange={false}
              aspect={5.5}
              type={ChartType.BAR}
            />

            <div
              className="CalculatorPage__content__prof-mode__manual-rebalance__list"
            >
              <TokenWeightList
                disabled={this.portfolioManager.getTokenType() !== TokenType.MANUAL_REBALANCE}
                maxHeight="200px"
                onAddClick={() => this.onChangeTokenExchangeWeightClick(-1)}
                onEditClick={(model, position) => this.onChangeTokenExchangeWeightClick(position, model)}
                onDeleteClick={(model, position) => this.onDeleteTokenWeightClick(position)}
                data={this.state.tokensWeightList}
              />
            </div>
          </div>

        </BlockContent>
      </div>
    );
  }

  private onAmountChange(amount: number): void {
    this.portfolioManager.setAmount(amount);
    this.setState({});
  }

  private onExchangeAmountChange(exchangeAmount: number): void {
    this.portfolioManager.setExchangeAmount(exchangeAmount);
    this.setState({});
  }

  private onCommissionChange(commission: number): void {
    this.portfolioManager.setCommission(commission);
    this.setState({});
  }

  private onPeriodChange(period: number): void {
    this.portfolioManager.setRebalancePeriod(period);
    this.setState({});
  }

  private onDiffPercentExchangeChange(percents: number): void {
    this.portfolioManager.setRebalanceDiffPercent(percents);
    this.setState({});
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

  private onDeleteTokenWeightClick(position: number): void {
    const list: TokenWeight [] = this.state.tokensWeightList.slice(0, this.state.tokensWeightList.length);

    this.analyticsManager.trackEvent('button', 'click', 'weights-delete-item');
    list.splice(position, 1);

    this.setState({tokensWeightList: list});
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
      : this.portfolioManager.getCalculationDateIndex()[0];

    this.analyticsManager.trackEvent(
      'button',
      'click',
      'change-weight-' + (model ? 'edit' : 'add')
    );

    this.setState({
      changeWeightMinDates:
        [model ? model.index : minDateIndex + 1, this.portfolioManager.getCalculationDateIndex()[1]],
      tokenDialogOpen: true,
      tokenLatestWeights: latestTokensWeight,
      tokensWeightEditItem: model,
    });
  }

  private inputRangeTrackValue(value: number): string {
    if (value > -1 && value <= this.state.tokensDate.length - 1) {
      return DateUtils.toFormat(this.state.tokensDate[value], DateUtils.DATE_FORMAT_SHORT);
    } else {
      return 'wrong date';
    }
  }

  private onDateRangeChange(value: SliderValue): void {
    this.analyticsManager.trackEvent('slider', 'change-date-range', '');
    // this.setState({historyChartRangeDateIndex: this.state.calculateRangeDateIndex});
    this.portfolioManager.changeCalculationDate(value[0], value[1]);
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

  private prepareFinishButtons(): React.ReactNode {
    if (this.state.isEditMode) {
      return (
        <div className="CalculatorPage__content__button-apply">
          <Button type="primary" onClick={() => this.onCalculateClick()}>Apply</Button>
        </div>
      );
    }

    return (
      <div className="CalculatorPage__content__buttons-finish">
        <Popover
          content={this.prepareContentSaveResult()}
          trigger="click"
          visible={this.state.showPopoverSave}
          onVisibleChange={() => this.setState({showPopoverSave: true})}
        >
          <Button
            className="CalculatorPage__content__buttons-finish__save-result"
            type="primary"
          >
            Save Result
          </Button>
        </Popover>

        <Button
          type="primary"
          onClick={() => this.onEditClick()}
        >
          Edit
        </Button>
      </div>
    );
  }

  private onSavePortfolioClick(): void {
    const portfolio: Portfolio = this.portfolioManager.getRebalanceResult().getPortfolio();
    portfolio.email = String(this.state.emailForSaveResult);

    this.setState({showPopoverSave: false});
    this.analyticsManager.trackEvent(
      'button',
      'click',
      'save-result'
    );

    this.portfolioManager.savePortfolio(portfolio)
      .then(() => alert('Successful saved'))
      .catch((reason) => {
        console.error(reason);
        this.analyticsManager.trackException(reason);
        alert('Something went wrong!');
      });
  }

  private onEditClick(): void {
    this.setState({isEditMode: true});
    this.analyticsManager.trackPage('/calculator/configurator');
  }

  private onCalculateClick(): void {
    this.analyticsManager.trackEvent('button', 'click', 'configuration-to-calculate');
    this.portfolioManager.changeProportions(this.state.proportionList);
    this.portfolioManager.setRebalanceWeights(this.state.tokensWeightList);

    this.setState({showCalculationProgress: true});
    this.portfolioManager.calculateInitialAmounts();
    this.portfolioManager.calculate()
      .then((result) => {

        this.analyticsManager.trackPage('/calculator/result');
        this.setState({
          isEditMode: false,
          showCalculationProgress: false,
        });
      }).catch(error => this.analyticsManager.trackException(error));
  }

  private prepareContentSaveResult(): React.ReactNode {
    return (
      <div>
        <div>
          <Input
            onPressEnter={() => {
              if (this.validateEmail(String(this.state.emailForSaveResult))) {
                this.onSavePortfolioClick();
              }
            }}
            value={this.state.emailForSaveResult}
            onChange={(e) => this.setState({emailForSaveResult: e.target.value})}
            placeholder="Email"
            style={{width: '100%'}}
          />

        </div>
        <span
          className="button-simple"
          onClick={() => {
            this.setState({showPopoverSave: false});
          }}>
          Cancel
        </span>
        <span
          className={`button-simple${this.validateEmail(String(this.state.emailForSaveResult)) ? '' : '-disabled'}`}
          onClick={() => this.onSavePortfolioClick()}>
          Save
        </span>
      </div>
    );
  }

  private validateEmail(email: string): boolean {
    // tslint:disable:max-line-length
    const reg: RegExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

    return reg.test(String(email).toLowerCase());
  }

}
