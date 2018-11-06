/* tslint:disable */

import { PreparedPortfolio } from '../entities/PreparedPortfolio';
import { TokenType } from '../manager/multitoken/PortfolioManagerImpl';

export class PreparedPortfoliosItems {
  // initial amount $10k
  public static readonly DATA: PreparedPortfolio[] = [
    new PreparedPortfolio(TokenType.DIFF_PERCENT_REBALANCE, ['Binance', 'Cardano', 'EOS', 'Tron'], 45),
    new PreparedPortfolio(TokenType.DIFF_PERCENT_REBALANCE, ['Binance', 'Cardano', 'EOS', 'Tron'], 75),
    new PreparedPortfolio(TokenType.DIFF_PERCENT_REBALANCE, ['Binance', 'Cardano', 'EOS', 'Tron'], 30),
    new PreparedPortfolio(TokenType.DIFF_PERCENT_REBALANCE, ['Binance', 'Cardano', 'EOS', 'Tron'], 15),
    new PreparedPortfolio(TokenType.DIFF_PERCENT_REBALANCE, ['Binance', 'Cardano', 'EOS', 'Tron'], 60),
    new PreparedPortfolio(TokenType.DIFF_PERCENT_REBALANCE, ['Binance', 'Cardano', 'EOS', 'Tron', 'NEO'], 45),
    new PreparedPortfolio(TokenType.DIFF_PERCENT_REBALANCE, ['Binance', 'Cardano', 'EOS', 'Tron', 'NEO'], 60),
    new PreparedPortfolio(TokenType.DIFF_PERCENT_REBALANCE, ['Binance', 'Cardano', 'EOS', 'Tron', 'NEO'], 75),
    new PreparedPortfolio(TokenType.DIFF_PERCENT_REBALANCE, ['Binance', 'Cardano', 'EOS', 'Tron', 'NEO'], 30),
    new PreparedPortfolio(TokenType.DIFF_PERCENT_REBALANCE, ['Binance', 'Cardano', 'EOS', 'Tron', 'NEO'], 15),
    new PreparedPortfolio(TokenType.DIFF_PERCENT_REBALANCE, ['0x', 'BAT', 'Status', 'Verge'], 15),
    new PreparedPortfolio(TokenType.DIFF_PERCENT_REBALANCE, ['0x', 'BAT', 'Status', 'Verge'], 30),
    new PreparedPortfolio(TokenType.DIFF_PERCENT_REBALANCE, ['0x', 'BAT', 'Status', 'Verge'], 60),
    new PreparedPortfolio(TokenType.DIFF_PERCENT_REBALANCE,
      ['Binance', 'Bitcoin', 'Cardano', 'Dash', 'EOS', 'Eth', 'Litecoin', 'Monero', 'NEO', 'Tron'],
      60),
    new PreparedPortfolio(TokenType.DIFF_PERCENT_REBALANCE,
      ['Binance', 'Bitcoin', 'Cardano', 'Dash', 'EOS', 'Eth', 'Litecoin', 'Monero', 'NEO', 'Tron'],
      75),
    new PreparedPortfolio(TokenType.DIFF_PERCENT_REBALANCE,
      ['Binance', 'Bitcoin', 'Cardano', 'Dash', 'EOS', 'Eth', 'Litecoin', 'Monero', 'NEO', 'Tron'],
      45),
    new PreparedPortfolio(TokenType.DIFF_PERCENT_REBALANCE,
      ['Binance', 'Bitcoin', 'Cardano', 'Dash', 'EOS', 'Eth', 'Litecoin', 'Monero', 'NEO', 'Tron'],
      30),
    new PreparedPortfolio(TokenType.DIFF_PERCENT_REBALANCE, ['Bitcoin', 'Dash', 'Eth', 'Litecoin', 'Monero'], 75),
    new PreparedPortfolio(TokenType.DIFF_PERCENT_REBALANCE, ['Bitcoin', 'Dash', 'Eth', 'Litecoin', 'Monero'], 60),
    new PreparedPortfolio(TokenType.DIFF_PERCENT_REBALANCE, ['Bitcoin', 'Cardano', 'EOS', 'Eth', 'Litecoin'], 75),
    new PreparedPortfolio(TokenType.DIFF_PERCENT_REBALANCE, ['Bitcoin', 'Cardano', 'EOS', 'Eth', 'Litecoin'], 60),
    new PreparedPortfolio(TokenType.DIFF_PERCENT_REBALANCE, ['Bitcoin', 'Cardano', 'EOS', 'Eth', 'Litecoin'], 45),
    new PreparedPortfolio(TokenType.DIFF_PERCENT_REBALANCE, ['Bitcoin', 'Cardano', 'EOS', 'Eth', 'Litecoin'], 30),
    new PreparedPortfolio(TokenType.DIFF_PERCENT_REBALANCE, ['Bitcoin', 'Cardano', 'EOS', 'Eth', 'Litecoin'], 15),
    new PreparedPortfolio(TokenType.DIFF_PERCENT_REBALANCE, ['Bitcoin', 'Dash', 'Eth', 'Litecoin', 'Monero'], 45),
    new PreparedPortfolio(
      TokenType.DIFF_PERCENT_REBALANCE, ['BitShares', 'Lisk', 'OmiseGO', 'Qtum', 'Stratis', 'Waltonchain'], 45
    )
  ];

}
