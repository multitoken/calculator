import * as React from 'react';
import { TokenProportion } from '../../repository/models/TokenProportion';
import StepInteger from '../step-integer/StepInteger';
import AbstractHolder, { AbstractProperties } from './AbstractHolder';

export interface Properties extends AbstractProperties<TokenProportion> {
  onChangeProportion(name: string, value: number): void;
}

export class TokenProportionHolder extends AbstractHolder<Properties, TokenProportion, object> {

  public bindModel(model: TokenProportion): object {
    return (
      <>
      <div>{model.name} proportion:&nbsp;</div>
      <div>
        <StepInteger
          max={model.max}
          min={model.min}
          defaultValue={model.proportion}
          onAfterChange={value => this.onChangeProportion(model.name, value)}
        />
      </div>
      </>
    );
  }

  private onChangeProportion(name: string, value: number) {
    this.props.onChangeProportion(name, value);
  }

}
