import { Checkbox } from 'antd';
import * as React from 'react';
import { TokenItemEntity } from '../../../entities/TokenItemEntity';
import AbstractHolder, { AbstractProperties } from '../AbstractHolder';
import './TokenNameHolder.less';

export interface Properties extends AbstractProperties<TokenItemEntity> {
  checked: boolean;

  onItemClick(model: TokenItemEntity): void;
}

export class TokenNameHolder extends AbstractHolder<Properties, {}, TokenItemEntity> {

  public bindModel(model: TokenItemEntity): object {
    return (
      <div className="TokenNameHolder__content" onClick={e => this.props.onItemClick(model)}>
        {this.prepareImage(model.icon)}
        <span className={this.props.checked ? 'TokenNameHolder__name__checked' : 'TokenNameHolder__name'}>
          {model.name}
        </span>
        <Checkbox className="TokenNameHolder__checkbox" checked={this.props.checked}/>
      </div>
    );
  }

  private prepareImage(icon: any): React.ReactNode {
    if (icon) {
      return <img className="TokenNameHolder__icon" src={icon}/>;
    }

    return <div className="TokenNameHolder__icon-box"><span className="TokenNameHolder__icon_empty"/></div>;
  }
}
