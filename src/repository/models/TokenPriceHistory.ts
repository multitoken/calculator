export class TokenPriceHistory {

    public time: number;
    public value: number;

    constructor(time: number = 0, value: number = 0) {
        this.time = time;
        this.value = value;
    }

}
