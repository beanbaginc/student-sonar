// jshint ignore: start

import compose from 'lodash.flowright';
import moment from 'moment';
import React from 'react';
import { graphql } from 'react-apollo';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { ALL_GROUPS_QUERY } from './api/group';
import {
    STATUS_REPORT_DUE_DATES_QUERY,
    deleteStatusReportDueDate,
    saveStatusReportDueDate,
} from './api/status-report-due-date';
import { ACTIVE_STATUS_REPORTS_QUERY } from './api/user';
import confirm from './confirm';
import Editable from './editable';


@deleteStatusReportDueDate
class DeleteButton extends React.Component {
    constructor(props) {
        super(props);
        this.onDeleteClicked = this.onDeleteClicked.bind(this);
    }

    onDeleteClicked(e) {
        e.preventDefault();
        e.stopPropagation();

        this.props.mutate({
            variables: {
                id: this.props.item.id,
            },
        });
    }

    render() {
        return (
            <button
                type="button"
                id="delete-button"
                className="btn btn-default btn-xs"
                onClick={this.onDeleteClicked}
            >
                <span className="fas fa-trash-alt"></span>
            </button>
        );
    }
}


@compose(
    graphql(ALL_GROUPS_QUERY),
    saveStatusReportDueDate
)
class RowView extends React.Component {
    constructor(props) {
        super(props);
        this.onDeleteClicked = this.onDeleteClicked.bind(this);
        this.onSave = this.onSave.bind(this);
    }

    onDeleteClicked(e) {
        e.preventDefault();
        e.stopPropagation();

        confirm(
            'Delete status report due date?',
            'This action cannot be undone. If there are submitted status reports for this, those will be orphaned.',
            {
                acceptButtonText: 'Delete',
                acceptButtonClass: 'btn-danger',
                onAccept: () => this.props.onDelete(this.props.item._id),
            });
    }

    onSave(newAttrs) {
        const { item } = this.props;

        this.props.mutate({
            variables: Object.assign({
                id: item.id,
                date: item.date.toISOString(),
                showToGroups: item.showToGroups,
            }, newAttrs),
        });
    }

    render() {
        const { item, manage, users, data: { groups, loading } } = this.props;
        const showToGroups = item.showToGroups || [];
        const missing = !!users.find(user => user.report === undefined);

        if (loading) {
            return null;
        }

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
                options: groups
                    .map(group => group.groupId)
                    .sort()
                    .map(groupId => ({
                        text: groupId,
                        value: groupId,
                    })),
                plugins: ['remove_button'],
            },
            unsavedclass: null,
            value: showToGroups.join(','),
        };

        return (
            <tr className={item.date < moment().endOf('day') ? (missing > 0 ? 'danger' : 'success') : null}>
                <td className="date-column">
                    <Editable
                        options={dateEditableOptions}
                        onChange={value => this.onSave({ date: value })}>
                        {item.date.format('YYYY-MM-DD')}
                    </Editable>
                    {manage && (
                        <DeleteButton item={item} />
                    )}
                </td>
                <td>
                    <Editable
                        className="tags"
                        options={groupsEditableOptions}
                        onChange={value => this.onSave({ showToGroups: value.split(',') })}>
                        {showToGroups.map(group => (
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


@compose(
    graphql(ALL_GROUPS_QUERY),
    saveStatusReportDueDate
)
class AddButton extends React.Component {
    constructor(props) {
        super(props);
        this.onAddClicked = this.onAddClicked.bind(this);
    }

    onAddClicked(e) {
        e.preventDefault();
        e.stopPropagation();

        this.props.mutate({
            variables: {
                id: null,
                date: moment().endOf('day').toISOString(),
                showToGroups: this.props.data.groups
                    .filter(group => group.active)
                    .map(group => group.groupId),
            },
        });
    }

    render() {
        return (
            <button
                type="button"
                className="btn btn-default"
                id="add"
                onClick={this.onAddClicked}
            >
                Add new due date
            </button>
        );
    }
}


@compose(
    graphql(STATUS_REPORT_DUE_DATES_QUERY, { name: 'dueDates' }),
    graphql(ACTIVE_STATUS_REPORTS_QUERY, { name: 'users' }),
    connect(state => ({
        manage: state.manage,
    }))
)
export default class AllStatusReports extends React.Component {
    render() {
        const {
            dueDates: {
                loading: dueDatesLoading,
                error: dueDatesError,
                statusReportDueDates,
            },
            manage,
            users: {
                loading: usersLoading,
                error: usersError,
                users,
            },
        } = this.props;

        const loading = dueDatesLoading || usersLoading;
        const error = dueDatesError || usersError;

        let content;

        if (loading) {
            content = <tr><td colSpan="3"><span className="fas fa-sync fa-spin"></span></td></tr>;
        } else if (error) {
            content = <tr><td colSpan="3"><span className="fas fa-exclamation-triangle"></span> {error}</td></tr>;
        } else {
            content = statusReportDueDates.map(dueDate => {
                dueDate = {
                    date: moment(dueDate.date),
                    id: dueDate.id,
                    showToGroups: dueDate.showToGroups,
                };

                const dueDateUsers = users
                    .filter(user => user.statusReportDueDates.find(d => d.id === dueDate.id))
                    .map(user => {
                        const report = user.statusReports.find(r => r.dateDue.id === dueDate.id);

                        return {
                            avatar: user.avatar,
                            name: user.name,
                            report: report && report.id,
                        };
                    });

                return <RowView
                    key={dueDate.id}
                    item={dueDate}
                    manage={manage}
                    users={dueDateUsers}
                />;
            });
        }

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
                            {content}
                        </tbody>
                        {manage && (
                            <tfoot>
                                <tr>
                                    <td colSpan="3">
                                        <AddButton />
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
