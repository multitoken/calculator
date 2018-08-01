/* tslint:disable */

export class FakeRebalanceData {
  // initial amount $10k
  //coins,[cap with,cap without,Arbitrage count,totalArbiterProfit,totalEthFee]]
  public static readonly DATA: Map<string, number[]> = new Map([
    ['Eth/Eth Classic/Verge/Waltonchain',[24899, 20161, 14873, 1156.996, 15976]],
    ['BAT/Cardano/Status',[18496, 14234, 8414, 2219.683, 9063]],
    ['BAT/Populous/Verge/Waltonchain',[22898, 18773, 21667, 47643.958, 24095]],
    ['Bitcoin/Eth Classic/Status',[19728, 15820, 6044, 353.939, 6272]],
    ['BitShares/Populous/Status',[13439, 9683, 11525, 60707.474, 12705]],
    ['Populous/Verge/Waltonchain',[23343, 19770, 21123, 62934.545, 24635]],
    ['0x/Dash/Waltonchain',[19600, 16083, 11296, 29860.675, 11777]],
    ['Dash/Litecoin/Status',[17651, 14310, 6789, 29489.555, 6906]],
    ['Dash/Eth Classic/OmiseGO/Waltonchain',[13578, 10356, 8032, 23901.289, 7653]],
    ['EOS/Verge/Zcash',[37480, 34517, 13673, 1640.115, 16110]],
    ['BitShares/Cardano/Eth Classic/Populous',[11521, 8857, 9857, 41223.298, 10071]],
    ['BAT/Eth/Eth Classic/NEO',[17264, 14638, 6035, 308.771, 5599]],
    ['Cardano/Monero/OmiseGO/Waltonchain',[13807, 11182, 7946, 1748.497, 8069]],
    ['NEO/Status/Zcash',[15649, 13056, 6827, 404.014, 7065]],
    ['BAT/Eth Classic/NEO/OmiseGO',[16120, 13576, 6874, 350.679, 6487]],
  ]);
}
