import { Button, DatePicker, Input, Layout, Popover, Tooltip } from 'antd';
import { SliderValue } from 'antd/es/slider';
import Modal from 'antd/lib/modal/Modal';
import * as moment from 'moment';
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
import { TokenWeightSimpleList } from '../../components/lists/weight-simple/TokenWeightSimpleList';
import { TokenWeightList } from '../../components/lists/weight/TokenWeightList';
import PageHeader from '../../components/page-header/PageHeader';
import { RebalanceTypes } from '../../components/rebalance-types/RebalanceTypes';
import { StatisticItem } from '../../components/statistic-item/StatisticItem';
import { CoinItemEntity } from '../../entities/CoinItemEntity';
import { RebalanceTypeItem } from '../../entities/RebalanceTypeItem';
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

import IcoInfo from '../../res/icons/ico_info.svg';
import IcoProfMode from '../../res/icons/ico_professional_mode.svg';
import { ScreenSizes, ScreenUtils } from '../../utils/ScreenUtils';
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

  private static readonly REBALANCE_TYPES: RebalanceTypeItem[] = [
    new RebalanceTypeItem(
      TokenType.PERIOD_REBALANCE,
      'Change the proportion of assets by time period after creating a multitoken.'
    ),
    new RebalanceTypeItem(TokenType.DIFF_PERCENT_REBALANCE, 'Change the proportion of assets by diff percent'),
    new RebalanceTypeItem(TokenType.AUTO_REBALANCE, 'Keeps the specified ratio of portfolio proportions.'),
    new RebalanceTypeItem(
      TokenType.ADAPTIVE_PERCENT_EXCHANGER,
      'Keeps the specified ratio of portfolio proportions. With adaptive exchange proportions'
    ),
    new RebalanceTypeItem(TokenType.FIX_PROPORTIONS, 'The number of tokens in the portfolio will be constant.'),
    new RebalanceTypeItem(
      TokenType.MANUAL_REBALANCE,
      'Change the proportion of assets manually after creating a multitoken.'
    )
  ];

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
      this.onChangeCoinsClick();
      return;
    }

    this.portfolioManager
      .getAvailableTokens()
      .then(this.onSyncTokens.bind(this))
      .then(() => this.onCalculateClick())
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
          <div className="CalculatorPage__content__title">Coins history price $:</div>
          <div className="CalculatorPage__content-main">
            <div className="CalculatorPage__content-left">
              <BlockContent className="CalculatorPage__content__block-left">
                <BalancesCapChart
                  showRebalanceCap={true}
                  isDebugMode={false}
                  applyScale={true}
                  hideLineScale={ScreenUtils.viewPortWidth() < ScreenSizes.MD}
                  aspect={ScreenUtils.viewPortWidth() <= ScreenSizes.MD ? 1.5 : 1.7}
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
                  helperItem={(
                    <Tooltip title={this.getTooltipInfo()}>
                      <img src={IcoInfo} alt={'i'} className="CalculatorPage__content-info"/>
                    </Tooltip>
                  )}
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
          <div className="CalculatorPage__content-second">
            <div className="CalculatorPage__content__title-portfolio">Portfolio:</div>
            {this.prepareChangeButtons()}
          </div>
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
          {this.prepareChangeCoinsButton()}
          {this.prepareRebalanceMethods()}
          {this.prepareConfiguration()}
          {this.prepareFinishButtons()}
          {this.prepareBlockProfessionalMode()}
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

        <MessageDialog
          openDialog={this.state.showMessageDialog}
          title="Please wait few seconds."
          message="We setup data in charts..."
        />

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
  }

  private prepareChangeButtons() {
    if (!this.state.isEditMode) {
      return null;
    }

    return (
      <span className="CalculatorPage__content__edit">
      <div className="CalculatorPage__content__edit__button-change__block">
        <span
          className="CalculatorPage__content__edit__button-change"
          onClick={() => this.onChangeCoinsClick()}
        >
          Change coins
        </span>
      </div>
      </span>
    );
  }

  private prepareBlockProfessionalMode(): React.ReactNode {
    if (!this.state.isEditMode || this.state.professionalMode) {
      return null;
    }

    return (
      <BlockContent className="CalculatorPage__content__prof-mode-desc__block">
        <img className="CalculatorPage__content__prof-mode-desc__icon" alt="Img" src={IcoProfMode}/>
        <div className="CalculatorPage__content__prof-mode-desc__text">
          The professional method is designed for more advanced users,
          investors and people who understand the crypto industry
        </div>
        <Button
          className="CalculatorPage__content__prof-mode-desc__button"
          type="primary"
          onClick={() => this.setState({professionalMode: true})}
        >
          Activate
        </Button>
      </BlockContent>
    );
  }

  private prepareChangeCoinsButton(): React.ReactNode {
    if (!this.state.isEditMode) {
      return null;
    }

    return (
      <div className="CalculatorPage__content__prof-mode__button-change-small">
        <Button type="primary" onClick={() => this.onChangeCoinsClick()}>Change coins</Button>
      </div>
    );
  }

  private prepareRebalanceMethods(): React.ReactNode {
    if (!this.state.isEditMode || !this.state.professionalMode) {
      return null;
    }

    return (
      <div className="CalculatorPage__content__prof-mode">
        <div className="CalculatorPage__content__prof-mode__title">Professional mode:</div>
      </div>
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
        Number((tokensCount.get(proportion.name) || 0).toFixed(5)),
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
    history.push('/');
  }

  private prepareConfiguration(): React.ReactNode {
    if (!this.state.isEditMode || !this.state.professionalMode) {
      return null;
    }

    const isManualRebalance: boolean = this.portfolioManager.getTokenType() !== TokenType.MANUAL_REBALANCE;

    return (
      <div>
        <BlockContent className="CalculatorPage__content__prof-mode__method">
          <div className="CalculatorPage__content__prof-mode__method__block">
            <div className="CalculatorPage__content__prof-mode__method__title">
              Balancing method:
            </div>
            <div
              className="CalculatorPage__content__prof-mode__method__helper"
              onClick={() => this.rebalaningInfoDialog()}
            >
              <img
                className="CalculatorPage__content__prof-mode__method__helper__icon"
                src={IcoInfo} alt={'i'}
              />
            </div>
          </div>
          <div className="CalculatorPage__content__prof-mode__method__items">
            <RebalanceTypes
              items={CalculatorPage.REBALANCE_TYPES}
              defaultSelection={this.getSelectedRebalanceType()}
              onItemChange={(item) => this.onRebalanceChange(item)}
            />
          </div>
        </BlockContent>

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
            <div className="CalculatorPage__content__prof-mode__period__picker">
              <DatePicker
                allowClear={false}
                defaultValue={moment.unix(this.portfolioManager.getCalculationTimestamp()[0] / 1000)}
                disabledDate={(date) => this.getStartDisabledDate(date)}
                onChange={(e) => this.onStartDateChange(e)}
              />
              <DatePicker
                allowClear={false}
                defaultValue={moment.unix(this.portfolioManager.getCalculationTimestamp()[1] / 1000)}
                disabledDate={(date) => this.getEndDisabledDate(date)}
                onChange={(e) => this.onEndDateChange(e)}
              />
            </div>
          </div>

          <div className="CalculatorPage__content__prof-mode__history">
            <div className="CalculatorPage__content__prof-mode__history__title">
              Coins history price $:
            </div>
            <HistoryChart
              timeStep={this.portfolioManager.getStepSec()}
              hideLineScale={ScreenUtils.viewPortWidth() < ScreenSizes.MD}
              data={this.state.tokensHistory}
              colors={TokensHelper.COLORS}
              legendColumnCount={4}
              aspect={ScreenUtils.viewPortWidth() < ScreenSizes.MD ? 1.7 : 5.7}
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
              hideLineScale={ScreenUtils.viewPortWidth() < ScreenSizes.MD}
              aspect={ScreenUtils.viewPortWidth() < ScreenSizes.MD ? 3.2 : 5.7}
              colors={TokensHelper.COLORS}
              initialDate={this.state.tokensDate[this.portfolioManager.getCalculationDateIndex()[0]]}
              initialState={this.state.proportionList}
              finishDate={this.state.tokensDate[this.portfolioManager.getCalculationDateIndex()[1]]}
              showRange={false}
              type={ChartType.BAR}
            />

            <div
              className="CalculatorPage__content__prof-mode__manual-rebalance__list"
            >
              <TokenWeightList
                disabled={this.portfolioManager.getTokenType() !== TokenType.MANUAL_REBALANCE}
                maxHeight={ScreenUtils.viewPortWidth() < ScreenSizes.MD ? undefined : '200px'}
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

  private getSelectedRebalanceType(): RebalanceTypeItem {
    for (const item of CalculatorPage.REBALANCE_TYPES) {
      if (this.portfolioManager.getTokenType() === item.type) {
        return item;
      }
    }

    return CalculatorPage.REBALANCE_TYPES[0];
  }

  private onRebalanceChange(item: RebalanceTypeItem): void {
    this.portfolioManager.setTokenType(item.type);
    this.setState({});
  }

  private getStartDisabledDate(date: moment.Moment): boolean {
    if (!date) {
      return true;
    }

    return date.unix() < (this.portfolioManager.getBtcPrice()[0].time / 1000) ||
      date.unix() >= (this.portfolioManager.getCalculationTimestamp()[1] / 1000);
  }

  private getEndDisabledDate(date: moment.Moment): boolean {
    if (!date) {
      return true;
    }

    return date.unix() < (this.portfolioManager.getCalculationTimestamp()[0] / 1000) ||
      date.unix() >= (this.portfolioManager.getMaxCalculationTimestamp() / 1000);
  }

  private onStartDateChange(date: moment.Moment): void {
    const selectedTimeStamp = date.unix() * 1000;
    let startIndex: number = 1;
    this.portfolioManager.getBtcPrice()
      .some((history, index) => {
        startIndex = index;
        return selectedTimeStamp <= history.time;
      });

    const value: [number, number] = [startIndex, this.portfolioManager.getCalculationDateIndex()[1]];
    this.onDateRangeChange(value);
    this.setState({calculateRangeDateIndex: value});
  }

  private onEndDateChange(date: moment.Moment): void {
    const selectedTimeStamp = date.unix() * 1000;
    let endIndex: number = this.portfolioManager.getMaxCalculationIndex();

    this.portfolioManager.getBtcPrice()
      .some((history, index) => {
        endIndex = index;
        return selectedTimeStamp <= history.time;
      });

    const value: [number, number] = [this.portfolioManager.getCalculationDateIndex()[0], endIndex];
    this.onDateRangeChange(value);
    this.setState({calculateRangeDateIndex: value});
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

  private onDateRangeChange(value: SliderValue): void {
    this.analyticsManager.trackEvent('slider', 'change-date-range', '');
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
        window.scrollTo(0, 0);
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

  private getTooltipInfo(): React.ReactNode {
    return (
      <div className="CalculatorPage__tooltip">
        <div className="CalculatorPage__tooltip_title">{this.getTitleOfType()}</div>
        <div className="CalculatorPage__tooltip_param">
        <span className="CalculatorPage__tooltip_param_name">
        Amount of money:
        </span>
          <span className="CalculatorPage__tooltip_param_value">
        $ {this.portfolioManager.getAmount().toLocaleString()}
        </span>
        </div>
        {this.getRebalancePeriod()}
        {this.getRebalanceDiffPercent()}
        {this.getExchangeAmount()}
        {this.getCommissionPercent()}
        {this.getTokensProportions()}
        {this.getManualRebalanceList()}
      </div>
    );
  }

  private getTitleOfType(): string {
    const tokenType: TokenType = this.portfolioManager.getTokenType();

    switch (tokenType) {
      case TokenType.AUTO_REBALANCE:
        return 'Auto rebalance:';

      case TokenType.MANUAL_REBALANCE:
        return 'Manual rebalance:';

      case TokenType.FIX_PROPORTIONS:
        return 'Fix proportions:';

      case TokenType.PERIOD_REBALANCE:
        return 'Rebalance by period:';

      case TokenType.DIFF_PERCENT_REBALANCE:
        return 'Price rebalancing:';

      case TokenType.ADAPTIVE_PERCENT_EXCHANGER:
        return '10% exchanges of balance:';

      default:
        return 'unknown';
    }
  }

  private getCommissionPercent(): React.ReactNode {
    const manager: PortfolioManager = this.portfolioManager;

    if (this.toolTipCommissionVisibility()) {
      return (
        <div>
          <div className="CalculatorPage__tooltip_param">
        <span className="CalculatorPage__tooltip_param_name">
        Commission percent:
        </span>
            <span className="CalculatorPage__tooltip_param_value">
        {manager.getCommission().toLocaleString()}%
        </span>
          </div>
        </div>
      );
    }

    return '';
  }

  private toolTipCommissionVisibility(): boolean {
    const executors: string[] = this.portfolioManager.getExecutorsByTokenType();

    return executors.indexOf(ExecutorType.EXCHANGER) > -1 || executors.indexOf(ExecutorType.ARBITRAGEUR) > -1;
  }

  private getExchangeAmount(): React.ReactNode {
    if (this.toolTipExchangeAmountVisibility()) {
      return (
        <div>
          <div className="CalculatorPage__tooltip_param">
        <span className="CalculatorPage__tooltip_param_name">
        Exchange amount:
        </span>
            <span className="CalculatorPage__tooltip_param_value">
        $ {this.portfolioManager.getExchangeAmount().toLocaleString()}
        </span>
          </div>
        </div>
      );
    }

    return '';
  }

  private toolTipExchangeAmountVisibility(): boolean {
    return this.portfolioManager
      .getExecutorsByTokenType()
      .indexOf(ExecutorType.EXCHANGER) > -1;
  }

  private getRebalancePeriod(): React.ReactNode {
    if (this.toolTipRebalancePeriodVisibility()) {
      return (
        <div>
          <div className="CalculatorPage__tooltip_param">
        <span className="CalculatorPage__tooltip_param_name">
        Rebalance period:
        </span>
            <span className="CalculatorPage__tooltip_param_value">
        {this.getRebalanceByPeriod(this.portfolioManager.getRebalancePeriod())}
        </span>
          </div>
        </div>
      );
    }

    return '';
  }

  private toolTipRebalancePeriodVisibility(): boolean {
    return this.portfolioManager
      .getExecutorsByTokenType()
      .indexOf(ExecutorType.PERIOD_REBALANCER) > -1;
  }

  private getRebalanceDiffPercent(): React.ReactNode {
    if (this.toolTipRebalanceDiffPercentVisibility()) {
      return (
        <div>
          <div className="CalculatorPage__tooltip_param">
        <span className="CalculatorPage__tooltip_param_name">
        Rebalance diff:
        </span>
            <span className="CalculatorPage__tooltip_param_value">
        {this.portfolioManager.getRebalanceDiffPercent()}%
        </span>
          </div>
        </div>
      );
    }

    return '';
  }

  private toolTipRebalanceDiffPercentVisibility(): boolean {
    return this.portfolioManager
      .getExecutorsByTokenType()
      .indexOf(ExecutorType.DIFF_PERCENT_REBALANCER) > -1;
  }

  private getRebalanceByPeriod(seconds: number): string {
    if (seconds === 3600) {
      return 'HOUR';

    } else if (seconds === 86400) {
      return 'DAY';

    } else if (seconds === 604800) {
      return 'WEEK';

    } else if (seconds === 2592000) {
      return 'MONTH';
    }

    return 'SOME_CUSTOM';
  }

  private getTokensProportions(): React.ReactNode {
    return this.portfolioManager.getProportions().map(value => {
      return (
        <div key={value.name}>
          <div className="CalculatorPage__tooltip_param">
        <span className="CalculatorPage__tooltip_param_name">
        {value.name} weight:
        </span>
            <span className="CalculatorPage__tooltip_param_value">
        {value.weight}
        </span>
          </div>
        </div>
      );
    });
  }

  private getManualRebalanceList(): React.ReactNode {
    if (this.portfolioManager.getTokenType() === TokenType.MANUAL_REBALANCE) {
      return <TokenWeightSimpleList
        data={this.portfolioManager.getRebalanceWeights()}
      />;
    }
    return '';
  }

  private rebalaningInfoDialog(): void {
    Modal.info({
      className: 'CalculatorPage__content__rebalance-info__dialog',
      content: this.getRebalanceDesc(),
      iconClassName: '',
      iconType: 'some-undefined-icon',
      title: <span className="CalculatorPage__content__rebalance-info__title">Balancing modes:</span>,
      onOk() {
        // close
      },
    });
  }

  private getRebalanceDesc(): React.ReactNode {
    return CalculatorPage.REBALANCE_TYPES.map(item => {
      return (
        <div key={item.getReadableType()} className="CalculatorPage__content__rebalance-info">
          <img className="CalculatorPage__content__rebalance-info__icon" src={item.getIcon()}/>
          <div className="CalculatorPage__content__rebalance-info__title">
            {item.getReadableType()}
          </div>
          <div className="CalculatorPage__content__rebalance-info__desc">
            {item.desc}
          </div>
        </div>
      );
    });
  }

}
