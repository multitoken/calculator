import * as React from 'react';

export interface AbstractProperties<M> {
    data: M[];
    onItemClick?: Function;
    selectable?: boolean;
}

export default abstract class AbstractList<P extends AbstractProperties<M>, M> extends React.Component<P> {

    private selected: React.Component | undefined = undefined;

    public render() {
        return (
            <span>
                {(this.props.data.length > 0) ? this.bindItems() : this.prepareEmptyList()}
            </span>
        );
    }

    protected prepareEmptyList() {
        return <div className="text-white text-center">List is empty</div>;
    }

    protected bindItems(): any {
        const {data} = this.props;

        return data.map((value: any, index: number ) => this.bindHolder(value, index));
    }

    protected onClick(item: M, target: React.Component) {
        if (this.props.onItemClick) {
            this.props.onItemClick(item);
        }

        if (this.props.selectable) {
            if (this.selected !== undefined) {
                this.selected.setState({selected: false});
            }
            this.selected = target;
            this.selected.setState({selected: true});
        }
    }

    public abstract bindHolder(dataItem: M, position: number): Object;

}
