import * as React from 'react';

const {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip} = require('recharts');
import { scaleLog } from 'd3-scale';
//
// const data = [
//     {time: 'Page A', uv: 4000, pv: 2400, amt: 2400},
//     {name: 'Page B', uv: 3000, pv: 1398, amt: 2210},
//     {name: 'Page C', uv: 2000, pv: 9800, amt: 2290},
//     {name: 'Page D', uv: 2780, pv: 3908, amt: 2000},
//     {name: 'Page E', uv: 1890, pv: 4800, amt: 2181},
//     {name: 'Page F', uv: 2390, pv: 3800, amt: 2500},
//     {name: 'Page G', uv: 3490, pv: 4300, amt: 2100},
// ];

export interface AbstractProperties<M> {
    data: M;
    colors: Array<string>;
    width: number;
    height: number;
}

export default abstract class AbstractChart<P extends AbstractProperties<M>, M, D> extends React.Component<P, {}> {

    scale: any;

    constructor(props: P) {
        super(props);

        this.scale = scaleLog().base(Math.E);
        this.state = {
            adaptiveData: [],
            names: []
        };
    }

    shouldComponentUpdate(data: Readonly<P>, data1: Readonly<{}>, data2: any): boolean {
        return this.props.data !== data.data;
    }

    public render() {
        return (
            <LineChart width={this.props.width} height={this.props.height} data={this.parseData()}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="date"/>
                <YAxis scale={this.scale} domain={['auto', 'auto']}/>
                <Tooltip/>
                {this.prepareLines()}
            </LineChart>
        );
    }

    abstract parseData(): Array<D>;

    abstract getNames(): Array<string>;

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
