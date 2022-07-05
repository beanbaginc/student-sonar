import { gql } from '@apollo/client';


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
