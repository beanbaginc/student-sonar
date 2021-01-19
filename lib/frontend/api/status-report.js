import gql from 'graphql-tag';
import { graphql } from 'react-apollo';


export const VIEW_STATUS_REPORT_QUERY = gql`
    query ($statusReport: ID!) {
        statusReport(id: $statusReport) {
            dateDue {
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
    query ($dateDue: ID!, $user: ID!) {
        statusReport(dateDue: $dateDue, user: $user) {
            dateDue {
                date
                id
            }
            dateSubmitted
            id
            text
        }
    }
`;


const SAVE_STATUS_REPORT_MUTATION = gql`
    mutation SaveStatusReport($dateDue: ID!, $id: ID, $text: String!, $user: ID!) {
        saveStatusReport(dateDue: $dateDue, id: $id, text: $text, user: $user) {
            dateDue {
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
                dateDue: saveStatusReport.dateDue.id,
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
                    statusReport: saveStatusReport,
                },
            });
        },
    },
});
