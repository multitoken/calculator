import { ColumnCount } from 'antd/lib/list';
import * as React from 'react';
import InputRange, { Range } from 'react-input-range';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { TokenLegend } from '../../entities/TokenLegend';
import { DateUtils } from '../../utils/DateUtils';
import { TokensHelper } from '../../utils/TokensHelper';
import { LegendStyle } from '../holders/legend/TokenLegendHolder';
import { TokensLegendList } from '../lists/legend/TokensLegendList';
import { XAxisDate } from './XAxisDate';
import { YAxisValue } from './YAxisValue';

export enum ChartType {
  LINES,
  BAR,
  BAR_STACKED,
  PIPE,
}

export interface AbstractProperties<M> {
  data: M;
  applyScale?: boolean;
  colors: string[];
  showRange?: boolean;
  showLegendCheckBox?: boolean;
  type?: ChartType;
  aspect?: number;
  isDebugMode?: boolean;
  legendColumnCount?: number;
}

export interface AbstractState {
  calculateRangeIndex: Range | number;
  selectedNames: string[];
}

export default abstract class AbstractChart<P extends AbstractProperties<M>, S extends AbstractState, M, D>
  extends React.Component<P, any> {

  public data: any[];
  public isChangedData: boolean = false;
  private colorByName: Map<string, string> = new Map();

  constructor(props: P) {
    super(props);

    this.data = [];
    this.isChangedData = true;

    this.state = {
      calculateRangeIndex: {min: 0, max: 1},
      selectedNames: this.getNames()
    };
    this.getNames()
      .forEach((value, index) =>
        this.colorByName.set(value, index < props.colors.length ? props.colors[index] : '#ffffff')
      );
  }

  public shouldComponentUpdate(props: Readonly<P>, state: Readonly<S>, data2: any): boolean {
    this.isChangedData = this.props.data !== props.data;

    this.colorByName.clear();
    this.getNames()
      .forEach((value, index) =>
        this.colorByName.set(value, index < props.colors.length ? props.colors[index] : '#ffffff')
      );

    return this.isChangedData || (this.state.calculateRangeIndex !== state.calculateRangeIndex) ||
      this.state.selectedNames.length !== state.selectedNames.length;
  }

  public render() {
    return (
      <div>
        <ResponsiveContainer aspect={this.props.aspect === undefined ? 5 : this.props.aspect}>
          {this.prepareChart()}
        </ResponsiveContainer>
        {this.prepareRangeComponent()}
        <div style={{margin: '20px 0px 0 65px'}}>
          <TokensLegendList
            style={LegendStyle.LINE}
            columnCount={(this.props.legendColumnCount as ColumnCount) || 4}
            showCheckbox={this.props.showLegendCheckBox}
            onChangeNames={names => this.setState({selectedNames: names})}
            data={this.getNames().map((value, i) => new TokenLegend(value, TokensHelper.COLORS[i]))}
          />
        </div>
      </div>
    );
  }

  public abstract parseData(data: M): D[];

  public abstract getNames(): string[];

  protected prepareData(): any[] {
    if (this.props.isDebugMode) {
      return [];
    }

    if (this.isChangedData) {
      this.data = this.parseData(this.props.data);
      this.setState({calculateRangeIndex: {min: 0, max: (this.data.length - 1) || 1}});

      return [];
    }

    const min: number = (this.state.calculateRangeIndex as Range).min;
    const max: number = (this.state.calculateRangeIndex as Range).max;

    return min !== 0 && max !== 1 ? this.data.slice(min, max) : this.data;
  }

  private prepareChart() {
    switch (this.props.type) {
      case ChartType.LINES:
        return this.prepareLineChart();

      case ChartType.BAR_STACKED:
      case ChartType.BAR:
        return this.prepareBarChart(this.props.type);

      case ChartType.PIPE:
        return this.preparePipeChart();

      default:
        return this.prepareLineChart();
    }
  }

  private prepareLineChart(): any {
    return (
      <LineChart
        data={this.prepareData()}
        style={{
          zIndex: 1,
        }}
      >
        <CartesianGrid stroke="#e2e8f0" strokeOpacity="0.1" vertical={false}/>
        <XAxis
          dataKey="date"
          tick={<XAxisDate/>}
        />
        <YAxis
          allowDataOverflow={true}
          tick={<YAxisValue/>}
          allowDecimals={true}
          interval={'preserveStartEnd'}
          scale={this.props.applyScale === false ? undefined : 'log'}
          domain={['auto', 'auto']}
        />
        <Tooltip
          label={'date'}
          labelFormatter={value => DateUtils.toFormat(parseInt(value.toString(), 10), DateUtils.DATE_FORMAT_SHORT)}
        />
        {this.prepareLines()}
      </LineChart>
    );
  }

  private prepareBarChart(type?: ChartType): any {
    return (
      <BarChart
        data={this.prepareData()}
        style={{
          zIndex: 1,
        }}
      >
        <CartesianGrid stroke="#e2e8f0" strokeOpacity="0.1" vertical={false}/>
        <XAxis
          dataKey="date"
          tick={<XAxisDate/>}
          tickCount={1}
        />
        <YAxis
          minTickGap={1}
          tick={<YAxisValue/>}
          scale={this.props.applyScale === false ? undefined : 'log'}
          domain={['auto', 'auto']}
        />
        <Tooltip
          labelFormatter={value => DateUtils.toFormat(parseInt(value.toString(), 10), DateUtils.DATE_FORMAT_SHORT)}
        />
        {type === ChartType.BAR ? this.prepareBars() : this.prepareBarsStacked()}
      </BarChart>
    );
  }

  private preparePipeChart(): any {
    const data: any[] = this.prepareData();
    return (
      <PieChart
        style={{
          zIndex: 1,
        }}
      >
        <Pie
          dataKey="value"
          data={data}
          innerRadius={60}
          outerRadius={85}
        >
          {data.map((entry, index) => <Cell key={index} fill={this.props.colors[index]}/>)}
        </Pie>
      </PieChart>
    );
  }

  private prepareRangeComponent(): any {
    return this.props.showRange
      ? (
        <div style={{
          padding: '25px 50px 50px',
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
    return (this.state.selectedNames as string[])
      .map((value, index) => {
        return (
          <Line
            strokeWidth={2}
            type="monotone"
            key={value}
            dataKey={value}
            dot={false}
            stroke={this.colorByName.get(value) || '#ffffff'}
          />
        );
      });
  }

  private prepareBars(): any {
    return (this.state.selectedNames as string[])
      .map((value, index) => {
        return (
          <Bar
            key={value}
            dataKey={value}
            stackId={''}
            fill={this.colorByName.get(value) || '#ffffff'}
          />
        );
      });
  }

  private prepareBarsStacked(): any {
    return (this.state.selectedNames as string[])
      .map((value, index) => {
        return (
          <Bar
            key={value}
            dataKey={value}
            stackId={''}
            fill={this.colorByName.get(value) || '#ffffff'}
          />
        );
      });
  }

}
