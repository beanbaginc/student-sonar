// jshint ignore: start

import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

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


export default class Application extends React.Component {
    render() {
        const { model } = this.props;
        const loggedIn = (window.userId !== null);
        const isMentor = (window.userType === 'mentor');

        return (
            <BrowserRouter>
                <React.Fragment>
                    <Header
                        loggedIn={loggedIn}
                        isMentor={isMentor}
                        manage={model.get('manage')}
                        onManageChanged={manage => model.set({ manage })}
                    />
                    <Sidebar
                        loggedIn={loggedIn}
                        isMentor={isMentor}
                        model={model}
                    />
                    <div className="main">
                        <Route
                            path="/" exact
                            render={props => (
                                <Index loggedIn={loggedIn} {...props} />
                            )}
                        />
                        <Route
                            path="/calendar" exact
                            render={props => (
                                <Calendar model={model} {...props} />
                            )}
                        />
                        <Route
                            path="/projects" exact
                            render={props => (
                                <ProjectList model={model} {...props} />
                            )}
                        />
                        <Route
                            path="/projects/:taskId" exact
                            render={props => (
                                <SingleProject model={model} {...props} />
                            )}
                        />
                        <Route
                            path="/status" exact
                            render={props => (
                                <React.Fragment>
                                    {loggedIn ? (
                                        <MyStatusReports model={model} {...props} />
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
                                        <AllStatusReports model={model} {...props} />
                                    ) : (
                                        <PermissionDenied loggedIn={loggedIn} />
                                    )}
                                </React.Fragment>
                            )}
                        />
                        <Route
                            path="/status/edit/:dueDateId" exact
                            render={props => (
                                <React.Fragment>
                                    {loggedIn ? (
                                        <EditStatusReport model={model} {...props} />
                                    ) : (
                                        <PermissionDenied loggedIn={loggedIn} />
                                    )}
                                </React.Fragment>
                            )}
                        />
                        <Route
                            path="/status/view/:reportId" exact
                            render={props => (
                                <React.Fragment>
                                    {loggedIn ? (
                                        <ViewStatusReport model={model} {...props} />
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
                                        <AllUsers model={model} {...props} />
                                    ) : (
                                        <PermissionDenied loggedIn={loggedIn} />
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
                                        <PermissionDenied loggedIn={loggedIn} />
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
