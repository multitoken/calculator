import { Modal, Spin } from 'antd';
import * as React from 'react';

export interface Properties {
  openDialog: boolean;
  message: string;
}

export class LoadingDialog extends React.Component<Properties, {}> {

  public render() {
    return (
      <Modal
        closable={false}
        className="text-center"
        footer={null}
        visible={this.props.openDialog}
      >
        <div>
          <div className="mb-4"><b>{this.props.message}</b></div>
          <Spin size="large"/>
        </div>
      </Modal>
    );
  }

}
