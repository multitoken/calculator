import * as React from 'react';
import './YAxisValue.less';

export class YAxisValue extends React.Component<any, {}> {

  public render() {
    const {x, y, payload} = this.props;
    const formattedValue: string = parseFloat(parseFloat(payload.value).toFixed(6)).toLocaleString();
    const fontSize: number = Math.max(8, Math.min(13, 13 - (formattedValue.length - 7)));

    return (
      <text
        fontSize={fontSize}
        className={'YAxisValue__text'}
        x={x}
        y={y}
        dy={6}
        fill={'#90a8bc'}
        textAnchor="end"
      >
        {formattedValue}
      </text>
    );
  }

}
