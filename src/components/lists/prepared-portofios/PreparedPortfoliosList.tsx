import * as React from 'react';
import { PreparedPortfolio } from '../../../entities/PreparedPortfolio';
import { PreparedPortfolioHolder } from '../../holders/prepared-portfolio/PreparedPortfolioHolder';
import './PreparedPortfoliosList.less';

interface Properties {
  items: PreparedPortfolio[];

  onPortfolioClick(portfolio: PreparedPortfolio): void;
}

export class PreparedPortfoliosList extends React.Component<Properties, {}> {

  public render() {
    return (
      <div className="PreparedPortfolios__content">
        {this.prepareItems()}
      </div>
    );
  }

  private prepareItems(): React.ReactNode {
    return this.props.items
      .map((item: PreparedPortfolio, index: number) => this.bindHolder(item, index));
  }

  private bindHolder(dataItem: PreparedPortfolio, position: number): object {
    return (
      <PreparedPortfolioHolder
        model={dataItem}
        position={position}
        key={position}
        onItemClick={(model) => this.props.onPortfolioClick(model)}
      />
    );
  }

}
