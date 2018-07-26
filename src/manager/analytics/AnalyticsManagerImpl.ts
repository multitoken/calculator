import { AnalyticsManager } from './AnalyticsManager';
import { BasicAnalytics } from './BasicAnalytics';

export class AnalyticsManagerImpl implements AnalyticsManager {

  private analytics: BasicAnalytics[] = [];

  constructor(analytics: BasicAnalytics[]) {
    this.analytics = analytics;
  }

  public trackPage(pageName: string): void {
    this.callMethod('trackPage', pageName);
  }

  public trackEvent(category: string, action: string, label: string): void {
    this.callMethod('trackEvent', category, action, label);
  }

  private callMethod(method: string, ...args: any[]): void {
    this.analytics.forEach(item => {
      if (typeof item[method] === 'function') {
        item[method].apply(item, args);
      }
    });
  }

}
