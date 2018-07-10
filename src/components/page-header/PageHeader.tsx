import { Layout } from 'antd';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Telegram from '../../res/icons/ico_telegram.svg';
import Website from '../../res/icons/ico_web.svg';
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
        <span className="PageHeader__btn-block">
          <a href="https://t.me/MetaOne" target="_blank" rel="noopener">
            <img className="PageHeader__btn" alt="group" src={Telegram}/>
          </a>
          <a href="https://www.meta.one/" target="_blank" rel="noopener">
            <img className="PageHeader__btn" alt="site" src={Website}/>
          </a>
        </span>
      </Header>
    );
  }
}
