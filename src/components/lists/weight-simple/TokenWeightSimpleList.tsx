import * as React from 'react';
import { TokenWeight } from '../../../repository/models/TokenWeight';
import { TokenWeightSimpleHolder } from '../../holders/weight-simple/TokenWeightSimpleHolder';
import { TokenWeightList } from '../weight/TokenWeightList';
import './TokenWeightSimpleList.less';

export class TokenWeightSimpleList extends TokenWeightList {

  protected getItemLayout(): string | undefined {
    return 'vertical';
  }

  protected getListName(): string {
    return 'TokenWeightSimpleList';
  }

  public bindHolder(dataItem: TokenWeight, position: number): React.ReactNode {
    if (dataItem.isEmpty()) {
      return undefined;
    }

    return (
      <TokenWeightSimpleHolder
        model={dataItem}
        key={position}
      />
    );
  }

}
