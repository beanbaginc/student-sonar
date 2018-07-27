// jshint ignore: start

import moment from 'moment';
import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import showdown from 'showdown';


class ViewStatusReport extends React.Component {
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
        const {
            dueDate,
            report,
            user,
        } = this.props;

        let data = null;

        if (report) {
            // TODO: show error + raw text if markdown fails
            const converter = new showdown.Converter();
            converter.setFlavor('github');

            const content = { __html: converter.makeHtml(report.text) };
            const dateString = moment(dueDate.date).format('ddd, MMM D');

            data = (
                <React.Fragment>
                    <Helmet>
                        <title>Status Report for {user.name} {dateString} - Student Sonar</title>
                    </Helmet>
                    <div className="page-header">
                        <h1>
                            Status Report for {dateString}
                            <span className="small">{user.name}</span>
                        </h1>
                    </div>
                    <div dangerouslySetInnerHTML={content} />
                </React.Fragment>
            );
        }

        return <div className="view-status-report content-inner">{data}</div>;
    }
}


const mapStateToProps = (state, props) => {
    const {
        statusReportDueDates,
        statusReports,
        users,
    } = state;

    const report = statusReports.items
        .find(report => report._id === props.match.params.reportId);
    let dueDate = null;
    let user = null;

    if (report) {
        dueDate = statusReportDueDates.items
            .find(dueDate => dueDate._id === report.date_due);
        user = users.items.find(user => user._id === report.user);
    }

    return {
        dueDate,
        report,
        user,
    };
};
export default connect(mapStateToProps)(ViewStatusReport);
