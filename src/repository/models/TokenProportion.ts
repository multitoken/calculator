import { Token } from './Token';

export class TokenProportion extends Token {

    public min: number;
    public max: number;

    constructor(name: string, weight: number, min: number, max: number) {
        super(name, weight);

        this.min = min;
        this.max = max;
    }

}
