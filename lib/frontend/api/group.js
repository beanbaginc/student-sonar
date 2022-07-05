import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';

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
            showInSidebar
        }
    }
`;


const DELETE_GROUP_MUTATION = gql`
    mutation DeleteGroup($id: ID!) {
        deleteGroup(id: $id)
    }
`;


const SAVE_GROUP_MUTATION = gql`
    mutation saveGroup(
        $active: Boolean!
        $groupId: String!
        $id: ID
        $name: String!
        $showInSidebar: Boolean!
    ) {
        saveGroup(
            active: $active
            groupId: $groupId
            id: $id,
            name: $name
            showInSidebar: $showInSidebar
        ) {
            active
            groupId
            id
            name
            showInSidebar
        }
    }
`;


export const deleteGroup = graphql(DELETE_GROUP_MUTATION, {
    options: {
        update: (cache, { data: { deleteGroup: id } }) => {
            const cached = cache.readQuery({ query: ALL_GROUPS_QUERY });
            cache.writeQuery({
                query: ALL_GROUPS_QUERY,
                data: {
                    groups: cached.groups.filter(group => group.id !== id),
                },
            });
        },
    },
});


export const saveGroup = graphql(SAVE_GROUP_MUTATION, {
    options: {
        update: (cache, { data: { saveGroup: data } }) => {
            const cached = cache.readQuery({ query: ALL_GROUPS_QUERY });
            const groups = Array.from(cached.groups);
            const item = groups.find(row => row.id === data.id);

            if (item) {
                Object.assign(item, data);
            } else {
                groups.push(data);
            }

            cache.writeQuery({
                query: ALL_GROUPS_QUERY,
                data: {
                    groups: groups,
                },
            });
        },
    },
});
