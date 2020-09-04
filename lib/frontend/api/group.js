import gql from 'graphql-tag';

import { fragments as userFragments } from './user';


export const ACTIVE_GROUPS_QUERY = gql`
    {
        groups(active:true) {
            id
            name
            users {
                ...BasicUserData
                assignedMentor
            }
        }
    }

    ${userFragments.basicUserData}
`;


export const ALL_GROUPS_QUERY = gql`
    {
        groups {
            active
            groupId
            id
            name
        }
    }
`;
