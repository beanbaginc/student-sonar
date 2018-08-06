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
            slack_username
        }
    `,
    userDetailData: gql`
        fragment UserDetailData on User {
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
            primary_mentor
            projects {
                completed
                href
                id
                name
            }
            rb_username
            school
            slack_username
            status_reports {
                date_due {
                    date
                    id
                }
                date_submitted
                id
                href
            }
            status_report_due_dates {
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
        users(is_mentor: true) {
            ...BasicUserData
        }
    }

    ${fragments.basicUserData}
`;


export const MY_STATUS_REPORTS_QUERY = gql`
    query ($id: ID) {
        user(id: $id) {
            ...BasicUserData
            status_reports {
                date_due {
                    id
                }
            }
            status_report_due_dates {
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
            status_reports {
                date_due {
                    id
                }
                id
            }
            status_report_due_dates {
                id
            }
        }
    }

    ${fragments.basicUserData}
`;


export const USER_DETAIL_QUERY = gql`
    query ($slack_username: String) {
        user(slack_username: $slack_username) {
            ...UserDetailData
        }
    }

    ${fragments.userDetailData}
`;


const SAVE_USER_MUTATION = gql`
    mutation saveUser(
        $demos: [LinkInput!]!
        $email: String,
        $groups: [String!]!
        $id: ID!,
        $notes: String,
        $primary_mentor: ID,
        $rb_username: String,
        $school: String
    ) {
        saveUser(
            demos: $demos,
            email: $email,
            groups: $groups,
            id: $id,
            notes: $notes,
            primary_mentor: $primary_mentor,
            rb_username: $rb_username,
            school: $school
        ) {
            ...UserDetailData
        }
    }

    ${fragments.userDetailData}
`;


export const saveUser = graphql(SAVE_USER_MUTATION);
