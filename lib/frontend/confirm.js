import _ from 'underscore';
import $ from 'jquery';
import Backbone from 'backbone';


export default class Confirm {
    constructor(header_text, confirm_text, options) {
        _.extend(this, Backbone.Events);

        options = options || {};

        const template = _.template(`
            <div class="modal fade">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" id="close-button" data-dismiss="modal">
                                <span class="fa fa-close"></span>
                            </button>
                            <h4 class="modal-title">
                                <%= header_text %>
                            </h4>
                        </div>
                        <div class="modal-body">
                            <%= confirm_text %>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn <%= cancel_button_class %>" id="cancel-button" data-dismiss="modal">
                                <%= cancel_button_text %>
                            </button>
                            <button type="button" class="btn <%= accept_button_class %>" id="accept-button">
                                <%= accept_button_text %>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            `);

        const $el = $(template(_.defaults(options, {
            header_text: header_text,
            confirm_text: confirm_text,
            accept_button_text: 'OK',
            cancel_button_text: 'Cancel',
            accept_button_class: 'btn-default',
            cancel_button_class: 'btn-default'
        })));

        $('body').append($el);

        $el
            .modal()
            .on('hidden.bs.modal', function() {
                $el.remove();
            }.bind(this));

        $el.find('#close-button').click(function() {
            this.trigger('cancel');
            return true;
        }.bind(this));

        $el.find('#cancel-button').click(function() {
            this.trigger('cancel');
            return true;
        }.bind(this));

        $el.find('#accept-button').click(function() {
            this.trigger('accept');
            $el.modal('hide');
            return false;
        }.bind(this));
    }
}
