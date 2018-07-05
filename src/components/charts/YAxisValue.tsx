import * as React from 'react';
import './YAxisValue.less';

export class YAxisValue extends React.Component<any, {}> {

  public render() {
    const {x, y, payload} = this.props;
    return (
      <text
        className="YAxisValue__text"
        x={x}
        y={y}
        dy={6}
        fill={'#90a8bc'}
        textAnchor="end"
      >
        {parseFloat(parseFloat(payload.value).toFixed(6)).toLocaleString()}
      </text>
    );
  }

}
