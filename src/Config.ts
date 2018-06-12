export default class Config {

    private static isDebug: boolean = true;

    public static getCryptoCurrencyPriceApi(): string {
        return this.isDebug ? 'https://min-api.cryptocompare.com' : '';
    }

    public static getBtcUsdPrice(): number {
        return 7500;
    }

}
