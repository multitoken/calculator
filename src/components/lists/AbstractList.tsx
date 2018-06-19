import { List } from 'antd';
import * as React from 'react';
import './AbstractList.css';

export interface AbstractProperties<M> {
  data: M[];
  bordered?: boolean;
}

export default abstract class AbstractList<P extends AbstractProperties<M>, M, S> extends React.Component<P, S> {

  public render() {
    return (
      <List
        bordered={this.props.bordered}
        itemLayout="horizontal"
        dataSource={this.props.data}
        renderItem={(item: M, index: number) => this.bindHolder(item, index)}
      />
    );
  }

  protected prepareEmptyList() {
    return <div className="">List is empty</div>;
  }

  // protected bindItems(): any {
  //   const {data} = this.props;
  //
  //   return data.map((value: any, index: number) => );
  // }

  public abstract bindHolder(dataItem: M, position: number): object;

}
