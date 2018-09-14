import * as Sentry from '@sentry/browser';
import { Button, Input, Layout } from 'antd';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { HistoryList } from '../../components/lists/history/HistoryList';
import PageContent from '../../components/page-content/PageContent';
import PageHeader from '../../components/page-header/PageHeader';
import { lazyInject, Services } from '../../Injections';
import { AnalyticsManager } from '../../manager/analytics/AnalyticsManager';
import { PortfolioManager } from '../../manager/multitoken/PortfolioManager';
import { Portfolio } from '../../repository/models/Portfolio';

import './HistoryPage.less';

const Search = Input.Search;

interface Props extends RouteComponentProps<{}> {
}

interface State {
  portfolios: Portfolio[];
  searchEmail: string | undefined;
  showLoadingProgress: boolean;
}

export default class HistoryPage extends React.Component<Props, State> {

  @lazyInject(Services.PORTFOLIO_MANAGER)
  private portfolioManager: PortfolioManager;
  @lazyInject(Services.ANALYTICS_MANAGER)
  private analyticsManager: AnalyticsManager;

  constructor(props: Props) {
    super(props);

    this.analyticsManager.trackPage('/history-page');

    this.state = {
      portfolios: [],
      searchEmail: undefined,
      showLoadingProgress: false,
    };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    Sentry.captureException(error);
  }

  public render() {
    return (
      <Layout style={{minHeight: '100vh'}}>
        <PageHeader/>
        <PageContent className="HistoryPage__content">

          <Search
            value={this.state.searchEmail}
            onChange={(e) => this.setState({searchEmail: e.target.value})}
            placeholder="input email address"
            onSearch={value => this.onSearchClick(value)}
            disabled={this.state.showLoadingProgress}
            enterButton={<Button
              type="primary"
              disabled={this.state.showLoadingProgress}
              loading={this.state.showLoadingProgress}
            >
              Search
            </Button>}
          />

          <div style={{height: '10px'}}/>
          <HistoryList
            data={this.state.portfolios}
            bordered={true}
            onChangePortfolio={(email: string, id: number) => this.onPortfolioClick(email, id)}
          />
        </PageContent>
      </Layout>
    );
  }

  private onPortfolioClick(email: string, id: number): void {
    const {history} = this.props;
    history.push(`calculator/result?email=${email}&id=${id}`);
  }

  private onSearchClick(email: string): void {
    this.analyticsManager.trackEvent('button', 'click', 'search-history');
    this.portfolioManager.getPortfolios(email)
      .then((result) => {
        this.setState({
          portfolios: result,
          showLoadingProgress: false,
        });
      })
      .catch((error) => {
        this.setState({showLoadingProgress: false});
        Sentry.captureException(error);
      });
  }

}
