import { Modal } from 'antd';
import * as React from 'react';

export interface Properties {
  openDialog: boolean;
}

export class MessageDialog extends React.Component<Properties, {}> {

  public render() {
    return (
      <Modal
        closable={false}
        className="text-center"
        footer={null}
        visible={this.props.openDialog}
      >
        <div>
          <p style={{fontSize: '25px', color: 'white'}}>Please wait few seconds.</p>
          <p><b>We setup data in charts...</b></p>
        </div>
      </Modal>
    );
  }

}
