// jshint ignore: start

import moment from 'moment';
import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import {intersectionExists} from './util';


class MyStatusReports extends React.Component {
    render() {
        const { myUser, statusReports, statusReportDueDates } = this.props;

        if (myUser === null) {
            return null;
        }

        const myStatusReports = statusReports.items.filter(
            report => report.user === myUser._id);
        const myGroups = new Set(myUser.groups);
        const now = moment();

        const dueDates = statusReportDueDates.items
            .filter(d => intersectionExists(new Set(d.show_to_groups), myGroups))
            .sort((a, b) => a.date.isBefore(b.date) ? -1 : 1)
            .map(dueDate => {
                const dueDateId = dueDate._id;
                const report = myStatusReports.find(d => d.date_due === dueDateId);
                const daysLeft = dueDate.date.diff(now, 'days', true);

                let itemClass = '';
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
                        key={dueDateId}
                        to={`/status/edit/${dueDateId}`}
                        className={`list-group-item ${itemClass}`}>
                        <time>{dueDate.date.format('ddd, MMM D')}</time>
                        <span>{description}</span>
                    </Link>
                );
            });

        return (
            <div className="my-status-reports content-inner">
                <Helmet>
                    <title>My Status Reports - Student Sonar</title>
                </Helmet>
                <div className="panel panel-default">
                    <div className="panel-heading">My Status Reports</div>
                    <div className="list-group">
                        {dueDates}
                    </div>
                </div>
            </div>
        );
    }
}


const mapStateToProps = state => ({
    myUser: state.users.myUser,
    statusReports: state.statusReports,
    statusReportDueDates: state.statusReportDueDates,
});
export default connect(mapStateToProps)(MyStatusReports);
