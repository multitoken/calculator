import * as React from 'react';
import { InputGroup, InputGroupAddon } from 'reactstrap';
import Input from 'reactstrap/lib/Input';
import InputGroupText from 'reactstrap/lib/InputGroupText';
import { TokenProportion } from '../../repository/models/TokenProportion';
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
            <div>
                <InputGroup>
                    <InputGroupAddon addonType="prepend">
                            <InputGroupText>{model.name} Proportion:</InputGroupText>
                    </InputGroupAddon>
                    <Input
                        value={model.proportion}
                        onChange={e => this.onChangeProportion(model.name, parseInt(e.target.value, 0))}
                        type="range"
                        step={1}
                        min={model.min}
                        max={model.max}
                    />
                    <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                            <span className="col-1">
                            {model.proportion}
                            </span>
                        </InputGroupText>
                    </InputGroupAddon>
                </InputGroup>
            </div>
        );
    }

    private onChangeProportion(name: string, value: number) {
        this.props.onChangeProportion(name, value);
    }

}
