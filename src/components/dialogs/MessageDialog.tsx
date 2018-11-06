import { Modal } from 'antd';
import * as React from 'react';

export interface Properties {
  openDialog: boolean;
  title: string;
  message: string;
}

export class MessageDialog extends React.Component<Properties, {}> {

  public render() {
    return (
      <Modal
        className="text-center"
        visible={this.props.openDialog}
      >
        <div>
          <p style={{fontSize: '25px', color: 'white'}}>{this.props.title}</p>
          <p><b>{this.props.message}</b></p>
        </div>
      </Modal>
    );
  }

}
