import { Modal, Progress } from 'antd';
import * as React from 'react';

export interface Properties {
  openDialog: boolean;
  percentProgress: number;
}

export class ProgressDialog extends React.Component<Properties, {}> {

  public render() {
    return (
      <Modal
        closable={false}
        className="text-center"
        footer={null}
        visible={this.props.openDialog}
      >
        {this.prepareProgressMessage()}
      </Modal>
    );
  }

  private prepareProgressMessage(): any {
    if (this.props.percentProgress < 100) {
      return (
        <div>
          <div className="mb-4"><b>Please wait until the end of the calculations</b></div>
          <Progress type="circle" percent={this.props.percentProgress}/>
        </div>
      );
    }

    return (
      <div>
        <p style={{fontSize: '25px'}}>Please wait few seconds.</p>
        <p><b>We setup data in charts...</b></p>
      </div>
    );
  }

}
