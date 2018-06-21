import * as React from 'react';
import { TokenProportion } from '../../repository/models/TokenProportion';
import StepInteger from '../step-integer/StepInteger';
import AbstractHolder, { AbstractProperties } from './AbstractHolder';

export interface Properties extends AbstractProperties<TokenProportion> {
  disabled: boolean;

  onChangeProportion(name: string, value: number): void;
}

export class TokenProportionHolder extends AbstractHolder<Properties, TokenProportion, object> {

  public bindModel(model: TokenProportion): object {
    return (
      <div>
        <div>{model.name} weight:&nbsp;</div>
        <div>
          <StepInteger
            disabled={this.props.disabled}
            max={model.max}
            min={model.min}
            defaultValue={model.weight}
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
