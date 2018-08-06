// jshint ignore: start

import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { BrowserRouter, Route } from 'react-router-dom';

import { fetchGroups } from './redux/modules/groups';
import { fetchStatusReportDueDates } from './redux/modules/status-report-due-dates';
import { fetchStatusReports } from './redux/modules/status-reports';
import { fetchUsers } from './redux/modules/users';
import AllStatusReports from './all-status-reports';
import AllUsers from './all-users';
import Calendar from './calendar';
import EditStatusReport from './edit-status-report';
import Header from './header';
import Index from './index';
import MyStatusReports from './my-status-reports';
import ProjectList from './project-list';
import Sidebar from './sidebar';
import SingleProject from './single-project';
import UserDetail from './user-detail';
import ViewStatusReport from './view-status-report';


@connect(state => ({ loggedIn: state.loggedIn }))
class PermissionDenied extends React.Component {
    render() {
        return (
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
    }
}


@connect(state => ({
    loggedIn: state.loggedIn,
    isMentor: state.userType === 'mentor',
}))
export default class Application extends React.Component {
    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(fetchGroups());
        dispatch(fetchStatusReportDueDates());
        dispatch(fetchStatusReports());
        dispatch(fetchUsers());
    }

    render() {
        const { loggedIn, isMentor } = this.props;

        return (
            <BrowserRouter>
                <React.Fragment>
                    <Helmet>
                        <title>Student Sonar</title>
                    </Helmet>
                    <Header />
                    <Sidebar />
                    <div className="main">
                        <Route
                            path="/" exact
                            render={props => <Index {...props} /> }
                        />
                        <Route
                            path="/calendar" exact
                            render={props => <Calendar {...props} />}
                        />
                        <Route
                            path="/projects" exact
                            render={props => <ProjectList {...props} />}
                        />
                        <Route
                            path="/projects/:taskId" exact
                            render={props => <SingleProject {...props} />}
                        />
                        <Route
                            path="/status" exact
                            render={props => (
                                <React.Fragment>
                                    {loggedIn ? (
                                        <MyStatusReports {...props} />
                                    ) : (
                                        <PermissionDenied />
                                    )}
                                </React.Fragment>
                            )}
                        />
                        <Route
                            path="/status/all" exact
                            render={props => (
                                <React.Fragment>
                                    {loggedIn ? (
                                        <AllStatusReports {...props} />
                                    ) : (
                                        <PermissionDenied />
                                    )}
                                </React.Fragment>
                            )}
                        />
                        <Route
                            path="/status/edit/:dueDateId" exact
                            render={props => (
                                <React.Fragment>
                                    {loggedIn ? (
                                        <EditStatusReport {...props} />
                                    ) : (
                                        <PermissionDenied />
                                    )}
                                </React.Fragment>
                            )}
                        />
                        <Route
                            path="/status/view/:reportId" exact
                            render={props => (
                                <React.Fragment>
                                    {loggedIn ? (
                                        <ViewStatusReport {...props} />
                                    ) : (
                                        <PermissionDenied />
                                    )}
                                </React.Fragment>
                            )}
                        />
                        <Route
                            path="/users" exact
                            render={props => (
                                <React.Fragment>
                                    {isMentor ? (
                                        <AllUsers {...props} />
                                    ) : (
                                        <PermissionDenied />
                                    )}
                                </React.Fragment>
                            )}
                        />
                        <Route
                            path="/users/:userId" exact
                            render={props => (
                                <React.Fragment>
                                    {isMentor ? (
                                        <UserDetail {...props} />
                                    ) : (
                                        <PermissionDenied />
                                    )}
                                </React.Fragment>
                            )}
                        />
                    </div>
                </React.Fragment>
            </BrowserRouter>
        );
    }
}
