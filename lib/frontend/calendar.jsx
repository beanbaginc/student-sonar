// jshint ignore: start

import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import _ from 'underscore';

import Confirm from './confirm';
import {
    deleteCalendarItem,
    fetchCalendar,
    saveCalendarItem
} from './redux/modules/calendar';
import { intersectionExists } from './util';


class ModalDialog extends React.Component {
    constructor(props) {
        super(props);
        this.onModalHidden = this.onModalHidden.bind(this);
    }

    componentDidMount() {
        this.$el
            .modal()
            .on('hidden.bs.modal', this.onModalHidden);
    }

    componentWillUnmount() {
        this.$el
            .off('hidden.bs.modal', this.onModalHidden)
            .modal('hide')
            .removeData('bs.modal');
    }

    onModalHidden() {
        this.props.onClose();
    }

    render() {
        return ReactDOM.createPortal(
            <div className="modal fade"
                id={this.props.id}
                ref={el => this.$el = el ? $(el) : null}>
                <div className="modal-dialog" ref={el => this.$el = el ? $(el) : null}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close" data-dismiss="modal">
                                <span className="fas fa-times"></span>
                            </button>
                            <h4 className="modal-title">
                                {this.props.title}
                            </h4>
                        </div>
                        <div className="modal-body">
                            {this.props.children}
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-default"
                                id="cancel-button"
                                data-dismiss="modal">
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                id="save-button"
                                onClick={this.props.onSave}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>,
            document.body);
    }
}


class EditCalendarEntryInt extends React.Component {
    constructor(props) {
        super(props);
        this.onDateChanged = this.onDateChanged.bind(this);
        this.onSummaryChanged = this.onSummaryChanged.bind(this);
        this.onGroupsChanged = this.onGroupsChanged.bind(this);
        this.onSaveClicked = this.onSaveClicked.bind(this);

        const { item } = props;

        this.state = {
            date: item ? item.date : '',
            groups: item ? item.show_to_groups : '',
            summary: item ? item.summary : '',
        };
    }

    componentDidMount() {
        this.$datepicker
            .datepicker({
                autoclose: true,
                format: 'yyyy-mm-dd',
            })
            .on('change', this.onDateChanged);

        const groups = _.pluck(this.props.groups.items, 'group_id').sort();

        this.$groups
            .selectize({
                create: true,
                delimeter: ',',
                options: groups.map(group => ({
                    text: group,
                    value: group,
                })),
                plugins: ['remove_button'],
            })
            .on('change', this.onGroupsChanged);
    }

    componentWillUnmount() {
        this.$datepicker
            .off('change', this.onDateChanged)
            .datepicker('destroy');
        this.$groups
            .off('change', this.onGroupsChanged)
            .selectize('destroy');
    }

    onDateChanged(e) {
        this.setState({ date: e.target.value });
    }

    onSummaryChanged(e) {
        this.setState({ summary: e.target.value });
    }

    onGroupsChanged(e) {
        this.setState({ groups: e.target.value.split(',') });
    }

    onSaveClicked() {
        const attrs = {
            _id: this.props.item ? this.props.item._id : undefined,
            date: this.state.date,
            show_to_groups: this.state.groups,
            summary: this.state.summary,
        };

        if (this.props.onSave) {
            this.props.onSave(attrs);
        }
        this.props.onClose();
    }

    render() {
        return (
            <ModalDialog
                id="calendar-edit"
                title={this.props.item ? 'Edit event' : 'Create new event'}
                onSave={this.onSaveClicked}
                onClose={this.props.onClose}
                ref={el => this.$modal = el ? $(el) : null}>
                <form className="form-horizontal">
                    <div className="form-group">
                        <label htmlFor="calendar-edit-date" className="col-sm-2 control-label">Date:</label>
                        <div className="col-sm-3">
                            <input
                                type="text"
                                className="form-control"
                                id="calendar-edit-date"
                                ref={el => this.$datepicker = el ? $(el) : null}
                                defaultValue={this.state.date.format('YYYY-MM-DD')}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="calendar-edit-summary" className="col-sm-2 control-label">Summary:</label>
                        <div className="col-sm-10">
                            <input
                                type="text"
                                className="form-control"
                                id="calendar-edit-summary"
                                value={this.state.summary}
                                onChange={this.onSummaryChanged}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="calendar-edit-groups" className="col-sm-2 control-label">Groups:</label>
                        <div className="col-sm-10">
                            <input
                                type="text"
                                className="form-control"
                                id="calendar-edit-groups"
                                ref={el => this.$groups = el ? $(el) : null}
                                defaultValue={this.state.groups}
                            />
                        </div>
                    </div>
                </form>
            </ModalDialog>
        );
    }
}


