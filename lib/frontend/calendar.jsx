// jshint ignore: start

import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';

import Confirm from './confirm';
import {CalendarItem} from './models';
import {intersectionExists} from './util';


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
                                <span className="fa fa-close"></span>
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


class EditCalendarEntry extends React.Component {
    constructor(props) {
        super(props);
        this.onDateChanged = this.onDateChanged.bind(this);
        this.onSummaryChanged = this.onSummaryChanged.bind(this);
        this.onGroupsChanged = this.onGroupsChanged.bind(this);
        this.onSaveClicked = this.onSaveClicked.bind(this);

        this.state = {
            date: props.model.get('date'),
            groups: props.model.getGroupsString(),
            summary: props.model.get('summary'),
        };
    }

    componentDidMount() {
        this.$datepicker
            .datepicker({
                autoclose: true,
                format: 'yyyy-mm-dd',
            })
            .on('change', this.onDateChanged);

        this.$groups
            .selectize({
                create: true,
                delimeter: ',',
                options: window.application.get('groups').pluck('group_id').map(
                    group => ({ text: group, value: group })),
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
        this.setState({ groups: e.target.value });
    }

    onSaveClicked() {
        const attrs = {
            date: moment(this.state.date),
            show_to_groups: new Set(this.state.groups.split(',')),
            summary: this.state.summary,
        };

        const options = {
            wait: true,
            success: () => this.props.onClose(),
            error: () => {
                // TODO: this should be done through react instead. Though I've
                // never seen it actually fail.
                $('<div class="alert alert-danger">')
                    .text('Failed to save calendar item')
                    .prependTo(this.$modal.find('.modal-body'));

                this.$modal.find('button.close').prop('disabled', false);
                this.$modal.find('#cancel-button').prop('disabled', false);
            }
        };

        if (this.props.model.isNew()) {
            window.application.get('calendar').create(attrs, options);
        } else {
            this.props.model.save(attrs, options);
        }
    }

    render() {
        return (
            <ModalDialog
                id="calendar-edit"
                title={this.props.model.isNew() ? 'Create new event' : 'Edit event'}
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


class CalendarEntry extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.onDeleteClicked = this.onDeleteClicked.bind(this);
        this.state = { edit: false };
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

    onDeleteClicked() {
        const confirmDlg = new Confirm(
            'Delete calendar item?',
            'This action cannot be undone',
            {
                accept_button_text: 'Delete',
                accept_button_class: 'btn-danger',
            });

        confirmDlg.on('accept', () => this.props.model.destroy());
    }

    render() {
        const { model, manage } = this.props;
        const groups = model.get('show_to_groups');

        //    <li className="calendar-item">
        return (
            <React.Fragment>
                {manage && (
                    <div className="btn-group">
                        <button
                            type="button"
                            id="edit-button"
                            className="btn btn-default btn-xs"
                            onClick={() => this.setState({ edit: true })}>
                            <span className="fa fa-edit"></span>
                        </button>
                        <button
                            type="button"
                            id="delete-button"
                            className="btn btn-default btn-xs"
                            onClick={this.onDeleteClicked}>
                            <span className="fa fa-trash-o"></span>
                        </button>
                    </div>
                )}

                {model.get('summary')}

                {manage && (
                    <div className="labels">
                        {[...groups].map(group => (
                            <span key={group} className="label label-default">{group}</span>
                        ))}
                    </div>
                )}

                {this.state.edit && (
                    <EditCalendarEntry
                        model={this.props.model}
                        onClose={() => this.setState({ edit: false })}
                    />
                )}
            </React.Fragment>
        );
        //    </li>
    }
}


export default class Calendar extends React.Component {
    constructor(props) {
        super(props);

        this.collection = this.props.model.get('calendar');
        this.handleChange = this.handleChange.bind(this);
        this.onCreateClicked = this.onCreateClicked.bind(this);
        this.state = { addingNew: false };
    }

    componentDidMount() {
        this.props.model.on('ready change:manage', this.handleChange);
        this.collection.on('add remove update reset', this.handleChange);
    }

    componentWillUnmount() {
        this.props.model.off('ready change:manage', this.handleChange);
        this.collection.off('add remove update reset', this.handleChange);
    }

    handleChange() {
        this.forceUpdate();
    }

    onCreateClicked() {
        this.setState({ addingNew: true });
    }

    render() {
        if (!this.props.model.get('ready')) {
            return <div className="calendar" />;
        }

        const today = moment().startOf('day');
        const me = this.props.model.get('me');
        const myGroups = me.get('groups');
        const manage = this.props.model.get('manage');

        const visibleItems = this.collection
            .chain()
            .filter(item => (
                (manage || item.get('date') >= today) &&
                (window.userType === 'mentor' ||
                 intersectionExists(myGroups, item.get('show_to_groups')))))
            .groupBy(item => item.get('date').format('YYYY-MM-DD'))
            .value();

        const dates = Object.keys(visibleItems).sort()
            .map(date => {
                const items = visibleItems[date];

                return (
                    <li key={date} className="event-list-day">
                        <time>{items[0].get('date').format('ddd, MMM D')}</time>
                        <ul>
                            {items.map(item => (
                                <CalendarEntry key={item.id} model={item} manage={manage} />
                            ))}
                        </ul>
                    </li>
                );
            });

        return (
            <div className="calendar">
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
                        model={new CalendarItem()}
                        onClose={() => this.setState({ addingNew: false })}
                    />
                )}
            </div>
        );
    }
}
