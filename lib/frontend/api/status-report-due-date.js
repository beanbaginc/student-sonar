import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc/index.js';


export const STATUS_REPORT_DUE_DATES_QUERY = gql`
    {
        statusReportDueDates(active: true) {
            date
            id
            showToGroups
        }
    }
`;


const DELETE_STATUS_REPORT_DUE_DATE_MUTATION = gql`
    mutation DeleteStatusReportDueDate($id: ID!) {
        deleteStatusReportDueDate(id: $id)
    }
`;


const SAVE_STATUS_REPORT_DUE_DATE_MUTATION = gql`
    mutation SaveStatusReportDueDate($id: ID, $date: String!, $showToGroups: [String!]!) {
        saveStatusReportDueDate(id: $id, date: $date, showToGroups: $showToGroups) {
            id
            date
            showToGroups
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
                    statusReportDueDates: cached.statusReportDueDates
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
            const dueDates = Array.from(cached.statusReportDueDates);
            const item = dueDates.find(row => row.id === data.id);

            if (item) {
                Object.assign(item, data);
            } else {
                dueDates.push(data);
            }

            cache.writeQuery({
                query: STATUS_REPORT_DUE_DATES_QUERY,
                data: {
                    statusReportDueDates: dueDates,
                },
            });
        },
    },
});
