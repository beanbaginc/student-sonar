// jshint ignore: start

import moment from 'moment';
import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import _ from 'underscore';

import Confirm from './confirm';
import Editable from './editable';
import {
    deleteStatusReportDueDate,
    saveStatusReportDueDate
} from './redux/modules/status-report-due-dates';
import {intersectionExists} from './util';


class RowView extends React.Component {
    constructor(props) {
        super(props);
        this.onDeleteClicked = this.onDeleteClicked.bind(this);
        this.onSave = this.onSave.bind(this);
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

        confirmDlg.on('accept', () => this.props.onDelete(this.props.item._id));
    }

    onSave(newAttrs) {
        const attrs = Object.assign({
            _id: this.props.item ? this.props.item._id : undefined,
        }, this.props.item, newAttrs);

        this.props.onSave(attrs);
    }

    render() {
        const { item, groups, manage, users } = this.props;
        const showToGroups = item.show_to_groups || [];
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
                options: groups.items
                    .map(group => group.group_id)
                    .sort()
                    .map(group_id => ({
                        text: group_id,
                        value: group_id,
                    })),
                plugins: ['remove_button'],
            },
            unsavedclass: null,
            value: showToGroups.join(','),
        };

        return (
            <tr className={item.date < moment() ? (missing > 0 ? 'danger' : 'success') : null}>
                <td className="date-column">
                    <Editable
                        options={dateEditableOptions}
                        onChange={value => this.onSave({ date: value })}
                        onShow={() => this.$deleteButton.hide()}
                        onHide={() => this.$deleteButton.show()}>
                        {item.date.format('YYYY-MM-DD')}
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
                        onChange={value => this.onSave({ show_to_groups: value.split(',') })}>
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


class AllStatusReports extends React.Component {
    constructor(props) {
        super(props);
        this.onAddClicked = this.onAddClicked.bind(this);
    }

    onAddClicked() {
        const { groups } = this.props;

        this.props.onSave({
            date: moment(),
            show_to_groups: groups.items
                .filter(group => group.show)
                .map(group => group.group_id),
        });
    }

    render() {
        const {
            groups,
            manage,
            statusReports,
            statusReportDueDates,
            users,
        } = this.props;

        const activeGroupIds = new Set(
            groups.items
                .filter(group => group.show)
                .map(group => group.group_id));

        const dueDates = statusReportDueDates.items
            .filter(dueDate => {
                const showTo = new Set(dueDate.show_to_groups);
                return (showTo.size === 0 || intersectionExists(showTo, activeGroupIds));
            })
            .map(dueDate => {
                const showTo = new Set(dueDate.show_to_groups);

                const dueDateUsers = users.items
                    .filter(user => intersectionExists(showTo, new Set(user.groups)))
                    .map(user => {
                        const report = _.findWhere(statusReports.items, {
                            date_due: dueDate._id,
                            user: user._id,
                        });

                        return {
                            avatar: user.avatar,
                            name: user.name,
                            report: report && report._id,
                        };
                    });

                return (
                    <RowView
                        key={dueDate._id}
                        item={dueDate}
                        groups={groups}
                        manage={manage}
                        users={dueDateUsers}
                        onSave={this.props.onSave}
                        onDelete={this.props.onDelete}
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
    statusReports: state.statusReports,
    statusReportDueDates: state.statusReportDueDates,
    users: state.users,
});
const mapDispatchToProps = (dispatch, props) => ({
    onDelete: id => dispatch(deleteStatusReportDueDate(id)),
    onSave: item => dispatch(saveStatusReportDueDate(item)),
});
export default connect(mapStateToProps, mapDispatchToProps)(AllStatusReports);
