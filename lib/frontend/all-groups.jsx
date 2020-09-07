// jshint ignore: start

import compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import {
    ALL_GROUPS_QUERY,
    deleteGroup,
    saveGroup,
} from './api/group';
import confirm from './confirm';
import Editable from './editable';


@deleteGroup
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


@saveGroup
class RowView extends React.Component {
    constructor(props) {
        super(props);
        this.onSave = this.onSave.bind(this);
    }

    onSave(newAttrs) {
        const { group } = this.props;

        this.props.mutate({
            variables: Object.assign({
                active: group.active,
                groupId: group.groupId,
                id: group.id,
                name: group.name,
                showInSidebar: group.showInSidebar,
            }, newAttrs),
        });
    }

    render() {
        const {
            group,
            manage,
        } = this.props;

        const textEditableOptions = {
            disabled: !manage,
            mode: 'inline',
            type: 'text',
            unsavedclass: null,
        };

        const booleanEditableOptions = {
            disabled: !manage,
            emptytext: '&nbsp;&nbsp;&nbsp;',
            mode: 'inline',
            type: 'selectize',
            selectize: {
                create: false,
                options: [
                    { text: 'Yes', value: true },
                    { text: 'No', value: false },
                ],
                maxItems: 1,
            },
            unsavedclass: null,
            display: function(value) {
                if (typeof value === 'function') {
                    value = value();
                }

                const $el = $(this).empty();

                if (value) {
                    $('<span class="fas fa-check-circle">')
                        .appendTo($el);
                }
            },
        };

        const activeEditableOptions = Object.assign({
            selectize: Object.assign({
                items: [group.active],
            }, booleanEditableOptions.selectize),
            value: () => group.active,
        }, booleanEditableOptions);

        const showInSidebarEditableOptions = Object.assign({
            selectize: Object.assign({
                items: [group.showInSidebar],
            }, booleanEditableOptions.selectize),
            value: () => group.showInSidebar,
        }, booleanEditableOptions);

        return (
            <tr>
                <td>
                    <Editable
                        options={textEditableOptions}
                        onChange={value => this.onSave({ groupId: value })}>
                        {group.groupId}
                    </Editable>
                    {manage && (
                        <DeleteButton item={group} />
                    )}
                </td>
                <td>
                    <Editable
                        options={textEditableOptions}
                        onChange={value => this.onSave({ name: value })}>
                        {group.name}
                    </Editable>
                </td>
                <td>
                    <Editable
                        options={activeEditableOptions}
                        onChange={value => this.onSave({ active: !!parseInt(value, 10) })}
                    />
                </td>
                <td>
                    <Editable
                        options={showInSidebarEditableOptions}
                        onChange={value => this.onSave({ showInSidebar: !!parseInt(value, 10) })}
                    />
                </td>
            </tr>
        );
    }
}


@saveGroup
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
                active: true,
                groupId: 'new-group',
                id: null,
                name: 'New Group',
                showInSidebar: true,
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
                Add new group
            </button>
        );
    }
}


@compose(
    graphql(ALL_GROUPS_QUERY),
    connect(state => ({
        manage: state.manage,
    }))
)
export default class AllGroups extends React.Component {
    render() {
        const {
            data: { loading, error, groups },
            manage,
        } = this.props;

        let content;

        if (loading) {
            content = <tr><td colSpan="4"><span className="fas fa-sync fa-spin"></span></td></tr>;
        } else if (error) {
            content = <tr><td colSpan="4"><span className="fas fa-exclamation-triangle"></span> {error}</td></tr>;
        } else {
            content = groups.map(group => <RowView key={group.id} group={group} manage={manage} />);
        }

        return (
            <div className="all-groups content-inner">
                <Helmet>
                    <title>All Groups - Student Sonar</title>
                </Helmet>
                <div className="panel panel-default">
                    <div className="panel-heading">All Users</div>
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th>Group ID</th>
                                <th>Display Name</th>
                                <th>Active</th>
                                <th>Show in Sidebar</th>
                            </tr>
                        </thead>
                        <tbody>{content}</tbody>
                        {manage && (
                            <tfoot>
                                <tr>
                                    <td colSpan="4">
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
