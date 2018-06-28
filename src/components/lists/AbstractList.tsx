import { List } from 'antd';
import { ListGridType } from 'antd/lib/list';
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
        className={this.props.bordered ? 'AbstractList__content-bordered' : 'AbstractList__content'}
        style={{maxHeight: this.props.maxHeight}}
      >
        <div>
          <List
            grid={this.getGridType()}
            dataSource={this.props.data}
            renderItem={(item: M, index: number) => {
              return (
                <List.Item>
                  {this.bindHolder(item, index)}
                </List.Item>
              );
            }}
          />
        </div>
      </div>
    );
  }

  protected getGridType(): ListGridType | undefined {
    return undefined;
  }

  protected abstract bindHolder(dataItem: M, position: number): object;

}
