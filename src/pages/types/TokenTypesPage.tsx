import { Layout } from 'antd';
import * as React from 'react';
import PageFooter from '../../components/page-footer/PageFooter';
import PageHeader from '../../components/page-header/PageHeader';
import TokenType from '../../components/token-type/TokenType';
import ImgBalance from '../../res/icons/balance.svg';
import ImgBalanceCustom from '../../res/icons/balance_custom.svg';
import ImgBalanceOff from '../../res/icons/balance_off.svg';
import './TokenTypesPage.less';

export default class TokenTypesPage extends React.Component<{}, {}> {

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
          Select type of Multitoken
        </header>

        <div className="TokenTypesPage__content">
          <TokenType
            title="With auto rebalancing"
            img={ImgBalance}
            onItemClick={() => {
              // hello
            }}
            desc={<span>Hello</span>}
          />
          <TokenType
            title="Without auto rebalancing"
            img={ImgBalanceOff}
            desc={<span>Hello</span>}
            onItemClick={() => {
              // hello
            }}
          />
          <TokenType
            title="Manual control rebalancing"
            img={ImgBalanceCustom}
            desc={<span>Hello</span>}
            onItemClick={() => {
              // hello
            }}
          />
        </div>

        <PageFooter/>
      </Layout>
    );
  }

}
