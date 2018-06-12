import * as React from 'react';
import AbstractList, { AbstractProperties } from './AbstractList';
import { TokenProportion } from '../../repository/models/TokenProportion';
import { TokenProportionHolder } from '../holders/TokenProportionHolder';

interface Properties extends AbstractProperties<TokenProportion> {
    onChangeProportion: Function;
}

export class TokensProportionsList extends AbstractList<Properties, TokenProportion> {

    public bindHolder(dataItem: TokenProportion, position: number): Object {
        return (
            <TokenProportionHolder
                onChangeProportion={(name, value) => this.props.onChangeProportion(name, value, position)}
                model={dataItem}
                onClick={null}
                key={position}
                selected={false}
            />
        );
    }

}
