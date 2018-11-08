import ArgumentUtils from './utils/ArgumentUtils';

export default class Config {

  public static getStatic(): string {
    return '';
  }

  public static getBackendEndPoint(): string {
    return '/api';
  }

  public static getStableCoinsApi(): string {
    return 'https://api.icex.ch';
  }

  public static getIntercomAppId(): string {
    return ArgumentUtils.getValue('REACT_APP_INTERCOM_APP_ID');
  }

  public static getHotjarAppId(): string {
    return ArgumentUtils.getValue('REACT_APP_HOTJAR_APP_ID');
  }

  public static getGoogleAnalyticsTrackId(): string {
    return ArgumentUtils.getValue('REACT_APP_GOOGLE_ANALYTICS_TRACK_ID');
  }

  public static isDebug(): boolean {
    return !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
  }

  public static getSenrtyConfigUrl(): string {
    return ArgumentUtils.getValue('REACT_APP_SENTRY_DSN');
  }

}
