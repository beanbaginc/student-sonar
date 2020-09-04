import gql from 'graphql-tag';
import { graphql } from 'react-apollo';


export const fragments = {
    basicUserData: gql`
        fragment BasicUserData on User {
            avatar
            email
            groups
            id
            name
            slackUsername
        }
    `,
    userDetailData: gql`
        fragment UserDetailData on User {
            assignedMentor
            avatar
            demos {
                color
                href
                text
            }
            email
            groups
            id
            name
            notes
            projects {
                completed
                href
                id
                name
            }
            rbUsername
            school
            slackUsername
            statusReports {
                dateDue {
                    date
                    id
                }
                dateSubmitted
                id
                href
            }
            statusReportDueDates {
                date
                id
            }
            timezone
        }
    `,
};


export const ALL_USERS_QUERY = gql`
    {
        users {
            ...BasicUserData
            school
        }
    }

    ${fragments.basicUserData}
`;


export const MENTORS_QUERY = gql`
    {
        users(isMentor: true) {
            ...BasicUserData
        }
    }

    ${fragments.basicUserData}
`;


export const MY_STATUS_REPORTS_QUERY = gql`
    query ($id: ID) {
        user(id: $id) {
            ...BasicUserData
            statusReports {
                dateDue {
                    id
                }
            }
            statusReportDueDates {
                date
                id
            }
        }
    }

    ${fragments.basicUserData}
`;


export const ACTIVE_STATUS_REPORTS_QUERY = gql`
    {
        users(active: true) {
            ...BasicUserData
            statusReports {
                dateDue {
                    id
                }
                id
            }
            statusReportDueDates {
                id
            }
        }
    }

    ${fragments.basicUserData}
`;


export const USER_DETAIL_QUERY = gql`
    query ($slackUsername: String) {
        user(slackUsername: $slackUsername) {
            ...UserDetailData
        }
    }

    ${fragments.userDetailData}
`;


const SAVE_USER_MUTATION = gql`
    mutation saveUser(
        $assignedMentor: ID,
        $demos: [LinkInput!]!
        $email: String,
        $groups: [String!]!
        $id: ID!,
        $notes: String,
        $rbUsername: String,
        $school: String
    ) {
        saveUser(
            assignedMentor: $assignedMentor,
            demos: $demos,
            email: $email,
            groups: $groups,
            id: $id,
            notes: $notes,
            rbUsername: $rbUsername,
            school: $school
        ) {
            ...UserDetailData
        }
    }

    ${fragments.userDetailData}
`;


export const saveUser = graphql(SAVE_USER_MUTATION);
