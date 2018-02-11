import _ from 'underscore';


class SelectizeEditable extends $.fn.editabletypes.abstractinput {
    constructor(options) {
        super();
        this.init('selectize', options, SelectizeEditable.defaults);
        this._selectize = null;
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
        if (this._selectize) {
            return this._selectize.getValue();
        }
    }

    destroy() {
        if (this._selectize) {
            this._selectize.destroy();
            this._selectize = null;
        }
    }
}


SelectizeEditable.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
    tpl: '<input type="hidden">',
    selectize: null,
    placeholder: null,
    source: null
});


$.fn.editabletypes.selectize = SelectizeEditable;
