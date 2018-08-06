import gql from 'graphql-tag';
import { graphql } from 'react-apollo';


export const VIEW_STATUS_REPORT_QUERY = gql`
    query ($status_report: ID!) {
        status_report(id: $status_report) {
            date_due {
                date
            }
            text
            user {
                name
            }
        }
    }
`;


export const EDIT_STATUS_REPORT_QUERY = gql`
    query ($date_due: ID!, $user: ID!) {
        status_report(date_due: $date_due, user: $user) {
            date_due {
                date
                id
            }
            id
            text
        }
    }
`;


const SAVE_STATUS_REPORT_MUTATION = gql`
    mutation SaveStatusReport($date_due: ID!, $id: ID, $text: String!, $user: ID!) {
        saveStatusReport(date_due: $date_due, id: $id, text: $text, user: $user) {
            date_due {
                date
                id
            }
            id
            text
            user {
                id
            }
        }
    }
`;


export const saveStatusReport = graphql(SAVE_STATUS_REPORT_MUTATION, {
    options: {
        update: (cache, { data: { saveStatusReport } }) => {
            const variables = {
                date_due: saveStatusReport.date_due.id,
                user: saveStatusReport.user.id,
            };

            const cached = cache.readQuery({
                query: EDIT_STATUS_REPORT_QUERY,
                variables: variables,
            });
            cache.writeQuery({
                query: EDIT_STATUS_REPORT_QUERY,
                variables: variables,
                data: {
                    status_report: saveStatusReport,
                },
            });
        },
    },
});
