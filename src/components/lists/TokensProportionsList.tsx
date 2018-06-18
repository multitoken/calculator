import * as React from 'react';
import { TokenProportion } from '../../repository/models/TokenProportion';
import { TokenProportionHolder } from '../holders/TokenProportionHolder';
import AbstractList, { AbstractProperties } from './AbstractList';

interface Properties extends AbstractProperties<TokenProportion> {
    onChangeProportion(name: string, value: number, position: number): void;
}

export class TokensProportionsList extends AbstractList<Properties, TokenProportion> {

    public bindHolder(dataItem: TokenProportion, position: number): object {
        return (
            <TokenProportionHolder
                onChangeProportion={(name, value) => this.props.onChangeProportion(name, value, position)}
                model={dataItem}
                key={position}
            />
        );
    }

}
