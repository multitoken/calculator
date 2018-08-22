import { Layout } from 'antd';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { lazyInject, Services } from '../../Injections';
import { AnalyticsManager } from '../../manager/analytics/AnalyticsManager';
import Telegram from '../../res/icons/ico_telegram.svg';
import Website from '../../res/icons/ico_web.svg';
import Logo from '../../res/icons/logo.svg';
import './PageHeader.less';

const {Header} = Layout;

export default class PageHeader extends React.Component {

  @lazyInject(Services.ANALYTICS_MANAGER)
  private analyticsManager: AnalyticsManager;

  public render() {
    return (
      <Header className="PageHeader">
        <span className="PageHeader__logo">
          <img className="PageHeader__logo-img" alt="logo" src={Logo}/>
          <Link to="/" className="PageHeader__logo-text" onClick={e => this.onLogoLinkClick()}>Calculator</Link>
        </span>
        <span className="PageHeader__btn-block">
          <a href="https://t.me/MultiToken" target="_blank" rel="noopener" onClick={e => this.onTelegramLinkClick()}>
            <img className="PageHeader__btn" alt="group" src={Telegram}/>
          </a>
          <a href="https://www.multitoken.com/" target="_blank" rel="noopener" onClick={e => this.onSiteLinkClick()}>
            <img className="PageHeader__btn" alt="site" src={Website}/>
          </a>
        </span>
      </Header>
    );
  }

  private onLogoLinkClick(): void {
    this.analyticsManager.trackEvent('Redirect', 'link-click', 'logo');
  }

  private onTelegramLinkClick(): void {
    this.analyticsManager.trackEvent('Redirect', 'link-click', 'telegram');
  }

  private onSiteLinkClick(): void {
    this.analyticsManager.trackEvent('Redirect', 'link-click', 'site');
  }

}
