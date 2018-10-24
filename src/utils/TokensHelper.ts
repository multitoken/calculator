import ada from '../res/icons/tokens/ada.svg';
import ae from '../res/icons/tokens/ae.svg';
import bat from '../res/icons/tokens/bat.svg';
import bcc from '../res/icons/tokens/bcc.svg';
import bcd from '../res/icons/tokens/bcd.svg';
import bcn from '../res/icons/tokens/bcn.svg';
import bnb from '../res/icons/tokens/bnb.svg';
import btc from '../res/icons/tokens/btc.svg';
import btg from '../res/icons/tokens/btg.svg';
import bts from '../res/icons/tokens/bts.svg';
import dash from '../res/icons/tokens/dash.svg';
import eng from '../res/icons/tokens/eng.svg';
import eos from '../res/icons/tokens/eos.svg';
import etc from '../res/icons/tokens/etc.svg';
import eth from '../res/icons/tokens/eth.svg';
import gnt from '../res/icons/tokens/gnt.svg';
import hsr from '../res/icons/tokens/hsr.svg';
import icx from '../res/icons/tokens/icx.svg';
import iost from '../res/icons/tokens/iost.svg';
import iota from '../res/icons/tokens/iota.svg';
import lsk from '../res/icons/tokens/lsk.svg';
import ltc from '../res/icons/tokens/ltc.svg';
import nano from '../res/icons/tokens/nano.svg';
import neo from '../res/icons/tokens/neo.svg';
import npxs from '../res/icons/tokens/npxs.svg';
import omg from '../res/icons/tokens/omg.svg';
import ont from '../res/icons/tokens/ont.svg';
import ppt from '../res/icons/tokens/ppt.svg';
import qtum from '../res/icons/tokens/qtum.svg';
import rep from '../res/icons/tokens/rep.svg';
import sc from '../res/icons/tokens/sc.svg';
import snt from '../res/icons/tokens/snt.svg';
import steem from '../res/icons/tokens/steem.svg';
import strat from '../res/icons/tokens/strat.svg';
import trx from '../res/icons/tokens/trx.svg';
import usdt from '../res/icons/tokens/usdt.svg';
import ven from '../res/icons/tokens/ven.svg';
import wan from '../res/icons/tokens/wan.svg';
import waves from '../res/icons/tokens/waves.svg';
import wtc from '../res/icons/tokens/wtc.svg';
import xem from '../res/icons/tokens/xem.svg';
import xlm from '../res/icons/tokens/xlm.svg';
import xmr from '../res/icons/tokens/xmr.svg';
import xrp from '../res/icons/tokens/xrp.svg';
import xvg from '../res/icons/tokens/xvg.svg';
import zec from '../res/icons/tokens/zec.svg';
import zil from '../res/icons/tokens/zil.svg';
import zrx from '../res/icons/tokens/zrx.svg';

export class TokensHelper {

  public static readonly COLORS: string[] = [
    '#3294E4', '#50E3C2', '#FFD484', '#FF7658', '#8B572A', '#D7CB37', '#A749FA', '#3DD33E', '#4455E8',
    '#DF8519', '#F44A8B', '#E53737', '#A227BB', '#2D9D5C', '#D2FF84', '#DA50A5', '#D260F9', '#9054E0', '#6052F6',
    '#E94260', '#C76246', '#F5BFA2', '#0C5BB0', '#A02F2A', '#7795A4', '#F0D258', '#E5AE90', '#986755', '#82EB38',
    '#D18978', '#F1B18E', '#4DA59F', '#DC487E', '#999999', '#ED7770', '#E87334', '#C7483C', '#F6D390', '#DBDFE3',
    '#818181', '#B9B421', '#AAF592', '#8252AD', '#6E5935', '#39F075',
  ];

  private static readonly ICONS: Map<string, any> = new Map([
    ['USDT', usdt], ['Bitcoin', btc], ['Eth', eth], ['EOS', eos], ['Tron', trx], ['VeChain', ven],
    ['Binance', bnb], ['OmiseGO', omg], ['Icon', icx], ['Zilliqa', zil], ['Aeternity', ae], ['0x', zrx],
    ['Populous', ppt], ['Hshare', hsr], ['IOST', iost], ['Monero', xmr], ['Dash', dash],
    ['Eth Classic', etc], ['NEM', xem], ['Zcash', zec], ['Qtum', qtum], ['Bytecoin', bcn], ['Lisk', lsk],
    ['BitShares', bts], ['Ontology', ont], ['BTC Gold', btg], ['Siacoin', sc], ['Steem', steem],
    ['Verge', xvg], ['Nano', nano], ['BAT', bat], ['Augur', rep], ['BTC Diamond', bcd], ['Golem', gnt],
    ['Pundi X', npxs], ['Stratis', strat], ['Waves', waves], ['Waltonchain', wtc], ['Status', snt],
    ['Wanchain', wan], ['Stellar', xlm], ['NEO', neo], ['Litecoin', ltc], ['Cardano', ada],
    ['Ripple', xrp], ['BTC Cash', bcc], ['IOTA', iota], ['Enigma', eng]
  ]);

  private static readonly SYMBOLS: Map<string, string> = new Map([
    ['USDT', 'USDT'], ['Bitcoin', 'BTC'], ['Eth', 'ETH'], ['EOS', 'EOS'], ['Tron', 'TRX'],
    ['Binance', 'BNB'], ['OmiseGO', 'OMG'], ['0x', 'ZRX'], ['Monero', 'XMR'], ['Dash', 'DASH'],
    ['Eth Classic', 'ETC'], ['Zcash', 'ZEC'], ['Qtum', 'QTUM'], ['Lisk', 'LSK'], ['BitShares', 'BTS'],
    ['BTC Gold', 'BTG'], ['Verge', 'XVG'], ['BAT', 'BAT'], ['Stratis', 'STRAT'], ['Waltonchain', 'WTC'],
    ['Status', 'SNT'], ['NEO', 'NEO'], ['Litecoin', 'LTC'], ['Cardano', 'ADA'], ['Ripple', 'XRP'],
    ['BTC Cash', 'BCC'], ['IOTA', 'IOTA'], ['Enigma', 'ENG']
  ]);

  public static getIcon(name: string): any | undefined {
    return TokensHelper.ICONS.get(name) || undefined;
  }

  public static getSymbol(name: string): string {
    return TokensHelper.SYMBOLS.get(name) || '';
  }

  public static getColor(index: number): string {
    return TokensHelper.COLORS[Math.min(Math.max(0, index), TokensHelper.COLORS.length - 1)];
  }

}
