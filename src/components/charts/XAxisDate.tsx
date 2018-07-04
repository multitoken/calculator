import * as React from 'react';
import { DateUtils } from '../../utils/DateUtils';
import './XAxisDate.less';

export class XAxisDate extends React.Component<any, {}> {

  public render() {
    const {x, y, payload} = this.props;
    const date: object = new Date(payload.value);

    return (
      <text
        className="XAxisDate__text"
        x={x}
        y={y}
        dy={10}
        textAnchor="middle"
        fill={'#ffffff'}
      >
        <tspan x={x}>{DateUtils.toFormat(date, DateUtils.FORMAT_MMM_DD)}</tspan>
        <tspan x={x} dy="15">{DateUtils.toFormat(date, DateUtils.FORMAT_YYYY_HH)}</tspan>
      </text>
    );
  }

}
