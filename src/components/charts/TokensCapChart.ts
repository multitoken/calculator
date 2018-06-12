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

export class TokensCapChart extends AbstractChart<Properties, Array<Arbitration>, any> {

    public parseData(): Array<any> {
        return this.props.data.map(value => {
            const data: any = {};
            data.date = new Date(value.timestamp).toLocaleDateString(['en-US'], DATE_FORMAT);
            value.arbiterTokensCap.forEach((value2, key) => {
                data['arbiter' + key] = value2 * Config.getBtcUsdPrice();
            });
            value.originTokensCap.forEach((value2, key) => {
                data['origin' + key] = value2 * Config.getBtcUsdPrice();
            });

            return data;
        });
    }

    public getNames(): Array<string> {
        if (this.props.data.length > 0 && this.props.data[0].originTokensCap.size > 0) {
            const result: Set<string> = new Set();

            this.props.data[0].arbiterTokensCap.forEach((value2, key) => {
                result.add('arbiter' + key);
            });
            this.props.data[0].originTokensCap.forEach((value2, key) => {
                result.add('origin' + key);
            });

            return Array.from(result);
        }
        return [];
    }

}
