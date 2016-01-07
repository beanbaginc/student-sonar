import $ from 'jquery';
import _ from 'underscore';
import marked from 'marked';
import 'x-editable/dist/bootstrap3-editable/js/bootstrap-editable';


const updateDelayMs = 200;


const EpicEditorEditable = function(options) {
    options.epicEditor = options.epicEditor || {};
    this.init('epic-editor', options, EpicEditorEditable.defaults);
};


$.fn.editableutils.inherit(EpicEditorEditable, $.fn.editabletypes.abstractinput);


EpicEditorEditable.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
    tpl: '<div/>',
    epicEditor: null,
    $parent: null,
    placeholder: null,
    source: null
});


$.extend(EpicEditorEditable.prototype, {
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
        marked.setOptions({
            gfm: true,
            breaks: true,
            sanitize: true,
            smartLists: true,
            smartypants: true
        });

        this._epicEditor = new EpicEditor(_.defaults({
            basePath: '/',
            clientSideStorage: false,
            container: this.$input[0],
            focusOnLoad: true,
            parser: marked,
            file: {
                name: _.uniqueId('epiceditor-'),
                defaultContent: value
            },
            theme: {
                base: 'https://cdnjs.cloudflare.com/ajax/libs/epiceditor/0.2.2/themes/base/epiceditor.css',
                editor: 'https://cdnjs.cloudflare.com/ajax/libs/epiceditor/0.2.2/themes/editor/epic-dark.css',
                preview: 'css/preview.css'
            }
        }, this.options.epicEditor));

        this._epicEditor.load();

        this._resizeHandler = _.debounce(_.bind(function() {
            this.$input.css('width', this.options.$parent.innerWidth());
            this._epicEditor.reflow();
        }, this), updateDelayMs);

        this._resizeHandler();
        window.addEventListener('resize', this._resizeHandler);
    },

    input2value: function() {
        return this._epicEditor.exportFile();
    },

    destroy: function() {
        this._epicEditor.unload();
        this._epicEditor = null;
        window.removeEventListener('resize', this._resizeHandler);
    }
});


$.fn.editabletypes.epicEditor = EpicEditorEditable;
