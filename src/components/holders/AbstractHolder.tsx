import * as React from 'react';

export interface AbstractProperties<M> {
    model: M;
    onClick: Function | null;
    selected: boolean;
}

export interface AbstractState {
    selected: boolean;
}

export default abstract class AbstractHolder<P extends AbstractProperties<M>, M, S extends AbstractState>
    extends React.Component<P, S> {

    public componentWillMount() {
        this.setState({selected: this.props.selected});
    }

    public render() {
        return (
            <div
                onClick={() => {
                  if (this.props.onClick != null) {
                      this.props.onClick(this.props.model, this);
                  }
                }}
                className={this.state.selected ? 'active' : ''}
            >
                {this.bindModel(this.props.model)}
            </div>
        );
    }

    public abstract bindModel(model: M): object;

}
