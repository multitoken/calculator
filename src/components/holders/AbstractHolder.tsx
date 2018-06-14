import * as React from 'react';

export interface AbstractProperties<M> {
  model: M;
  selected: boolean;
  onClick?(model: M, ctx: object): void;
}

export interface AbstractState {
  selected: boolean;
}

export default abstract class AbstractHolder <P extends AbstractProperties<M>, M, S extends AbstractState>
  extends React.Component<P, S> {

  public static defaultProps: Partial<AbstractProperties<any>> = {
    onClick: () => undefined,
  };

  public componentWillMount() {
    this.setState({selected: this.props.selected});
  }

  public render() {
    return (
      <div
        onClick={() => this.props.onClick && this.props.onClick(this.props.model, this)}
        className={this.state.selected ? 'active' : ''}
      >
        {this.bindModel(this.props.model)}
      </div>
    );
  }

  public abstract bindModel(model: M): object;

}
