// jshint ignore: start

import moment from 'moment';
import React from 'react';
import ReactMDE from 'react-mde';
import 'react-mde/lib/styles/css/react-mde-all.css';

import ToggleSwitch from './toggle-switch';
import * as models from './models';


export default class EditStatusReport extends React.Component {
    static defaultContent = dedent`
        This is an example template. Please replace all the bullet-points with your
        own status items.

        ### What project are you working on?

        * This will help us and future readers know what your status report is all
          about.


        ### This week I accomplished:

        Please include links to review requests, notes, etc.

        * Code you've written
        * Mockups you've made
        * Investigation into the code.
        * E-mails you sent out to mailing lists
        * Reviews you've done of other students' code
        * Anything else related to the project that you've done.


        ### This week I learned:

        * Learned about some part of the Review Board codebase? Some new language
          feature? Some feature of the web? Tell us about it!


        ### What I plan to do next week:

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

    constructor(props) {
        super(props);
        this.onModelReady = this.onModelReady.bind(this);
        this.onEditorChanged = this.onEditorChanged.bind(this);
        this.onSaveClicked = this.onSaveClicked.bind(this);

        this.state = {
            value: null,
            preview: false,
            unsaved: false,
        };
    }

    componentDidMount() {
        this.props.model.on('ready', this.onModelReady);
    }

    componentWillUnmount() {
        this.props.model.off('ready', this.onModelReady);
    }

    onModelReady() {
        this.forceUpdate();
    }

    onEditorChanged(value) {
        this.setState({
            value,
            unsaved: true,
        });
    }

    onSaveClicked(e) {
        e.stopPropagation()
        e.preventDefault();

        const { text } = this.state.value;

        if (this.report.isNew()) {
            this.report = this.props.model.get('statusReports').create({
                date_due: this.props.match.params.dueDateId,
                date_submitted: moment(),
                text: text,
                user: window.userId,
            }, {
                success: () => this.setState({ unsaved: false }),
            });
        } else {
            // TODO: handle error case
            this.report.save(
                { text },
                {
                    success: () => this.setState({ unsaved: false }),
                });
        }
    }

    render() {
        const { model, match } = this.props;

        if (!model.get('ready')) {
            return <div className="status-report-editor content-inner" />;
        }

        const dueDateId = match.params.dueDateId;
        const dueDate = model.get('statusReportDueDates').get(dueDateId);

        this.report = model.get('statusReports').findWhere({
            date_due: dueDateId,
            user: window.userId,
        });

        if (this.report === undefined) {
            this.report = new models.StatusReport({
                date_due: dueDateId,
            });
        }

        const mde_visibility = {
            textarea: !this.state.preview,
            preview: this.state.preview,
            previewHelp: false,
        };

        const mde_value = this.state.value || {
            text: this.report.get('text') || EditStatusReport.defaultContent,
            selection: null,
        };

        return (
            <div className="status-report-editor">
                <div className={`panel panel-default ${this.state.preview ? 'preview' : ''}`}>
                    <div className="panel-heading">
                        <span>Status report for {dueDate.get('date').format('ddd, MMM D')}</span>

                        <span className="text-warning">
                            {this.state.unsaved && 'There are unsaved changes'}
                        </span>
                        <ToggleSwitch
                            label="Preview"
                            checked={this.state.preview}
                            onChange={preview => this.setState({ preview })}
                        />
                        <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={this.onSaveClicked}>
                            Save
                        </button>
                    </div>
                    <div className="editor-container">
                        <ReactMDE
                            value={mde_value}
                            onChange={this.onEditorChanged}
                            visibility={mde_visibility}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
