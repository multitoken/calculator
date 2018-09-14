import { ListGridType } from 'antd/es/list';
import * as React from 'react';
import { Portfolio } from '../../../repository/models/Portfolio';
import { HistoryHolder } from '../../holders/history/HistoryHolder';
import AbstractList, { AbstractProperties } from '../AbstractList';
import './HistoryList.less';

interface Properties extends AbstractProperties<Portfolio> {
  onChangePortfolio(email: string, id: number): void;
}

export class HistoryList extends AbstractList<Properties, Portfolio, {}> {

  protected getGridType(): ListGridType | undefined {
    return {gutter: 1, column: 4};
  }

  protected getListName(): string {
    return 'HistoryList';
  }

  public bindHolder(dataItem: Portfolio, position: number): object {
    return (
      <HistoryHolder
        onChangePortfolio={(portfolio) => this.props.onChangePortfolio(portfolio.email, portfolio.id)}
        model={dataItem}
        key={position}
      />
    );
  }

}
