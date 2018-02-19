// jshint ignore: start

import moment from 'moment';
import React from 'react';
import { Link } from 'react-router-dom';

import {intersectionExists} from './util';


export default class MyStatusReports extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        this.props.model.on('ready', this.handleChange);
    }

    componentWillUnmount() {
        this.props.model.off('ready', this.handleChange);
    }

    handleChange() {
        this.forceUpdate();
    }

    render() {
        const { model } = this.props;

        if (!model.get('ready')) {
            return null;
        }

        const me = model.get('me');
        const statusReports = model.get('statusReports')
            .filter(d => d.get('user') === window.userId);
        const myGroups = me.get('groups');
        const now = moment();

        const dueDates = model.get('statusReportDueDates')
            .filter(d => intersectionExists(d.get('show_to_groups'), myGroups))
            .sort((a, b) => a.get('date').isBefore(b.get('date')) ? -1 : 1)
            .map(dueDate => {
                const dueDateId = dueDate.get('id');
                const report = statusReports.find(d => d.get('date_due') === dueDateId);
                const date = dueDate.get('date');
                const daysLeft = date.diff(now, 'days', true);

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
                        <time>{date.format('ddd, MMM D')}</time>
                        <span>{description}</span>
                    </Link>
                );
            });

        return (
            <div className="my-status-reports content-inner">
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
