import { gql } from '@apollo/client';

import { fragments as userFragments } from './user';


export const PROJECT_QUERY = gql`
    query ($project: ID!) {
        project(id: $project) {
            completed
            html
            id
            name
            section
            tags
            user {
                ...BasicUserData
            }
        }
    }

    ${userFragments.basicUserData}
`;


export const PROJECTS_QUERY = gql`
    {
        projects {
            completed
            html
            id
            name
            section
            tags
            user {
                ...BasicUserData
            }
        }
    }

    ${userFragments.basicUserData}
`;
