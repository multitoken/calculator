import * as Sentry from '@sentry/browser';
import { BackTop, Layout } from 'antd';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { CalculationResult } from '../../components/calculation-result/CalculationResult';
import { CompareCalculationResult } from '../../components/compare-calculation-result/CompareCalculationResult';
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

interface Props extends RouteComponentProps<{}> {
}

interface State {
  progressPercents: number;
  showCalculationProgress: boolean;
  showMessageDialog: boolean;
}

export default class ResultPage extends React.Component<Props, State> implements ProgressListener {

  @lazyInject(Services.PORTFOLIOS_EXECUTOR)
  private portfolioExecutor: MultiPortfolioExecutor;
  @lazyInject(Services.ANALYTICS_MANAGER)
  private analyticsManager: AnalyticsManager;

  constructor(props: Props) {
    super(props);

    this.analyticsManager.trackPage('/result-page');

    this.portfolioExecutor.subscribeToProgress(this);

    this.state = {
      progressPercents: 0,
      showCalculationProgress: true,
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
    if (this.portfolioExecutor.getPortfolios().size === 0) {
      // Redirect to root
      window.location.replace('/simulator');
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
          openDialog={this.state.showCalculationProgress}
          percentProgress={this.state.progressPercents}
        />

        <MessageDialog openDialog={this.state.showMessageDialog}/>

        <div>
          <BackTop>
            <div className="ant-back-top-inner">UP</div>
          </BackTop>
        </div>
      </Layout>
    );
  }

  private prepareCalculationResults(): React.ReactNode {
    const rebalanceResults: RebalanceResult[] = [];
    const portfolioManagers: PortfolioManager[] = [];
    this.portfolioExecutor.getPortfolios().forEach((rebalanceResult, portfolioManager) => {
      rebalanceResults.push(rebalanceResult);
      portfolioManagers.push(portfolioManager);
    });

    if (rebalanceResults.length === 1) {
      const portfolio: PortfolioManager = portfolioManagers[0];
      return (
        <CalculationResult
          portfolioManager={portfolio}
          rebalanceResult={rebalanceResults[0]}
          showCharts={true}
          showEditButton={true}
          showArbitrageInfo={true}
          toolTipExchangeAmountVisibility={this.exchangeAmountVisibility(portfolio)}
          toolTipRebalancePeriodVisibility={this.rebalancePeriodVisibility(portfolio)}
          toolTipCommissionVisibility={this.commissionPercentsVisibility(portfolio)}
          toolTipRebalanceDiffPercentVisibility={this.diffPercentPercentsRebalanceVisibility(portfolio)}
          onEditClick={() => this.onEditClick()}
          onBackClick={() => this.onBackClick()}
          onSwitchChartsChange={(checked) => this.onSwitchChartsChange(checked)}
        />
      );
    }

    return (
      <CompareCalculationResult
        rebalanceResult={rebalanceResults}
        portfolioManager={portfolioManagers}
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

  private onEditClick(): void {
    this.analyticsManager.trackEvent('button', 'click', 'to-new');

    if (this.portfolioExecutor.getPortfolios().size <= 1) {
      window.location.replace('/simulator');
    } else {
      this.props.history.goBack();
    }
  }

  private onBackClick(): void {
    const {history} = this.props;
    this.analyticsManager.trackEvent('button', 'click', 'to-back');
    history.goBack();
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
