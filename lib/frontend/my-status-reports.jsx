// jshint ignore: start

import moment from 'moment';
import React from 'react';
import { graphql } from 'react-apollo';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';

import { MY_STATUS_REPORTS_QUERY } from './api/user';
import {intersectionExists} from './util';


@graphql(MY_STATUS_REPORTS_QUERY, {
    options: {
        variables: {
            id: window.userId,
        },
    },
})
export default class MyStatusReports extends React.Component {
    render() {
        const { data: { loading, error, user } } = this.props;

        let content;

        if (loading) {
            content = (
                <div className="list-group-item">
                    <span className="fas fa-sync fa-spin"></span>
                </div>
            );
        } else if (error) {
            content = (
                <div className="list-group-item">
                    <span className="fas fa-exclamation-triangle"></span>
                    {error}
                </div>
            );
        } else {
            const now = moment();

            content = user.status_report_due_dates.map(dueDate => {
                const report = user.status_reports.find(r => r.date_due.id === dueDate.id);
                const date = moment(dueDate.date);
                const daysLeft = date.diff(now, 'days', true);

                let itemClass = ''
                let description = '';

                if (report) {
                    itemClass = 'list-group-item-success';
                    description = 'Submitted';
                } else if (daysLeft < 0) {
                    itemClass = 'list-group-item-danger';
                    description = 'Past Due';
                } else if (daysLeft < 3) {
                    itemClass = 'list-group-item-warning';
                    description = 'Due Soon';
                }

                return (
                    <Link
                        key={dueDate.id}
                        to={`/status/edit/${dueDate.id}`}
                        className={`list-group-item ${itemClass}`}>
                        <time>{date.format('ddd, MMM D')}</time>
                        <span>{description}</span>
                    </Link>
                )
            });
        }

        return (
            <div className="my-status-reports content-inner">
                <Helmet>
                    <title>My Status Reports - Student Sonar</title>
                </Helmet>
                <div className="panel panel-default">
                    <div className="panel-heading">My Status Reports</div>
                    <div className="list-group">
                        {content}
                    </div>
                </div>
            </div>
        );
    }
}
