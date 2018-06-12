import * as React from 'react';
import ButtonGroup from 'reactstrap/lib/ButtonGroup';
import Button from 'reactstrap/lib/Button';

interface Properties {
    data: Map<string, boolean>;
    onCheck: Function;
}

export default class CheckButtonList extends React.Component<Properties, {}> {

    render() {
        return (
            <ButtonGroup>
                {this.bindItems()}
            </ButtonGroup>
        );
    }

    bindItems() {
        const data: Map<string, boolean> = this.props.data;
        const result: Array<Object> = [];
        let item: object;

        data.forEach((value: boolean, key: string) => {
            item = (
                <Button
                    key={key}
                    color="warning"
                    onClick={() => this.props.onCheck(key, !this.props.data.get(key))}
                    active={data.get(key)}
                >
                    {key}
                </Button>
            );

            result.push(item);
        });

        return result;
    }

}
