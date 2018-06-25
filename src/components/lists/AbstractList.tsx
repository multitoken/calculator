import { List } from 'antd';
import * as React from 'react';
import './AbstractList.less';

export interface AbstractProperties<M> {
  data: M[];
  bordered?: boolean;
  maxHeight?: string;
}

export default abstract class AbstractList<P extends AbstractProperties<M>, M, S> extends React.Component<P, S> {

  public render() {
    return (
      <div
        className={this.props.bordered ? 'AbstractList__content-bordered' : ''}
        style={{maxHeight: this.props.maxHeight}}
      >
        <div>
          <List
            itemLayout="horizontal"
            dataSource={this.props.data}
            renderItem={(item: M, index: number) => this.bindHolder(item, index)}
          />
        </div>
      </div>
    );
  }

  protected prepareEmptyList() {
    return <div className="">List is empty</div>;
  }

  public abstract bindHolder(dataItem: M, position: number): object;

}
