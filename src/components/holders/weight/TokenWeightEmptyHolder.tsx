import * as React from 'react';
import { TokenWeight } from '../../../repository/models/TokenWeight';
import './TokenWeightEmptyHolder.less';
import { TokenWeightHolder } from './TokenWeightHolder';

export class TokenWeightEmptyHolder extends TokenWeightHolder {

  public bindModel(model: TokenWeight): object {
    return (
      <div className="TokenWeightEmptyHolder__content" onClick={e => this.props.onItemClick(model, 0)}>
        <span>+</span>
      </div>
    );
  }

}
