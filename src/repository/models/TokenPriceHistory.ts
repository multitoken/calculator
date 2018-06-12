export class TokenPriceHistory {

    time: number;
    high: number;
    low: number;
    open: number;
    volumefrom: number;
    volumeto: number;
    close: number;

    constructor(time: number = 0,
                high: number = 0,
                low: number = 0,
                open: number = 0,
                volumefrom: number = 0,
                volumeto: number = 0,
                close: number = 0) {
        this.time = time;
        this.high = high;
        this.low = low;
        this.open = open;
        this.volumefrom = volumefrom;
        this.volumeto = volumeto;
        this.close = close;
    }

}
