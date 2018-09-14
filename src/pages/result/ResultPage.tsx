import * as Sentry from '@sentry/browser';
import { BackTop, Layout } from 'antd';
import QueryString from 'query-string';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { CalculationResult } from '../../components/calculation-result/CalculationResult';
import { CompareCalculationResult } from '../../components/compare-calculation-result/CompareCalculationResult';
import { LoadingDialog } from '../../components/dialogs/LoadingDialog';
import { MessageDialog } from '../../components/dialogs/MessageDialog';
import { ProgressDialog } from '../../components/dialogs/ProgressDialog';
import PageHeader from '../../components/page-header/PageHeader';
import { lazyInject, Services } from '../../Injections';
import { AnalyticsManager } from '../../manager/analytics/AnalyticsManager';
import { ExecutorType } from '../../manager/multitoken/executors/TimeLineExecutor';
import { MultiPortfolioExecutor } from '../../manager/multitoken/MultiPortfolioExecutor';
import { PortfolioManager } from '../../manager/multitoken/PortfolioManager';
import { ProgressListener } from '../../manager/multitoken/ProgressListener';
import { RebalanceResult } from '../../manager/multitoken/RebalanceResult';
import { RebalanceResultImpl } from '../../manager/multitoken/RebalanceResultImpl';
import { Portfolio } from '../../repository/models/Portfolio';
import { RebalanceHistory } from '../../repository/models/RebalanceHistory';

interface Props extends RouteComponentProps<{}> {
}

interface State {
  preparedHistoryData: boolean;
  progressPercents: number;
  showCalculationProgress: boolean;
  showEditButton: boolean;
  showMessageDialog: boolean;
}

export default class ResultPage extends React.Component<Props, State> implements ProgressListener {

  @lazyInject(Services.PORTFOLIO_MANAGER)
  private portfolioManager: PortfolioManager;
  @lazyInject(Services.PORTFOLIOS_EXECUTOR)
  private portfolioExecutor: MultiPortfolioExecutor;
  @lazyInject(Services.ANALYTICS_MANAGER)
  private analyticsManager: AnalyticsManager;

  constructor(props: Props) {
    super(props);

    this.analyticsManager.trackPage('/result-page');

    this.portfolioExecutor.subscribeToProgress(this);

    this.state = {
      preparedHistoryData: true,
      progressPercents: 0,
      showCalculationProgress: true,
      showEditButton: true,
      showMessageDialog: false,
    };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    Sentry.captureException(error);
  }

  public onProgress(percents: number): void {
    if (!this.state.showCalculationProgress) {
      this.setState({showCalculationProgress: true});
    }

    this.setState({progressPercents: percents});
  }

  public componentDidMount(): void {
    const {email, id} = QueryString.parse(this.props.location.search);
    if (email && id) {

      this.setState({
        preparedHistoryData: false,
        showEditButton: false,
      });

      this.loadByEmailAndId(email, id)
        .then(() => {
          this.setState({
            preparedHistoryData: true,
          });
          console.log('load by query finished');
        });

      return;

    } else if (this.portfolioExecutor.getPortfolios().size === 0) {
      // Redirect to root
      window.location.replace('/calculator');
      return;
    }

    this.portfolioExecutor.executeCalculation()
      .then((result) => {
        console.log(result);
        this.setState({
          showCalculationProgress: false
        });
      }).catch(error => Sentry.captureException(error));
  }

  public render() {
    return (
      <Layout
        style={{
          minHeight: '100vh',
        }}
      >
        <PageHeader/>

        {this.prepareCalculationResults()}
        <ProgressDialog
          openDialog={this.state.showCalculationProgress && this.state.preparedHistoryData}
          percentProgress={this.state.progressPercents}
        />

        <MessageDialog openDialog={this.state.showMessageDialog}/>

        <LoadingDialog
          openDialog={!this.state.preparedHistoryData}
          message={'Please wait. We prepare historical data of tokens'}
        />

        <div>
          <BackTop>
            <div className="ant-back-top-inner">UP</div>
          </BackTop>
        </div>
      </Layout>
    );
  }

