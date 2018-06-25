import { Layout } from 'antd';
import * as React from 'react';
import logoSvg from './logo-mtkn.svg';
import './PageHeader.less';

const {Header} = Layout;

export default class PageHeader extends React.Component {
  public render() {
    return (
      <Header className="PageHeader">
        <a className="PageHeader__logo">
          <img className="PageHeader__logo-img" alt="logo" src={logoSvg}/>
          <span className="PageHeader__logo-text">Arbitrator simulator</span>
        </a>
      </Header>
    );
  }
}
