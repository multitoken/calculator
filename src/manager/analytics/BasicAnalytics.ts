export interface BasicAnalytics {

  trackPage(pageName: string): void;

  trackEvent(category: string, action: string, label: string): void;

}
