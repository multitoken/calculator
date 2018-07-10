import { Layout } from 'antd';
import * as React from 'react';
import PageHeader from '../../components/page-header/PageHeader';
import TokenType from '../../components/token-type/TokenType';
import { lazyInject, Services } from '../../Injections';
import { TokenManager } from '../../manager/TokenManager';
import ImgBalance from '../../res/icons/balance.svg';
import ImgBalanceCustom from '../../res/icons/balance_custom.svg';
import ImgBalanceOff from '../../res/icons/balance_off.svg';
import './TokenTypesPage.less';

export default class TokenTypesPage extends React.Component<any, {}> {

  @lazyInject(Services.TOKEN_MANAGER)
  public tokenManager: TokenManager;

  public componentDidMount(): void {
    if (this.tokenManager.getPriceHistory().size === 0) {
      // Redirect to root
      window.location.replace('/simulator');
    }
  }

  public render() {
    return (
      <Layout
        style={{
          minHeight: '100vh',
          minWidth: 320,
        }}
      >
        <PageHeader/>
        <header className="TokenTypesPage__header">
          Select of rebalancing
        </header>

        <div className="TokenTypesPage__content">
          <TokenType
            title="Auto rebalance"
            img={ImgBalance}
            onItemClick={() => this.onTokenTypeSelected(1)}
            desc={<span>Keeps the specified ratio of portfolio proportions.</span>}
          />
          <TokenType
            title="Fix proportions"
            img={ImgBalanceOff}
            desc={<span>The number of tokens in the portfolio will be constant.</span>}
            onItemClick={() => this.onTokenTypeSelected(2)}
          />
          <TokenType
            title="Manual rebalance"
            img={ImgBalanceCustom}
            desc={<span>Change the proportion of assets manually after creating a multitoken.</span>}
            onItemClick={() => this.onTokenTypeSelected(3)}
          />
        </div>

      </Layout>
    );
  }

  private onTokenTypeSelected(type: number): void {
    this.tokenManager.disableArbitrage(type >= 2);
    this.tokenManager.disableManualRebalance(type !== 3);
    const {history} = this.props;
    history.push('calculator');
  }

}
