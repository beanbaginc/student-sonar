// jshint ignore: start

import React from 'react';
import moment from 'moment';
import { NavLink } from 'react-router-dom';

import Confirm from './confirm';
import {intersectionExists} from './util';
import './editable-datepicker';
import './editable-selectize';


class RowView extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.onUserClicked = this.onUserClicked.bind(this);
        this.onDeleteClicked = this.onDeleteClicked.bind(this);
    }

    onUserClicked(e) {
        // TODO: this can go away once we're entirely moved away from
        // Backbone.Router
        e.preventDefault();
        e.stopPropagation();

        const path = e.currentTarget.getAttribute('href');

        if (path) {
            window.application.go(path);
        }
    }

    componentDidMount() {
        this.props.model.on('change', this.handleChange);

        this.$date
            .editable({
                display: value => value.format('YYYY-MM-DD'),
                format: 'YYYY-MM-DD',
                mode: 'inline',
                savenochange: true,
                success: (response, newValue) => this.props.onDateChanged(newValue),
                type: 'datepicker',
                unsavedclass: null,
                datepicker: {
                    container: '.all-status-reports',
                }
            })
            .on('shown', () => {
                if (this.$deleteButton) {
                    this.$deleteButton.hide();
                }
            })
            .on('hidden', () => {
                if (this.$deleteButton) {
                    this.$deleteButton.show();
                }
            })

        this.$groups
            .editable({
                display: false,
                mode: 'inline',
                selectize: {
                    create: true,
                    delimiter: ',',
                    options: this.props.getGroups().pluck('group_id').map(
                        group => ({ text: group, value: group })),
                    plugins: ['remove_button'],
                },
                success: (response, newValue) => this.props.onGroupsChanged(
                    new Set(newValue.split(','))),
                type: 'selectize',
                unsavedclass: null,
                value: this.props.getGroupsString(),
            });

        if (!this.props.manage) {
            this.$date.editable('disable');
            this.$groups.editable('disable');
        }
    }

    componentWillUnmount() {
        this.props.model.off('change', this.handleChange);

        this.$date.editable('destroy');
        this.$groups.editable('destroy');
    }

    componentWillReceiveProps(nextProps) {
        const enableEditors = nextProps.manage ? 'enable' : 'disable';
        this.$date.editable(enableEditors);
        this.$groups.editable(enableEditors);
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

        return (
            <tr className={date < moment() ? (missing > 0 ? 'danger' : 'success') : null}>
                <td className="date-column">
                    <time id="date" ref={el => this.$date = el ? $(el) : null}>
                        {date.format('YYYY-MM-DD')}
                    </time>
                    {manage && (
                        <button
                            type="button"
                            id="delete-button"
                            className="btn btn-default btn-xs"
                            onClick={this.onDeleteClicked}
                            ref={el => this.$deleteButton = el ? $(el) : null}>
                            <span className="fa fa-trash-o"></span>
                        </button>
                    )}
                </td>
                <td>
                    <span
                        className="tags"
                        id="groups"
                        ref={el => this.$groups = el ? $(el) : null}>
                        {[...showToGroups].map(group => (
                            <span key={group} className="label label-default">{group}</span>
                        ))}
                    </span>
                </td>
                <td className="avatars">
                    <div>
                    {users.map(user => (
                        <React.Fragment key={user.name}>
                            {user.report ? (
                                <NavLink
                                    key={user.name}
                                    to={`/status/view/${user.report}`} exact
                                    onClick={this.onUserClicked}>
                                    <img
                                        className="avatar img-rounded"
                                        src={user.avatar}
                                        title={user.name}
                                        alt={user.name}
                                    />
                                </NavLink>
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


export default class AllStatusReports extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.onAddClicked = this.onAddClicked.bind(this);

        this.statusReportDueDates = this.props.model.get('statusReportDueDates');
    }

    componentDidMount() {
        this.props.model.on('ready', this.handleChange);
        this.props.model.on('change:manage', this.handleChange);
        this.statusReportDueDates.on('add', this.handleChange);
        this.statusReportDueDates.on('remove', this.handleChange);
        this.statusReportDueDates.on('change', this.handleChange);
    }

    componentWillUnmount() {
        this.props.model.off('ready', this.handleChange);
        this.props.model.off('change:manage', this.handleChange);
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
        const { model } = this.props;
        const manage = model.get('manage');

        const allGroups = model.get('groups');
        const activeGroupIds = new Set(
            allGroups
                .filter(group => group.get('show'))
                .map(group => group.get('group_id')));

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
                        getGroups={() => allGroups}
                        getGroupsString={() => dueDate.getGroupsString()}
                        onGroupsChanged={show_to_groups => dueDate.save({ show_to_groups })}
                    />
                );
            });

        return (
            <div className="all-status-reports content-inner">
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
