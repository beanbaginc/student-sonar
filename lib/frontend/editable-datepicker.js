import moment from 'moment';
import 'bootstrap';
import 'bootstrap-datepicker';
import 'x-editable/dist/bootstrap3-editable/js/bootstrap-editable';
import './editable-defs';


class DatePickerEditable extends $.fn.editabletypes.abstractinput {
    constructor(options) {
        super();
        this.init('datepicker', options, DatePickerEditable.defaults);
    }

    render() {
        const options = {
            autoclose: true,
            format: 'yyyy-mm-dd',
            orientation: 'bottom left',
        };

        if (this.options.datepicker) {
            Object.assign(options, this.options.datepicker);
        }

        this.$input.datepicker(options);
    }

    value2html(value, element) {
        if (!value) {
            $(element).empty();
        } else {
            $(element).text(value);
        }
    }

    html2value(html) {
        return moment(html);
    }

    value2str(value) {
        if (value) {
            return value.format('YYYY-MM-DD');
        } else {
            return '';
        }
    }

    str2value(str) {
        return moment(str);
    }

    value2input(value) {
        this.$input.datepicker('update', value.toDate());
    }

    input2value() {
        return moment(this.$input.datepicker('getDate'));
    }

    activate() {
        this.$input.datepicker('show');
    }
}


DatePickerEditable.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
    datepicker: {},
    inputclass: '',
    tpl: '<input type="text" class="form-control input-sm" size="10">'
});


$.fn.editabletypes.datepicker = DatePickerEditable;
