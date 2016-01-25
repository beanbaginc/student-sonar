import $ from 'jquery';
import _ from 'underscore';
import 'bootstrap';
import 'selectize';
import 'x-editable/dist/bootstrap3-editable/js/bootstrap-editable';
import './editable-defs';


class SelectizeEditable extends $.fn.editabletypes.abstractinput {
    constructor(options) {
        super();
        this.init('selectize', options, SelectizeEditable.defaults);
    }

    value2str(value) {
        return value;
    }

    str2value(str) {
        if (_.isFunction(str)) {
            str = str();
        }

        return str;
    }

    value2input(value) {
        this.$input.val(value);
        this.$input.selectize(this.options.selectize);
        this._selectize = this.$input[0].selectize;
    }

    input2value() {
        return this._selectize.getValue();
    }

    destroy() {
        this._selectize.destroy();
        this._selectize = null;
    }
}


SelectizeEditable.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
    tpl: '<input type="hidden">',
    selectize: null,
    placeholder: null,
    source: null
});


$.fn.editabletypes.selectize = SelectizeEditable;
