import ae from '../res/icons/tokens/ae.svg';
import bnb from '../res/icons/tokens/bnb.svg';
import btc from '../res/icons/tokens/btc.svg';
import eos from '../res/icons/tokens/eos.svg';
import eth from '../res/icons/tokens/eth.svg';
import icx from '../res/icons/tokens/icx.svg';
import omg from '../res/icons/tokens/omg.svg';
import trx from '../res/icons/tokens/trx.svg';
import usdt from '../res/icons/tokens/usdt.svg';
import ven from '../res/icons/tokens/ven.svg';
import zil from '../res/icons/tokens/zil.svg';
import zrx from '../res/icons/tokens/zrx.svg';

export class TokensHelper {

  public static readonly COLORS: string[] = [
    '#3294E4', '#50E3C2', '#FFD484', '#FF7658', '#8B572A', '#D7CB37', '#A749FA', '#3DD33E', '#4455E8',
    '#DF8519', '#F44A8B', '#E53737', '#A227BB', '#2D9D5C', '#D2FF84',
  ];

  private static readonly ICONS: Map<string, any> = new Map([
    ['USDT', usdt], ['Bitcoin', btc], ['Eth', eth], ['EOS', eos], ['Tron', trx], ['VeChain', ven],
    ['Binance', bnb], ['OmiseGO', omg], ['Icon', icx], ['Zilliqa', zil], ['Aeternity', ae], ['0x', zrx]
  ]);

  public static getIcon(name: string): any {
    return TokensHelper.ICONS.get(name) || usdt;
  }

  public static getColor(index: number): string {
    return TokensHelper.COLORS[Math.min(Math.max(0, index), TokensHelper.COLORS.length - 1)];
  }

}
