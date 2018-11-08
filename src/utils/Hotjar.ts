// /* tslint:disable */
import React from 'react';

const canUseDOM = !!((typeof window !== 'undefined' && window.document && window.document.createElement));
const wnd: any = window;

export interface Props {
  appId: string;
}

export class Hotjar extends React.Component<Props, {}> {

  constructor(props: Props) {
    super(props);

    if (!this.props.appId || !canUseDOM) {
      return;
    }

    if (!wnd.Hotjar) {
      ((h, o, t, j) => {

        const wndHj: any = (h as any).hj;

        (h as any).hj = wndHj || function i() {
          (wndHj.q = wndHj.q || []).push(arguments);
        };

        (h as any).Hotjar = (h as any).hj;

        (h as any)._hjSettings = {hjid: this.props.appId, hjsv: 6};

        const a: any = o.getElementsByTagName('head')[0];
        const s: any = o.createElement('script');
        s.async = 1;
        s.src = t + (h as any)._hjSettings.hjid + j + (h as any)._hjSettings.hjsv;
        a.appendChild(s);
      })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
    }
  }

  public componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any): void {
    console.log('can use dom', !canUseDOM);
    if (!canUseDOM) {
      return;
    }

    wnd._hjSettings = {hjid: nextProps.appId, hjsv: 6};
  }

  public shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<{}>, nextContext: any): boolean {
    return false;
  }

  public componentWillUnmount(): void {
    if (!canUseDOM || !wnd.Hotjar) {
      return;
    }

    delete wnd.Hotjar;
  }

  public render() {
    return null;
  }

}
