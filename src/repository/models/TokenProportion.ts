export class TokenProportion {

    name: string;
    proportion: number;
    min: number;
    max: number;

    constructor(name: string, proportion: number, min: number, max: number) {
        this.name = name;
        this.proportion = proportion;
        this.min = min;
        this.max = max;
    }

}
