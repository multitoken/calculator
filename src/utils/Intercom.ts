// /* tslint:disable */
import React from 'react';

const canUseDOM = !!((typeof window !== 'undefined' && window.document && window.document.createElement));
const wnd: any = window;

export interface Props {
  appId: string;
}

export class Intercom extends React.Component<Props, {}> {

  constructor(props: Props) {
    super(props);

    if (!this.props.appId || !canUseDOM) {
      return;
    }

    if (!wnd.Intercom) {
      ((w, d, id, x) => {

        function i() {
          (i as any).c(arguments);
        }

        (i as any).q = [];
        (i as any).c = (args: any) => {
          (i as any).q.push(args);
        };
        (w as any).Intercom = i;
        const s: any = d.createElement('script');
        s.async = 1;
        s.src = 'https://widget.intercom.io/widget/' + id;
        d.head.appendChild(s);
      })(window, document, this.props.appId);
    }

    wnd.intercomSettings = {app_id: this.props.appId};

    if (wnd.Intercom) {
      wnd.Intercom('boot');
    }
  }

  public componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any): void {
    if (!canUseDOM) {
      return;
    }

    wnd.intercomSettings = {app_id: nextProps.appId};

    if (wnd.Intercom) {
      wnd.Intercom('update');
    }
  }

  public shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<{}>, nextContext: any): boolean {
    return false;
  }

  public componentWillUnmount(): void {
    if (!canUseDOM || !wnd.Intercom) {
      return;
    }

    wnd.Intercom('shutdown');

    delete wnd.Intercom;
  }

  public render() {
    return null;
  }

}
