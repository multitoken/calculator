import * as React from 'react';
import './AbstractList.css';

export interface AbstractProperties<M> {
    data: M[];
}

export default abstract class AbstractList<P extends AbstractProperties<M>, M> extends React.Component<P> {

    public render() {
        return (
          <div className="AbstractList">
            {this.props.data.length > 0 ? this.bindItems() : this.prepareEmptyList()}
          </div>
        );
    }

    protected prepareEmptyList() {
        return <div className="text-white text-center">List is empty</div>;
    }

    protected bindItems(): any {
        const {data} = this.props;

        return data.map((value: any, index: number) => this.bindHolder(value, index));
    }

    public abstract bindHolder(dataItem: M, position: number): object;

}
