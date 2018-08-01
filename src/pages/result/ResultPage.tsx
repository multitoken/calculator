import { BackTop, Layout } from 'antd';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { CalculationResult } from '../../components/calculation-result/CalculationResult';
import { MessageDialog } from '../../components/dialogs/MessageDialog';
import { ProgressDialog } from '../../components/dialogs/ProgressDialog';
import PageHeader from '../../components/page-header/PageHeader';
import { lazyInject, Services } from '../../Injections';
import { AnalyticsManager } from '../../manager/analytics/AnalyticsManager';
import { MultiPortfolioExecutor } from '../../manager/multitoken/MultiPortfolioExecutor';
import { ProgressListener } from '../../manager/multitoken/ProgressListener';

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
      .then(() => this.setState({showCalculationProgress: false}));
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

  private prepareCalculationResults(): React.ReactNode[] {
    const result: React.ReactNode[] = [];

    let index: number = 0;
    this.portfolioExecutor.getPortfolios().forEach((rebalanceResult, portfolio) => {
      index++;
      result.push((
        <CalculationResult
          key={index}
          portfolioManager={portfolio}
          rebalanceResult={rebalanceResult}
          showCharts={this.portfolioExecutor.getPortfolios().size <= 1}
          showEditButton={this.portfolioExecutor.getPortfolios().size <= 1}
          showExchangeAmountInfo={this.portfolioExecutor.getPortfolios().size <= 1}
          onEditClick={() => this.onEditClick()}
          onBackClick={() => this.onBackClick()}
          onSwitchChartsChange={(checked) => this.onSwitchChartsChange(checked)}
        />
      ));
    });

    return result;
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
