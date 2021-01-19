// jshint ignore: start

import compose from 'lodash.flowright';
import moment from 'moment';
import React from 'react';
import { graphql } from 'react-apollo';
import ReactMDE from 'react-mde';

import { EDIT_STATUS_REPORT_QUERY, saveStatusReport } from './api/status-report';
import ToggleSwitch from './toggle-switch';


const defaultContent = dedent`
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


@compose(
    graphql(EDIT_STATUS_REPORT_QUERY, {
        options: props => ({
            variables: {
                dateDue: props.match.params.dueDateId,
                user: window.userId,
            },
        }),
    }),
    saveStatusReport
)
export default class EditStatusReport extends React.Component {
    constructor(props) {
        super(props);
        this.onEditorChanged = this.onEditorChanged.bind(this);

        this.state = {
            value: null,
            preview: false,
            unsaved: false,
        };
    }

    onEditorChanged(value) {
        this.setState({
            value,
            unsaved: true,
        });
    }

    render() {
        const {
            data: {
                loading,
                error,
                statusReport,
            },
        } = this.props;

        if (loading) {
            return (
                <div className="spinner">
                    <span className="fas fa-sync fa-spin" />
                </div>
            );
        } else if (error) {
            return (
                <div>
                    <span className="fas fa-exclamation-triangle" />
                    {error}
                </div>
            );
        }

        const mdeVisibility = {
            textarea: !this.state.preview,
            preview: this.state.preview,
            previewHelp: false,
        };

        const mdeValue = this.state.value || {
            text: statusReport.text || defaultContent,
            selection: null,
        };

        const onSaveClicked = () => {
            this.props.mutate({
                variables: {
                    dateDue: statusReport.dateDue.id,
                    id: statusReport.id,
                    user: window.userId,
                    text: this.state.value ? this.state.value.text : '',
                },
            });
        };

        const unsaved = this.state.value === null || statusReport.text != this.state.value.text;

        return (
            <div className="status-report-editor">
                <div className={`panel panel-default ${this.state.preview ? 'preview' : ''}`}>
                    <div className="panel-heading">
                        <span>Status report for {moment(statusReport.dateDue.date).format('ddd, MMM D')}</span>

                        <span className="text-warning">
                            {unsaved && 'There are unsaved changes'}
                        </span>
                        <ToggleSwitch
                            label="Preview"
                            checked={this.state.preview}
                            onChange={preview => this.setState({ preview })}
                        />
                        <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={onSaveClicked}>
                            Save
                        </button>
                    </div>
                    <div className="editor-container">
                        <ReactMDE
                            value={mdeValue}
                            onChange={this.onEditorChanged}
                            visibility={mdeVisibility}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
