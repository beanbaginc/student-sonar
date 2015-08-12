import $ from 'jquery';
import _ from 'underscore';
import 'bootstrap';
import 'selectize';
import 'x-editable/dist/bootstrap3-editable/js/bootstrap-editable';


const SelectizeEditable = function(options) {
    options.selectize = options.selectize || {};
    this.init('selectize', options, SelectizeEditable.defaults);
};


$.fn.editableutils.inherit(SelectizeEditable, $.fn.editabletypes.abstractinput);


SelectizeEditable.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
    tpl: '<input type="hidden">',
    selectize: null,
    placeholder: null,
    source: null
});


$.extend(SelectizeEditable.prototype, {
    render: function() {
    },

    value2html: function(value, element) {
        // TODO
    },

    html2value: function(html) {
        // TODO
    },

    value2str: function(value) {
        return value;
    },

    str2value: function(str) {
        if (_.isFunction(str)) {
            str = str();
        }

        return str;
    },

    value2input: function(value) {
        this.$input.val(value);
        this.$input.selectize(this.options.selectize);
        this._selectize = this.$input[0].selectize;
    },

    input2value: function() {
        return this._selectize.getValue();
    },

    destroy: function() {
        this._selectize.destroy();
        this._selectize = null;
    }
});


$.fn.editabletypes.selectize = SelectizeEditable;
