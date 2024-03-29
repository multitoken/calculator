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
      <div className="TokenWeightHolder__content">
        <div className="TokenWeightHolder__content-data">
        <span className="TokenWeightHolder__item-date">
          {DateUtils.toFormat(model.timestamp, DateUtils.DATE_FORMAT_SHORT)}
          </span>
          {this.prepareTokens(model)}
        </div>

        <div className="TokenWeightHolder__content-actions">
          <div className="TokenWeightHolder__content-actions__delete"
               onClick={e => this.props.onItemClick(model, TokenWeightHolder.HOLDER_ACTION_ID_DELETE)}
          >
            <img
              style={{cursor: 'pointer'}}
              src={IcoDelete}
              alt="delete"
            />
          </div>
          <div
            onClick={e => this.props.onItemClick(model, TokenWeightHolder.HOLDER_ACTION_ID_EDIT)}
          >
            <img
              style={{cursor: 'pointer'}}
              src={IcoEdit}
              alt="edit"
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
          <span className="TokenWeightHolder__item-key">{value.name}</span>
          <span className="TokenWeightHolder__item-value">{value.weight}</span>
        </div>
      );
    });
  }

}
