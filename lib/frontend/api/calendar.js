import gql from 'graphql-tag';


export const CALENDAR_QUERY = gql`
    {
        calendar {
            items {
                allDay
                end
                id
                start
                title
            }
            subscribeURL
        }
    }
`;
