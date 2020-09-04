// jshint ignore: start

import moment from 'moment';
import React from 'react';
import { graphql } from 'react-apollo';
import Helmet from 'react-helmet';

import { CALENDAR_QUERY } from './api/calendar';


@graphql(CALENDAR_QUERY)
export default class Calendar extends React.Component {
    render() {
        const {
            data: {
                loading,
                error,
                calendar
            }
        } = this.props;

        let content;

        if (loading) {
            content = <div className="spinner"><span className="fas fa-sync fa-spin" /></div>;
        } else if (error) {
            content = (
                <div>
                    <span className="fas fa-exclamation-triangle" />
                    {error}
                </div>
            );
        } else {
            const entries = calendar.items.map(item => {
                let dateText;

                if (item.allDay) {
                    const date = moment(item.start).utc();
                    dateText = date.format('ddd, DD MMM YYYY');
                } else {
                    const start = moment(item.start);
                    const end = moment(item.end);
                    dateText = `${start.format('ddd, DD MMM YYYY')} ${start.format('LT')} - ${end.format('LT')}`;
                }

                return (
                    <li key={item.id} className="event-list-day">
                        <time>{dateText}</time>
                        <ul>
                            <li className="calendar-item">{item.title}</li>
                        </ul>
                    </li>
                );
            });

            content = (
                <div className="calendar">
                    <ul className="event-list">
                        {entries}
                    </ul>
                    <a href={calendar.subscribeURL}>Subscribe to ICS</a>
                </div>
            );
        }

        return (
            <React.Fragment>
                <Helmet>
                    <title>Calendar - Student Sonar</title>
                </Helmet>
                {content}
            </React.Fragment>
        );
    }
}
