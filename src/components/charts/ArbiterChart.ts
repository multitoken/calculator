import AbstractChart, { AbstractProperties, AbstractState } from './AbstractChart';
import { Arbitration } from '../../repository/models/Arbitration';
import Config from '../../Config';
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;

interface Properties extends AbstractProperties<Array<Arbitration>> {
}

const DATE_FORMAT: DateTimeFormatOptions = {
    year: '2-digit',
    month: 'short',
    day: '2-digit',
    hour: '2-digit'
};

export class ArbiterChart extends AbstractChart<Properties, AbstractState, Array<Arbitration>, any> {

    public parseData(data: Array<Arbitration>): Array<any> {
        return data.map(value => {
            const copy: any = Object.assign({}, value);
            copy.originCap *= Config.getBtcUsdPrice();
            copy.arbiterCap *= Config.getBtcUsdPrice();
            copy.date = new Date(value.timestamp).toLocaleDateString(['en-US'], DATE_FORMAT);

            return copy;
        });
    }

    public getNames(): Array<string> {
        return ['originCap', 'arbiterCap'];
    }

}
