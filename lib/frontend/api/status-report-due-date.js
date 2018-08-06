import gql from 'graphql-tag';
import { graphql } from 'react-apollo';


export const STATUS_REPORT_DUE_DATES_QUERY = gql`
    {
        status_report_due_dates(active: true) {
            date
            id
            show_to_groups
        }
    }
`;


const DELETE_STATUS_REPORT_DUE_DATE_MUTATION = gql`
    mutation DeleteStatusReportDueDate($id: ID!) {
        deleteStatusReportDueDate(id: $id)
    }
`;


const SAVE_STATUS_REPORT_DUE_DATE_MUTATION = gql`
    mutation SaveStatusReportDueDate($id: ID, $date: String!, $show_to_groups: [String!]!) {
        saveStatusReportDueDate(id: $id, date: $date, show_to_groups: $show_to_groups) {
            id
            date
            show_to_groups
        }
    }
`;


export const deleteStatusReportDueDate = graphql(DELETE_STATUS_REPORT_DUE_DATE_MUTATION, {
    options: {
        update: (cache, { data: { deleteStatusReportDueDate: id } }) => {
            const cached = cache.readQuery({ query: STATUS_REPORT_DUE_DATES_QUERY });
            cache.writeQuery({
                query: STATUS_REPORT_DUE_DATES_QUERY,
                data: {
                    status_report_due_dates: cached.status_report_due_dates
                        .filter(dueDate => dueDate.id !== id),
                },
            });
        },
    },
});


export const saveStatusReportDueDate = graphql(SAVE_STATUS_REPORT_DUE_DATE_MUTATION, {
    options: {
        update: (cache, { data: { saveStatusReportDueDate: data } }) => {
            const cached = cache.readQuery({ query: STATUS_REPORT_DUE_DATES_QUERY });
            const dueDates = Array.from(cached.status_report_due_dates);
            const item = dueDates.find(row => row.id === data.id);

            if (item) {
                Object.assign(item, data);
            } else {
                dueDates.push(data);
            }

            cache.writeQuery({
                query: STATUS_REPORT_DUE_DATES_QUERY,
                data: {
                    status_report_due_dates: dueDates,
                },
            });
        },
    },
});
