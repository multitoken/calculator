export default class Config {

  public static getStatic(): string {
    return '';
  }

  public static getStableCoinsApi(): string {
    return 'https://api.icex.ch';
  }

  public static getIntercomAppId(): string {
    return 'q14mislj';
  }

  public static getGoogleAnalyticsTrackId() {
    return 'UA-120564356-3';
  }

  public static isDebug() {
    return !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
  }

  public static getSenrtyConfigUrl(): string {
    return 'https://b249c9bfeaa74ac7890da6843b4e259b@sentry.io/1259174';
  }

}
