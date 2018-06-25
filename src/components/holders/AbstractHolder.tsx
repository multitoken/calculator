import * as React from 'react';

export interface AbstractProperties<M> {
  model: M;
}

export default abstract class AbstractHolder<P extends AbstractProperties<M>, S, M>
  extends React.Component<P, any> {

  public render() {
    return this.bindModel(this.props.model);
  }

  protected abstract bindModel(model: M): object;

}
