// jshint ignore: start

import moment from 'moment';
import React from 'react';
import { graphql } from 'react-apollo';
import Helmet from 'react-helmet';
import showdown from 'showdown';

import { VIEW_STATUS_REPORT_QUERY } from './api/status-report';


@graphql(VIEW_STATUS_REPORT_QUERY, {
    options: props => ({
        variables: {
            status_report: props.match.params.reportId,
        },
    }),
})
export default class ViewStatusReport extends React.Component {
    render() {
        const { data: { loading, error, status_report } } = this.props;

        let content;

        if (loading) {
            content = (
                <div className="spinner">
                    <span className="fas fa-sync fa-spin"></span>
                </div>
            );
        } else if (error) {
            content = (
                <React.Fragment>
                    <span className="fas fa-exclamation-triangle"></span>
                    {error}
                </React.Fragment>
            );
        } else {
            const converter = new showdown.Converter();
            converter.setFlavor('github');

            const rendered = { __html: converter.makeHtml(status_report.text) };
            const dateString = moment(status_report.date_due.date).format('ddd, MMM D');

            content = (
                <React.Fragment>
                    <Helmet>
                        <title>Status Report for {status_report.user.name} {dateString} - Student Sonar</title>
                    </Helmet>
                    <div className="page-header">
                        <h1>
                            Status Report for {dateString}
                            <span className="small">{status_report.user.name}</span>
                        </h1>
                    </div>
                    <div dangerouslySetInnerHTML={rendered} />
                </React.Fragment>
            );
        }

        return <div className="view-status-report content-inner">{content}</div>;
    }
}
