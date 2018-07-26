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

}
