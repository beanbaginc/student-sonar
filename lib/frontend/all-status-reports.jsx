// jshint ignore: start

import moment from 'moment';
import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import _ from 'underscore';

import Confirm from './confirm';
import Editable from './editable';
import {intersectionExists} from './util';


class RowView extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.onDeleteClicked = this.onDeleteClicked.bind(this);
    }

    componentDidMount() {
        this.props.model.on('change', this.handleChange);
    }

    componentWillUnmount() {
        this.props.model.off('change', this.handleChange);
    }

    handleChange() {
        this.forceUpdate();
    }

    onDeleteClicked(e) {
        e.preventDefault();
        e.stopPropagation();

        const confirmDlg = new Confirm(
            'Delete status report due date?',
            'This action cannot be undone. If there are submitted status reports for this, those will be orphaned.',
            {
                accept_button_text: 'Delete',
                accept_button_class: 'btn-danger'
            });

        confirmDlg.on('accept', () => this.props.model.destroy());
    }

    render() {
        const { model, manage, users } = this.props;
        const date = model.get('date');
        const showToGroups = model.get('show_to_groups');
        const missing = !!users.find(user => user.report === undefined);

        const dateEditableOptions = {
            disabled: !manage,
            display: value => value.format('YYYY-MM-DD'),
            format: 'YYYY-MM-DD',
            mode: 'inline',
            savenochange: true,
            type: 'datepicker',
            datepicker: {
                container: '.all-status-reports',
            },
            unsavedclass: null,
        };

        const groupsEditableOptions = {
            disabled: !manage,
            display: false,
            mode: 'inline',
            type: 'selectize',
            selectize: {
                create: true,
                delimiter: ',',
                options: _.pluck(this.props.getGroups(), 'group_id').map(
                    group => ({ text: group, value: group })),
                plugins: ['remove_button'],
            },
            unsavedclass: null,
            value: this.props.getGroupsString(),
        };

        return (
            <tr className={date < moment() ? (missing > 0 ? 'danger' : 'success') : null}>
                <td className="date-column">
                    <Editable
                        options={dateEditableOptions}
                        onChange={value => this.props.onDateChanged(value)}
                        onShow={() => this.$deleteButton.hide()}
                        onHide={() => this.$deleteButton.show()}>
                        {date.format('YYYY-MM-DD')}
                    </Editable>
                    {manage && (
                        <button
                            type="button"
                            id="delete-button"
                            className="btn btn-default btn-xs"
                            onClick={this.onDeleteClicked}
                            ref={el => this.$deleteButton = el ? $(el) : $()}>
                            <span className="fas fa-trash-alt"></span>
                        </button>
                    )}
                </td>
                <td>
                    <Editable
                        className="tags"
                        options={groupsEditableOptions}
                        onChange={value => this.props.onGroupsChanged(new Set(value.split(',')))}>
                        {[...showToGroups].map(group => (
                            <span key={group} className="label label-default">{group}</span>
                        ))}
                    </Editable>
                </td>
                <td className="avatars">
                    <div>
                    {users.map(user => (
                        <React.Fragment key={user.name}>
                            {user.report ? (
                                <Link
                                    key={user.name}
                                    to={`/status/view/${user.report}`}
                                >
                                    <img
                                        className="avatar img-rounded"
                                        src={user.avatar}
                                        title={user.name}
                                        alt={user.name}
                                    />
                                </Link>
                            ) : (
                                <img
                                    key={user.name}
                                    className="avatar faded img-rounded"
                                    src={user.avatar}
                                    title={user.name}
                                    alt={user.name}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </div>
                </td>
            </tr>
        );
    }
}


class AllStatusReports extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.onAddClicked = this.onAddClicked.bind(this);

        this.statusReportDueDates = this.props.model.get('statusReportDueDates');
    }

    componentDidMount() {
        this.props.model.on('ready', this.handleChange);
        this.statusReportDueDates.on('add', this.handleChange);
        this.statusReportDueDates.on('remove', this.handleChange);
        this.statusReportDueDates.on('change', this.handleChange);
    }

    componentWillUnmount() {
        this.props.model.off('ready', this.handleChange);
        this.statusReportDueDates.off('add', this.handleChange);
        this.statusReportDueDates.off('remove', this.handleChange);
        this.statusReportDueDates.off('change', this.handleChange);
    }

    handleChange() {
        this.forceUpdate();
    }

    onAddClicked() {
        this.statusReportDueDates.create({
            date: moment(),
            show_to_groups: new Set(),
        });
    }

    render() {
        const { groups, manage, model } = this.props;

        const activeGroupIds = new Set(
            groups.items
                .filter(group => group.show)
                .map(group => group.group_id));

        const statusReports = model.get('statusReports');
        const allUsers = model.get('users');

        const dueDates = this.statusReportDueDates
            .filter(dueDate => {
                const showTo = dueDate.get('show_to_groups');
                return (showTo.size === 0 || intersectionExists(showTo, activeGroupIds));
            })
            .map(dueDate => {
                const dueDateId = dueDate.get('id');
                const showTo = dueDate.get('show_to_groups');

                const users = allUsers
                    .chain()
                    .filter(user => intersectionExists(showTo, user.get('groups')))
                    .map(user => {
                        const report = statusReports.findWhere({
                            date_due: dueDateId,
                            user: user.get('id'),
                        });

                        return {
                            avatar: user.get('avatar'),
                            name: user.get('name'),
                            report: report && report.get('id'),
                        };
                    })
                    .value();

                return (
                    <RowView
                        key={dueDate.get('id') || dueDate.cid}
                        model={dueDate}
                        manage={manage}
                        users={users}
                        onDateChanged={date => dueDate.save({ date })}
                        getGroups={() => groups}
                        getGroupsString={() => dueDate.getGroupsString()}
                        onGroupsChanged={show_to_groups => dueDate.save({ show_to_groups })}
                    />
                );
            });

        return (
            <div className="all-status-reports content-inner">
                <Helmet>
                    <title>All Status Reports - Student Sonar</title>
                </Helmet>
                <div className="panel panel-default">
                    <div className="panel-heading">All Status Reports</div>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Due Date</th>
                                <th>Groups</th>
                                <th>Status Reports</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dueDates}
                        </tbody>
                        {manage && (
                            <tfoot>
                                <tr>
                                    <td colSpan="4">
                                        <button
                                            type="button"
                                            className="btn btn-default"
                                            id="add"
                                            onClick={this.onAddClicked}>
                                            Add new due date
                                        </button>
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        );
    }
}


const mapStateToProps = state => ({
    groups: state.groups,
    manage: state.manage,
});


export default connect(mapStateToProps)(AllStatusReports);
