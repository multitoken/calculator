import { List } from 'antd';
import { ListGridType } from 'antd/lib/list';
import * as React from 'react';
import './AbstractList.less';

export interface AbstractProperties<M> {
  data: M[];
  bordered?: boolean;
  maxHeight?: string;
  split?: boolean;
}

export default abstract class AbstractList<P extends AbstractProperties<M>, M, S> extends React.Component<P, S> {

  public render() {
    return (
      <div
        className={
          this.props.bordered
            ? `AbstractList__content-bordered ${this.getListName()}__content`
            : `AbstractList__content ${this.getListName()}__content`
        }
        style={{maxHeight: this.props.maxHeight}}
      >
        <div>
          <List
            split={this.props.split === true}
            grid={this.getGridType()}
            dataSource={this.getData()}
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

  protected getData(): M[] {
    return this.props.data;
  }

  protected getGridType(): ListGridType | undefined {
    return undefined;
  }

  protected getItemLayout(): string | undefined {
    return 'vertical';
  }

  protected abstract getListName(): string;

  protected abstract bindHolder(dataItem: M, position: number): React.ReactNode;

}
