// jshint ignore: start

import Backbone from 'backbone';

import CalendarView from './calendar-view';
import StatusReportEditorView from './status-report-editor-view';
import StatusReportReadingView from './status-report-reading-view';
import UserDetailView from './user-detail-view';

// new
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import AllStatusReports from './all-status-reports';
import AllUsers from './all-users';
import Header from './header';
import Index from './index';
import MyStatusReports from './my-status-reports';
import ProjectList from './project-list';
import Sidebar from './sidebar';
import SingleProject from './single-project';


const PermissionDenied = props => (
    <div className="content-inner">
        <div className="page-header">
            <h1>Permission Denied</h1>
        </div>
        {props.loggedIn ? (
            <p>
                You do not have access to this page. If you believe this is
                an error, please contact your mentors.
            </p>
        ) : (
            <p>To view this page, you need to be logged in.</p>
        )}
    </div>
);


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

        this._calendarView = loggedIn
            ? new CalendarView(viewOptions)
            : this._permissionDeniedView;

        this._userDetailViews = new Map();

        model.on('route:calendar',
                 () => this._attachContent(this._calendarView));
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
        model.on('route:user', username => this._onRouteUser(username));

        // All migrated views will trigger this one.
        model.on('route:migrated', () => this._detachContent());
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
                        <Route
                            path="/" exact
                            render={props => (
                                <Index loggedIn={loggedIn} {...props} />
                            )}
                        />
                        <Route
                            path="/projects" exact
                            render={props => (
                                <ProjectList model={this.model} {...props} />
                            )}
                        />
                        <Route
                            path="/projects/:taskId" exact
                            render={props => (
                                <SingleProject model={this.model} {...props} />
                            )}
                        />
                        <Route
                            path="/status" exact
                            render={props => (
                                <React.Fragment>
                                    {loggedIn ? (
                                        <MyStatusReports model={this.model} {...props} />
                                    ) : (
                                        <PermissionDenied loggedIn={loggedIn} />
                                    )}
                                </React.Fragment>
                            )}
                        />
                        <Route
                            path="/status/all" exact
                            render={props => (
                                <React.Fragment>
                                    {loggedIn ? (
                                        <AllStatusReports model={this.model} {...props} />
                                    ) : (
                                        <PermissionDenied loggedIn={loggedIn} />
                                    )}
                                </React.Fragment>
                            )}
                        />
                        <Route
                            path="/users" exact
                            render={props => (
                                <React.Fragment>
                                    {isMentor ? (
                                        <AllUsers model={this.model} {...props} />
                                    ) : (
                                        <PermissionDenied loggedIn={loggedIn} />
                                    )}
                                </React.Fragment>
                            )}
                        />
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
