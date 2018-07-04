import * as React from 'react';
import './YAxisValue.less';

export class YAxisValue extends React.Component<any, {}> {

  public render() {
    const {x, y, payload} = this.props;
    console.log(this.props);
    return (

      <text
        className="YAxisValue__text"
        x={x}
        y={y}
        dy={6}
        fill={'#90a8bc'}
        textAnchor="end"
      >
        {payload.value}
      </text>
    );
  }

}
