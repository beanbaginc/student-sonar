import gql from 'graphql-tag';


export const CALENDAR_QUERY = gql`
    {
        calendar {
            items {
                all_day
                end
                id
                start
                title
            }
            subscribe_url
        }
    }
`;