const EditCalendarEntry = connect(state => ({ groups: state.groups }))(EditCalendarEntryInt);


class CalendarEntry extends React.Component {
    constructor(props) {
        super(props);
        this.onDeleteClicked = this.onDeleteClicked.bind(this);
        this.state = { edit: false };
    }

    onDeleteClicked() {
        const confirmDlg = new Confirm(
            'Delete calendar item?',
            'This action cannot be undone',
            {
                accept_button_text: 'Delete',
                accept_button_class: 'btn-danger',
            });

        confirmDlg.on('accept', () => this.props.onDelete(this.props.item._id));
    }

    render() {
        const { item, manage } = this.props;

        return (
            <li className="calendar-item">
                {manage && (
                    <div className="btn-group">
                        <button
                            type="button"
                            id="edit-button"
                            className="btn btn-default btn-xs"
                            onClick={() => this.setState({ edit: true })}>
                            <span className="fas fa-edit"></span>
                        </button>
                        <button
                            type="button"
                            id="delete-button"
                            className="btn btn-default btn-xs"
                            onClick={this.onDeleteClicked}>
                            <span className="fas fa-trash-alt"></span>
                        </button>
                    </div>
                )}

                {item.summary}

                {manage && (
                    <div className="labels">
                        {[...item.show_to_groups].map(group => (
                            <span key={group} className="label label-default">{group}</span>
                        ))}
                    </div>
                )}

                {this.state.edit && (
                    <EditCalendarEntry
                        item={item}
                        onClose={() => this.setState({ edit: false })}
                        onSave={this.props.onSave}
                    />
                )}
            </li>
        );
    }
}


class Calendar extends React.Component {
    constructor(props) {
        super(props);

        this.onCreateClicked = this.onCreateClicked.bind(this);
        this.state = { addingNew: false };
    }

    componentDidMount() {
        this.props.onFetch();
    }

    onCreateClicked() {
        this.setState({ addingNew: true });
    }

    render() {
        const { calendar, manage, myUser, userType } = this.props;

        if (calendar.isFetching || !myUser) {
            return <div className="calendar" />;
        }

        const today = moment().startOf('day');
        const myGroups = new Set(myUser.groups);

        const items = {};
        calendar.items.forEach(item => {
            const date = moment(item.date);

            if ((date < today && !manage) ||
                !(userType === 'mentor' ||
                  intersectionExists(myGroups, new Set(item.show_to_groups)))) {
                return;
            }

            const key = date.format('YYYY-MM-DD');
            if (items.hasOwnProperty(key)) {
                items[key].push(item);
            } else {
                items[key] = [item];
            }
        });

        const dates = Object.keys(items).sort()
            .map(date => {
                const entries = items[date];
                const dateText = moment(date).format('ddd, MMM D');

                return (
                    <li key={date} className="event-list-day">
                        <time>{dateText}</time>
                        <ul>
                            {entries.map(item => (
                                <CalendarEntry
                                    key={item._id}
                                    item={item}
                                    manage={manage}
                                    onDelete={this.props.onDelete}
                                    onSave={this.props.onSave}
                                />
                            ))}
                        </ul>
                    </li>
                );
            });

        return (
            <div className="calendar">
                <Helmet>
                    <title>Calendar - Student Sonar</title>
                </Helmet>
                <ul className="event-list">{dates}</ul>
                {manage && (
                    <button
                        type="button"
                        className="btn btn-default"
                        onClick={this.onCreateClicked}>
                        Add new event
                    </button>
                )}
                {this.state.addingNew && (
                    <EditCalendarEntry
                        onClose={() => this.setState({ addingNew: false })}
                        onSave={this.props.onSave}
                    />
                )}
            </div>
        );
    }
}


const mapStateToProps = state => ({
    calendar: state.calendar,
    manage: state.manage,
    myUser: state.users.myUser,
    userType: state.userType,
});
const mapDispatchToProps = (dispatch, props) => ({
    onDelete: id => dispatch(deleteCalendarItem(id)),
    onSave: item => dispatch(saveCalendarItem(item)),
    onFetch: () => dispatch(fetchCalendar()),
});
export default connect(mapStateToProps, mapDispatchToProps)(Calendar);