  private async loadByEmailAndId(email: string, id: number): Promise<void> {
    try {
      this.portfolioExecutor.removeAllPortfolios();
      this.portfolioExecutor.addPortfolioManager(this.portfolioManager, new RebalanceResultImpl(this.portfolioManager));

      await this.portfolioManager.loadPortfolio(email, id);

      this.setState({preparedHistoryData: true});

      const result: RebalanceHistory[] = await this.portfolioExecutor.executeCalculation();
      console.log(result);
      this.setState({showCalculationProgress: false});

    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
      alert('Something went wrong!');
      window.location.replace('/calculator');
    }
  }

  private prepareCalculationResults(): React.ReactNode {
    if (!this.state.preparedHistoryData) {
      return null;
    }

    const rebalanceResults: RebalanceResult[] = [];
    const portfolioManagers: PortfolioManager[] = [];

    this.portfolioExecutor.getPortfolios()
      .forEach((rebalanceResult, portfolioManager) => {
        rebalanceResults.push(rebalanceResult);
        portfolioManagers.push(portfolioManager);
      });

    if (rebalanceResults.length === 1) {
      const portfolioManager: PortfolioManager = portfolioManagers[0];
      return (
        <CalculationResult
          portfolioManager={portfolioManager}
          rebalanceResult={rebalanceResults[0]}
          showCharts={true}
          showEditButton={this.state.showEditButton}
          showArbitrageInfo={true}
          toolTipExchangeAmountVisibility={this.exchangeAmountVisibility(portfolioManager)}
          toolTipRebalancePeriodVisibility={this.rebalancePeriodVisibility(portfolioManager)}
          toolTipCommissionVisibility={this.commissionPercentsVisibility(portfolioManager)}
          toolTipRebalanceDiffPercentVisibility={this.diffPercentPercentsRebalanceVisibility(portfolioManager)}
          onResetClick={() => this.onResetClick()}
          onBackClick={() => this.onBackClick()}
          onPortfolioSaveClick={(portfolio) => this.onPortfolioSaveClick(portfolioManager, portfolio)}
          onSwitchChartsChange={(checked) => this.onSwitchChartsChange(checked)}
        />
      );
    }

    return (
      <CompareCalculationResult
        rebalanceResult={rebalanceResults}
        portfolioManager={portfolioManagers}
        onResetClick={() => this.onResetClick()}
      />
    );
  }

  private rebalancePeriodVisibility(manager: PortfolioManager): boolean {
    return manager
      .getExecutorsByTokenType()
      .indexOf(ExecutorType.PERIOD_REBALANCER) > -1;
  }

  private exchangeAmountVisibility(manager: PortfolioManager): boolean {
    return manager
      .getExecutorsByTokenType()
      .indexOf(ExecutorType.EXCHANGER) > -1;
  }

  private commissionPercentsVisibility(manager: PortfolioManager): boolean {
    const executors: string[] = manager.getExecutorsByTokenType();

    return executors.indexOf(ExecutorType.EXCHANGER) > -1 || executors.indexOf(ExecutorType.ARBITRAGEUR) > -1;
  }

  private diffPercentPercentsRebalanceVisibility(manager: PortfolioManager): boolean {
    return manager
      .getExecutorsByTokenType()
      .indexOf(ExecutorType.DIFF_PERCENT_REBALANCER) > -1;
  }

  private onResetClick(): void {
    this.analyticsManager.trackEvent('button', 'click', 'to-new');

    if (this.portfolioExecutor.getPortfolios().size <= 1) {
      window.location.replace('/calculator');
    } else {
      this.props.history.goBack();
    }
  }

  private onBackClick(): void {
    const {history} = this.props;
    this.analyticsManager.trackEvent('button', 'click', 'to-back');
    history.goBack();
  }

  private onPortfolioSaveClick(portfolioManager: PortfolioManager, portfolio: Portfolio): void {
    this.analyticsManager.trackEvent(
      'button',
      'click',
      'save-result'
    );

    portfolioManager.savePortfolio(portfolio)
      .then(() => alert('Successful saved'))
      .catch((reason) => {
        console.error(reason);
        Sentry.captureException(reason);
        alert('Something went wrong!');
      });
  }

  private onSwitchChartsChange(checked: boolean): void {
    this.setState({showMessageDialog: true});

    this.analyticsManager.trackEvent(
      'switch',
      checked ? 'check' : 'uncheck',
      'charts'
    );

    setTimeout(
      () => {
        this.setState({showMessageDialog: false});
      },
      1000
    );
  }

}
