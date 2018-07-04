import { Layout } from 'antd';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../res/icons/logo.svg';
import './PageHeader.less';

const {Header} = Layout;

export default class PageHeader extends React.Component {
  public render() {
    return (
      <Header className="PageHeader">
        <span className="PageHeader__logo">
          <img className="PageHeader__logo-img" alt="logo" src={Logo}/>
          <Link to="/" className="PageHeader__logo-text">Simulator</Link>
        </span>
      </Header>
    );
  }
}
