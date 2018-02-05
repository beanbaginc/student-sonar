// jshint ignore: start

import marked from 'marked';
import moment from 'moment';
import React from 'react';


export default class ViewStatusReport extends React.Component {
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
        const { match, model } = this.props;
        const report = model.get('statusReports').get(match.params.reportId);

        let data = null;

        if (report) {
            const dueDate = model.get('statusReportDueDates').get(
                report.get('date_due'));
            const user = model.get('users').get(report.get('user'));

            // TODO: show error + raw text if markdown fails
            marked.setOptions({
                gfm: true,
                breaks: true,
                sanitize: true,
                smartLists: true,
                smartypants: true
            });

            const content = { __html: marked(report.get('text')) };

            data = (
                <React.Fragment>
                    <div className="page-header">
                        <h1>
                            Status Report for {dueDate.get('date').format('ddd, MMM D')}
                            <span className="small">{user.get('name')}</span>
                        </h1>
                    </div>
                    <div dangerouslySetInnerHTML={content} />
                </React.Fragment>
            );
        } else if (model.get('ready')) {
            data = (
                <div className="page-header">
                    <h1>Not Found</h1>
                </div>
            );
        }

        return <div className="view-status-report content-inner">{data}</div>;
    }
}
