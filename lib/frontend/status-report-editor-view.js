import _ from 'underscore';
import Backbone from 'backbone';
import marked from 'marked';
import moment from 'moment';
import 'css-element-queries';
import 'epic-editor';

import ReadyView from './ready-view';
import * as models from './models';


const updateDelayMs = 200;


const defaultContent = `\
### What project are you working on?

* This will help us and future readers know what your status report is all
  about.


### What you accomplished this week

* Code you've written
* Mockups you've made
* Investigation into the code (tell us what you learned!)
* E-mails you sent out to mailing lists
* Reviews you've done of other students' code
* Anything else related to the project that you've done.


### Links to anything you've done this week

* Meeting minutes you took, if any.
* Team status reports you collected and posted, if any.
* Review requests you've posted or updated.
* Reviews you've done of other students' review requests, if any.
* Any Hackpad entries you've made or updated, if any.
* Any links you've found that were helpful for your research. (These may
  benefit other students as well!)

### What you plan to do next week

* Your tasks and time estimates. Be specific. A good skill to develop is to be
  able to make detailed plans and stick with them.


### What, if anything, is blocking you from making progress?

* Any errors you're hitting. (Please post any to Pastie.org and link them
  here.)
* Design problems.
* Confusion about the codebase or your project.
* Anything else.


### Any other questions

* Ask us anything and everything. We'll go through these questions during the
  team meeting.
`;


export default class StatusReportEditorView extends ReadyView {
    constructor(options) {
        options.className = 'status-report-editor content-inner';
        super(options);

        _.bindAll(this, '_onEditorChanged', '_onEditorResized');

        this._dueDateId = options.dueDateId;

        this._template = _.template(`
            <div class="panel panel-default">
                <div class="panel-heading">
                    Status Report for <%- date %>
                </div>
                <div class="editor-container">
                    <div class="editor-inner">
                        <div class="epic-editor"></div>
                    </div>
                </div>
                <div class="panel-footer">
                    <button id="save-button" type="button" class="btn btn-primary">Save</button>
                    <span class="save-status"></span>
                </div>
            </div>
            `);
    }

    events() {
        return {
            'click #save-button': '_onSaveButtonClicked'
        };
    }

    _render() {
        const myUserId = this.model.get('me').get('id');
        const dueDate = this.model.get('statusReportDueDates').get(this._dueDateId);
        // TODO: show an error if the due date is invalid
        this._report = this.model.get('statusReports').find(report =>
            report.get('date_due') === this._dueDateId &&
            report.get('user') === myUserId);

        if (this._report === undefined) {
            this._report = new models.StatusReport({
                date_due: this._dueDateId
            });
        }

        this.$el
            .empty()
            .html(this._template({
                date: dueDate.get('date').format('ddd, MMM D')
            }));

        this._$editorContainer = this.$('.editor-container');
        this._$editor = this.$('.epic-editor');
        this._unsaved = false;

        marked.setOptions({
            gfm: true,
            breaks: true,
            sanitize: true,
            smartLists: true,
            smartypants: true
        });
        this._editor = new EpicEditor({
            basePath: '/',
            clientSideStorage: false,
            container: this._$editor[0],
            file: {
                name: `epiceditor-${this._dueDateId}`,
                defaultContent: this._report.attributes.text || defaultContent
            },
            focusOnLoad: true,
            parser: marked,
            theme: {
                base: 'https://cdnjs.cloudflare.com/ajax/libs/epiceditor/0.2.2/themes/base/epiceditor.css',
                editor: 'https://cdnjs.cloudflare.com/ajax/libs/epiceditor/0.2.2/themes/editor/epic-dark.css',
                preview: 'css/preview.css'
            }
        }).load();

        this._editor.on('update', _.debounce(this._onEditorChanged, updateDelayMs));

        new ResizeSensor(this._$editorContainer[0],
                         _.debounce(this._onEditorResized, updateDelayMs));
        this._onEditorResized();

        window.addEventListener('beforeunload', (ev) => {
            if (this._unsaved) {
                const message = 'This status report has unsaved changes.';
                ev.returnValue = message;
                return message;
            }
        });
    }

    _onEditorResized() {
        /*
         * EpicEditor is kind of really stupid about fitting in to its
         * container. We therefore need to go through this nonsense.
         */
        this._$editor.css({
            width: this._$editorContainer.innerWidth(),
            height: this._$editorContainer.innerHeight()
        });
        this._editor.reflow();
    }

    _onEditorChanged() {
        const text = this._editor.exportFile();
        if (this._report.attributes.text !== text) {
            this._unsaved = true;

            this.$('.save-status')
                .finish()
                .removeClass('text-success')
                .addClass('text-warning')
                .text('There are unsaved changes.')
                .show();
        }
    }

    _onSaveButtonClicked() {
        const text = this._editor.exportFile();

        if (this._report.isNew()) {
            this._report = this.model.get('statusReports').create({
                date_due: this._dueDateId,
                date_submitted: moment(),
                text: text,
                user: this.model.get('me').get('id')
            });
        } else {
            // TODO: handle error case too
            this._report.save({
                text: text
            }, {
                success: () => {
                    this._unsaved = false;
                    this.$('.save-status')
                        .addClass('text-success')
                        .removeClass('text-warning')
                        .text('Saved!')
                        .show()
                        .delay(2000)
                        .fadeOut();
                }
            });
        }
    }
}
