export class TokenProportion {

    public name: string;
    public proportion: number;
    public min: number;
    public max: number;

    constructor(name: string, proportion: number, min: number, max: number) {
        this.name = name;
        this.proportion = proportion;
        this.min = min;
        this.max = max;
    }

}
