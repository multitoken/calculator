import AbstractChart, { AbstractProperties } from './AbstractChart';
import { Arbitration } from '../../repository/models/Arbitration';
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;
import Config from '../../Config';

interface Properties extends AbstractProperties<Array<Arbitration>> {
}

const DATE_FORMAT: DateTimeFormatOptions = {
    year: '2-digit',
    month: 'short',
    day: '2-digit',
    hour: '2-digit'
};

export class ArbiterChart extends AbstractChart<Properties, Array<Arbitration>, any> {

    public parseData(): Array<any> {
        return this.props.data.map(value => {
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
