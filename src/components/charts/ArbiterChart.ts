import Config from '../../Config';
import { Arbitration } from '../../repository/models/Arbitration';
import AbstractChart, { AbstractProperties, AbstractState } from './AbstractChart';
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;

interface Properties extends AbstractProperties<Arbitration[]> {
}

const DATE_FORMAT: DateTimeFormatOptions = {
    day: '2-digit',
    hour: '2-digit',
    month: 'short',
    year: '2-digit',
};

export class ArbiterChart extends AbstractChart<Properties, AbstractState, Arbitration[], any> {

    public parseData(data: Arbitration[]): any[] {
        return data.map(value => {
            const copy: any = Object.assign({}, value);
            copy.originCap *= Config.getBtcUsdPrice();
            copy.arbiterCap *= Config.getBtcUsdPrice();
            copy.date = new Date(value.timestamp).toLocaleDateString(['en-US'], DATE_FORMAT);

            return copy;
        });
    }

    public getNames(): string[] {
        return ['arbiterCap', 'originCap'];
    }

}
