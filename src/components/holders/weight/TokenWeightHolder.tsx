import * as React from 'react';
import { Token } from '../../../repository/models/Token';
import { TokenWeight } from '../../../repository/models/TokenWeight';
import IcoDelete from '../../../res/icons/ico_delete.svg';
import IcoEdit from '../../../res/icons/ico_edit.svg';
import { DateUtils } from '../../../utils/DateUtils';
import AbstractHolder, { AbstractProperties } from '../AbstractHolder';
import './TokenWeightHolder.less';

export interface Properties extends AbstractProperties<TokenWeight> {
  onItemClick(model: TokenWeight, id: number): void;
}

export class TokenWeightHolder extends AbstractHolder<Properties, TokenWeight, object> {

  public static readonly HOLDER_ACTION_ID_DELETE: number = 1;
  public static readonly HOLDER_ACTION_ID_EDIT: number = 2;

  public bindModel(model: TokenWeight): object {
    return (
      <div className="TokenWeight__content">
        <div className="TokenWeight__content-data">
        <span className="TokenWeight__item-date">
          {DateUtils.toFormat(model.timestamp, DateUtils.DATE_FORMAT_SHORT)}
          </span>
          {this.prepareTokens(model)}
        </div>

        <div className="TokenWeight__content-actions">
          <div>
            <img
              style={{cursor: 'pointer'}}
              src={IcoDelete}
              alt="delete"
              onClick={e => this.props.onItemClick(model, TokenWeightHolder.HOLDER_ACTION_ID_DELETE)}
            />
          </div>
          <div>
            <img
              style={{cursor: 'pointer'}}
              src={IcoEdit}
              alt="edit"
              onClick={e => this.props.onItemClick(model, TokenWeightHolder.HOLDER_ACTION_ID_EDIT)}
            />
          </div>
        </div>
      </div>
    );
  }

  private prepareTokens(model: TokenWeight): any[] {
    return model.tokens.toArray().map((value: Token) => {
      return (
        <div key={value.name}>
          <span className="TokenWeight__item-key">{value.name}</span>
          <span className="TokenWeight__item-value">{value.weight}</span>
        </div>
      );
    });
  }

}
