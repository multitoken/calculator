import * as React from 'react';
import { Range } from 'react-input-range';
import { scaleLog } from 'd3-scale';

const InputRange = require('react-input-range');
const {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip} = require('recharts');

export interface AbstractProperties<M> {
    data: M;
    colors: Array<string>;
    width: number;
    height: number;
    showRange: boolean;
}

export interface AbstractState {
    calculateRangeIndex: Range | number;
}

export default abstract class AbstractChart<P extends AbstractProperties<M>, S extends AbstractState, M, D>
    extends React.Component<P, any> {

    scale: any;
    data: Array<any>;
    isChangedData: boolean = false;

    constructor(props: P) {
        super(props);

        this.scale = scaleLog().base(Math.E);
        this.data = [];
        this.isChangedData = false;

        this.state = {
            calculateRangeIndex: {min: 0, max: 1}
        };
    }

    shouldComponentUpdate(props: Readonly<P>, state: Readonly<S>, data2: any): boolean {
        this.isChangedData = this.props.data !== props.data;

        return this.isChangedData ||
            (this.props.showRange && this.state.calculateRangeIndex !== state.calculateRangeIndex);
    }

    public render() {
        return (
            <span>
                <LineChart width={this.props.width} height={this.props.height} data={this.prepareData()}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="date"/>
                    <YAxis scale={this.scale} domain={['auto', 'auto']}/>
                    <Tooltip/>
                    {this.prepareLines()}
                </LineChart>
                {this.prepareRangeComponent()}
            </span>
        );
    }

    abstract parseData(data: M): Array<D>;

    abstract getNames(): Array<string>;

    private prepareData(): Array<any> {
        if (this.isChangedData) {
            this.data = this.parseData(this.props.data);
            this.setState({calculateRangeIndex: {min: 0, max: (this.data.length - 1) || 1}});

            return [];
        }

        const min: number = (this.state.calculateRangeIndex as Range).min;
        const max: number = (this.state.calculateRangeIndex as Range).max;

        return this.props.showRange ? this.data.slice(min, max) : this.data;
    }

    private prepareRangeComponent(): any {
        return this.props.showRange
            ? (
                <div style={{'width': this.props.width + 'px', 'padding': '0px 0px 0px 65px'}}>
                    <InputRange
                        maxValue={(this.data.length - 1) || 0}
                        minValue={0}
                        formatLabel={value => this.inputRangeTrackValue(value)}
                        value={this.state.calculateRangeIndex}
                        onChange={value => this.setState({calculateRangeIndex: value})}
                    />
                </div>
            )
            : null;
    }

    private inputRangeTrackValue(index: number): string {
        if (index > -1 && index <= this.data.length - 1 && this.data[index].hasOwnProperty('date')) {
            return this.data[index].date;
        } else {
            return 'wrong date';
        }
    }

    private prepareLines(): any {
        return this.getNames()
            .map((value, index) => {
                return (
                    <Line
                        type="monotone"
                        key={value}
                        dataKey={value}
                        dot={null}
                        stroke={this.props.colors[index]}
                    />
                );
            });
    }

}
