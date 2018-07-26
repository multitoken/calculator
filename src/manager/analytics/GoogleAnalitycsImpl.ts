import ReactGA from 'react-ga';
import { BasicAnalytics } from './BasicAnalytics';

export class GoogleAnalyticsImpl implements BasicAnalytics {

  constructor(trackingId: string, isDebug: boolean) {
    ReactGA.initialize(trackingId, {
      debug: isDebug,
      titleCase: false
    });
  }

  public trackPage(pageName: string): void {
    ReactGA.pageview(pageName);
  }

  public trackEvent(category: string, action: string, label: string): void {
    ReactGA.event({
      'action': action,
      'category': category,
      'label': label
    });
  }

}
