// jshint ignore: start

import React from 'react';
import ReactDOM from 'react-dom';


class Confirm extends React.Component {
    render() {
        return (
            <React.Fragment>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button
                                type="button"
                                className="close"
                                id="close-button"
                                data-dismiss="modal"
                            >
                                <span className="fas fa-times"></span>
                            </button>
                            <h4 className="modal-title">{this.props.title}</h4>
                        </div>
                        <div className="modal-body">
                            {this.props.text}
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className={`btn ${this.props.cancelButtonClass}`}
                                id="cancel-button"
                                data-dismiss="modal"
                                onClick={this.props.onCancel}
                            >
                                {this.props.cancelButtonText}
                            </button>
                            <button
                                type="button"
                                className={`btn ${this.props.acceptButtonClass}`}
                                id="accept-button"
                                onClick={this.props.onAcceptClicked}
                            >
                                {this.props.acceptButtonText}
                            </button>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}


Confirm.defaultProps = {
    acceptButtonText: 'OK',
    cancelButtonText: 'Cancel',
    acceptButtonClass: 'btn-default',
    cancelButtonClass: 'btn-default',
}


export default function confirm(title, text, options) {
    const $target = $('<div class="modal fade">')
        .appendTo(document.body);

    const onAccept = () => {
        if (options.onAccept) {
            options.onAccept()
        }
        $target.modal('hide');
    };

    ReactDOM.render(
        <Confirm
            title={title}
            text={text}
            onAcceptClicked={onAccept}
            {...options}
        />,
        $target[0]);

    $target
        .modal()
        .on('hidden.bs.modal', () => {
            ReactDOM.unmountComponentAtNode($target[0]);
            $target.remove();
        });
}
