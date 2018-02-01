// jshint ignore: start

import Backbone from 'backbone';

import {intersectionExists} from './util';
import AllStatusReportsView from './all-status-reports-view';
import AllStudentsListView from './all-students-list-view';
import CalendarView from './calendar-view';
import MyStatusReportsView from './my-status-reports-view';
import RootView from './root-view';
import StatusReportEditorView from './status-report-editor-view';
import StatusReportReadingView from './status-report-reading-view';
import StudentProjectsListView from './student-projects-list-view';
import StudentProjectView from './student-project-view';
import UserDetailView from './user-detail-view';

// new
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import Header from './header';
import Sidebar from './sidebar';


class PermissionDeniedView extends Backbone.View {
    constructor(options) {
        options = Object.create(options);
        options.className = 'content-inner';
        super(options);
    }

    render() {
        this.$el.html(`
            <div class="page-header">
                <h1>Permission denied</h1>
            </div>
            `);

        if (this.model.get('loggedIn')) {
            $('<p/>')
                .text('You do not have access to this page. If you believe ' +
                      'this is an error, please contact your mentors.')
                .appendTo(this.$el);
        } else {
            $('<p/>')
                .text('To view this page, you need to be logged in.')
                .appendTo(this.$el);
        }
    }
}


class LegacyRoutes extends React.Component {
    constructor(props) {
        super(props);

        this._onRouteUser = this._onRouteUser.bind(this);

        const { loggedIn, isMentor, model } = this.props;
        const viewOptions = { model };

        this._activeView = null;
        this._permissionDeniedView = new PermissionDeniedView(viewOptions);

        this._rootView = new RootView(viewOptions);
        this._projectListView = new StudentProjectsListView(viewOptions);
        this._calendarView = loggedIn
            ? new CalendarView(viewOptions)
            : this._permissionDeniedView;
        this._myStatusReportsView = loggedIn
            ? new MyStatusReportsView(viewOptions)
            : this._permissionDeniedView;
        this._allStatusReportsView = isMentor
            ? new AllStatusReportsView(viewOptions)
            : this._permissionDeniedView;
        this._allUsersView = isMentor
            ? new AllStudentsListView(viewOptions)
            : this._permissionDeniedView;

        this._userDetailViews = new Map();

        model.on('route:root',
                 () => this._attachContent(this._rootView));
        model.on('route:projects',
                 () => this._attachContent(this._projectListView));
        model.on('route:calendar',
                 () => this._attachContent(this._calendarView));
        model.on('route:my-status-reports',
                 () => this._attachContent(this._myStatusReportsView));
        model.on('route:all-status-reports',
                 () => this._attachContent(this._allStatusReportsView));
        model.on('route:users',
                 () => this._attachContent(this._allUsersView));
        model.on('route:edit-status-report', dueDateId => {
            this._attachContent(loggedIn
                ? new StatusReportEditorView({ model, dueDateId })
                : this._permissionDeniedView);
        });
        model.on('route:view-status-report', reportId => {
            this._attachContent(isMentor
                ? new StatusReportReadingView({ model, reportId })
                : this._permissionDeniedView);
        });
        model.on('route:project', taskID => {
            this._attachContent(new StudentProjectView({ model, taskID }));
        });
        model.on('route:user', username => this._onRouteUser(username));
    }

    _onRouteUser(username) {
        if (!this.props.isMentor) {
            this._attachContent(this._permissionDeniedView);
            return;
        }

        if (this._userDetailViews.has(username)) {
            this._attachContent(this._userDetailViews.get(username));
        } else {
            if (this.props.model.get('ready')) {
                const user = this.props.model.get('users')
                    .find(user => user.get('slack_username') === username);
                const view = new UserDetailView({ model: user });
                this._userDetailViews.set(username, view);
                this._attachContent(view);
            } else {
                this.props.model.once('ready', () => this._onRouteUser(username));
            }
        }
    }

    componentDidMount() {
        if (this._activeView) {
            this._attachContent(this._activeView);
        }
    }

    componentWillUnmount() {
        this._detachContent();
    }

    render() {
        const style = {
            display: this.props.match ? 'block' : 'none',
        }

        return <div
            ref={el => this._$el = el ? $(el) : null}
            style={style}
        />;
    }

    _detachContent() {
        if (this._$el) {
            this._$el.children().detach();
        }
    }

    _attachContent(view) {
        this._activeView = view;

        if (this._$el) {
            this._detachContent();
            this._$el.append(view.el);

            view.render();
        }
    }
}


/*
 * ApplicationView is a view that wraps the entire application. It shows a
 * header, and then shows different sub-views for each page.
 */
export default class ApplicationView extends Backbone.View {
    constructor(options) {
        options = Object.create(options);
        options.className = 'root';
        super(options);

        this.history = createBrowserHistory();
        // TODO: This reflects any changes from Backbone.Router into the
        // react-router history. It's kind of a terrible thing, but it's
        // temporary. Get rid of it once we're moved away from Backbone.Router.
        this.model.on('route', () => this.history.replace(document.location.pathname));
    }

    render() {
        const loggedIn = (window.userId !== null);
        const isMentor = (window.userType === 'mentor');

        ReactDOM.render(
            <Router history={this.history}>
                <React.Fragment>
                    <Header
                        loggedIn={loggedIn}
                        isMentor={isMentor}
                        manage={this.model.get('manage')}
                        onManageChanged={manage => this.model.set({ manage })}
                    />
                    <Sidebar
                        loggedIn={loggedIn}
                        isMentor={isMentor}
                        model={this.model}
                    />
                    <div className="main">
                        <Route children={props => (
                            <LegacyRoutes
                                loggedIn={loggedIn}
                                isMentor={isMentor}
                                model={this.model}
                                {...props}
                            />
                        )}
                        />
                    </div>
                </React.Fragment>
            </Router>,
            this.el);

        return this;
    }
}
