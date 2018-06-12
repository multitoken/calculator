import AbstractChart, { AbstractProperties, AbstractState } from './AbstractChart';
import { TokenPriceHistory } from '../../repository/models/TokenPriceHistory';
import Config from '../../Config';
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;

interface Properties extends AbstractProperties<Map<string, Array<TokenPriceHistory>>> {
    start: number;
    end: number;
}

const DATE_FORMAT: DateTimeFormatOptions = {
    year: '2-digit',
    month: 'short',
    day: '2-digit',
    hour: '2-digit'
};

export class HistoryChart extends AbstractChart<Properties, AbstractState, Map<string, Array<TokenPriceHistory>>, any> {

    shouldComponentUpdate(data: Readonly<Properties>, data1: Readonly<AbstractState>, data2: any): boolean {
        return super.shouldComponentUpdate(data, data1, data2) ||
            (this.props.start !== data.start || this.props.end !== data.end);
    }

    public parseData(data: Map<string, Array<TokenPriceHistory>>): Array<any> {
        const result: Array<any> = [];

        for (let i = this.props.start; i < this.props.end; i++) {
            if (i % 3600 !== 0) {
                continue;
            }

            const dataResult: any = {data: ''};
            data.forEach((value, key) => {
                dataResult.date = new Date(value[i].time).toLocaleDateString(['en-US'], DATE_FORMAT);
                dataResult[key] = value[i].close * Config.getBtcUsdPrice();
            });

            result.push(dataResult);
        }

        return result;
    }

    public getNames(): Array<string> {
        return Array.from(this.props.data.keys());
    }

}
