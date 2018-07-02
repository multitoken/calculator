import { Col, Row } from 'antd';
import * as React from 'react';
import { TokenProportion } from '../../repository/models/TokenProportion';
import StepInteger from '../step-integer/StepInteger';
import AbstractHolder, { AbstractProperties } from './AbstractHolder';
import './TokenProportionHolder.less';

export interface Properties extends AbstractProperties<TokenProportion> {
  disabled: boolean;

  onChangeProportion(name: string, value: number): void;
}

interface State {
  value: number;
}

export class TokenProportionHolder extends AbstractHolder<Properties, State, TokenProportion> {

  constructor(props: Properties) {
    super(props);
    this.state = {
      weight: this.props.model.weight
    };
  }

  public bindModel(model: TokenProportion): object {
    return (
      <div style={{width: '100%'}}>
        <div>
          <Row>
            <Col className="TokenProportion__title" span={12}>{model.name} weight:</Col>
            <Col className="TokenProportion__value" span={12}>{this.state.weight}</Col>
          </Row>
        </div>
        <div>
          <StepInteger
            disabled={this.props.disabled}
            max={model.max}
            min={model.min}
            defaultValue={model.weight}
            onChange={value => this.setState({weight: value})}
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
