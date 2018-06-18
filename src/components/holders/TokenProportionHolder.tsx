import * as React from 'react';
import { TokenProportion } from '../../repository/models/TokenProportion';
import StepInteger from '../step-integer/StepInteger';
import AbstractHolder, { AbstractProperties, AbstractState } from './AbstractHolder';

export interface Properties extends AbstractProperties<TokenProportion> {
  onChangeProportion(name: string, value: number): void;
}

// export interface State extends AbstractState {
// }

export class TokenProportionHolder extends AbstractHolder<Properties, TokenProportion, AbstractState> {

  constructor(prop: Properties) {
    super(prop);

    this.state = {
      selected: false,
    };
  }

  public bindModel(model: TokenProportion): object {
    return (
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'flex-start',
          width: 500,
        }}
      >
        <div>{model.name} proportion:&nbsp;</div>
        <div
          style={{
            flexGrow: 1,
          }}
        >
          <StepInteger
            max={model.max}
            min={model.min}
            defaultValue={model.proportion}
            onAfterChange={value => this.onChangeProportion(model.name, value)}
          />
        </div>
      </div>
    );
  }

  private onChangeProportion(name: string, value: number) {
    this.props.onChangeProportion(name, value);
  }

}
