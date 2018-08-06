// jshint ignore: start

import React from 'react';
import { connect } from 'react-redux';


@connect(state => ({ loggedIn: state.loggedIn }))
export default class Index extends React.Component {
    render() {
        return (
            <div className="content-inner">
                <div className="page-header">
                    <h1>Student Sonar</h1>
                </div>
                {this.props.loggedIn ? (
                    <React.Fragment>
                        <p>
                            Sonar is a tool to help keep track of students working
                            on Review Board.
                        </p>
                        <p>On the left, you'll see various components:</p>
                        <dl className="dl-horizontal">
                            <dt>Project Ideas</dt>
                            <dd>
                                A list of suggested projects that you can work on. If
                                you don't see anything you like, feel free to suggest
                                your own!
                            </dd>

                            <dt>Calendar</dt>
                            <dd>
                                A list of important dates for your term.
                            </dd>

                            <dt>My Status Reports</dt>
                            <dd>
                                Here's where you'll go to submit your weekly status
                                report. Make sure to pay attention and get them in on
                                time.
                            </dd>
                        </dl>
                    </React.Fragment>
                ) : (
                    <React.Fragment>
                        <p>
                            Sonar is a tool to help keep track of students working on
                            Review Board. To access most of the features of Sonar such
                            as submitting your status reports, you'll need to log in.
                        </p>
                        <p>
                            Login is done via Slack. If you haven't already accepted
                            your invitation to Slack, you'll need to do that before
                            you can log in here.
                        </p>
                        <div className="text-center">
                            <a href="/login" className="btn btn-default btn-lg">
                                <img src="/images/slack-logo.png" width="24" height="24" />
                                Login with Slack
                            </a>
                        </div>
                    </React.Fragment>
                )}
            </div>
        );
    }
}
