import { scaleLog } from 'd3-scale';
import * as React from 'react';
import InputRange, { Range } from 'react-input-range';
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';

export interface AbstractProperties<M> {
  data: M;
  colors: string[];
  width: number;
  height: number;
  showRange: boolean;
}

export interface AbstractState {
  calculateRangeIndex: Range | number;
}

export default abstract class AbstractChart<P extends AbstractProperties<M>, S extends AbstractState, M, D>
  extends React.Component<P, any> {

  public static SCALE: any = scaleLog().base(Math.E);
  public data: any[];
  public isChangedData: boolean = false;

  constructor(props: P) {
    super(props);

    this.data = [];
    this.isChangedData = false;

    this.state = {
      calculateRangeIndex: {min: 0, max: 1}
    };
  }

  public shouldComponentUpdate(props: Readonly<P>, state: Readonly<S>, data2: any): boolean {
    this.isChangedData = this.props.data !== props.data;

    return this.isChangedData || !this.props.showRange ||
      (this.props.showRange && this.state.calculateRangeIndex !== state.calculateRangeIndex);
  }

  public render() {
    return (
      <div className="AbstractChart">
        <LineChart
          data={this.prepareData()}
          width={this.props.width}
          height={this.props.height}
          style={{
            zIndex: 1,
          }}
        >
          <CartesianGrid strokeDasharray="3 3"/>
          <XAxis dataKey="date"/>
          <YAxis scale={AbstractChart.SCALE} domain={['auto', 'auto']}/>
          <Tooltip/>
          {this.prepareLines()}
        </LineChart>

        {this.prepareRangeComponent()}
      </div>
    );
  }

  public abstract parseData(data: M): D[];

  public abstract getNames(): string[];

  private prepareData(): any[] {
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
        <div style={{
          padding: '25px 50px 50px',
          width: this.props.width,
        }}
        >
          <InputRange
            maxValue={Math.max(this.data.length - 1, 1)}
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
            dot={false}
            stroke={this.props.colors[index]}
          />
        );
      });
  }

}
