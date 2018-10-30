// https://ant.design/components/grid
export enum ScreenSizes {
  XXS = 320, // ≤ iPhone 5s/SE
  XS = 576, // <
  SM = 576, // ≥
  MD = 768, // ≥
  LG = 992, // ≥
  XL = 1200, // ≥
  XXL = 1600, // ≥
}

export class ScreenUtils {

  public static readonly documentElement = (document.documentElement as HTMLElement);

  public static readonly viewPortWidth: number =
    Math.max(ScreenUtils.documentElement.clientWidth, window.innerWidth || 0);

  public static readonly getViewPortHeight: number =
    Math.max(ScreenUtils.documentElement.clientHeight, window.innerHeight || 0);

  public static readonly isIPhone: boolean = navigator.userAgent.includes('iPhone');
  public static readonly isIPad = navigator.userAgent.includes('iPad');
  public static readonly isAndroid = navigator.userAgent.includes('Android');
  public static readonly isIOS = ScreenUtils.isIPhone || ScreenUtils.isIPad;
  public static readonly isMobile = ScreenUtils.isIOS || ScreenUtils.isAndroid;

}
