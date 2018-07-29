// jshint ignore: start

import moment from 'moment';
import React from 'react';
import ReactMDE from 'react-mde';
import { connect } from 'react-redux';

import ToggleSwitch from './toggle-switch';
import { saveStatusReport } from './redux/modules/status-reports';


class EditStatusReport extends React.Component {
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

    render() {
        const {
            dueDate,
            model,
            match,
            statusReport,
        } = this.props;

        if (!statusReport) {
            return <div className="status-report-editor content-inner" />;
        }

        const mde_visibility = {
            textarea: !this.state.preview,
            preview: this.state.preview,
            previewHelp: false,
        };

        const mde_value = this.state.value || {
            text: statusReport.text || EditStatusReport.defaultContent,
            selection: null,
        };

        const onSaveClicked = () => {
            statusReport.text = this.state.value.text;
            this.props.onChange(statusReport);
            this.setState({ unsaved: false });
        };

        return (
            <div className="status-report-editor">
                <div className={`panel panel-default ${this.state.preview ? 'preview' : ''}`}>
                    <div className="panel-heading">
                        <span>Status report for {moment(dueDate.date).format('ddd, MMM D')}</span>

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
                            onClick={onSaveClicked}>
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


const mapStateToProps = (state, props) => {
    const {
        statusReportDueDates,
        statusReports,
        users,
    } = state;

    const dueDate = statusReportDueDates.items.find(
        dueDate => dueDate._id === props.match.params.dueDateId);

    let statusReport = null;

    if (dueDate && users.myUser) {
        statusReport = statusReports.items.find(report => (
            report.date_due === dueDate._id &&
            report.user === users.myUser._id))

        if (!statusReport) {
            statusReport = {
                date_due: dueDate._id,
                user: users.myUser._id,
            };
        }
    }

    return {
        dueDate,
        statusReport,
    }
};
const mapDispatchToProps = (dispatch, props) => ({
    onChange: statusReport => dispatch(saveStatusReport(statusReport)),
});
export default connect(mapStateToProps, mapDispatchToProps)(EditStatusReport);
