import { gql } from 'apollo-server';

export default gql`
    interface Entity {
        id: ID!
    }

    type User implements Entity {
        id: ID!
        name: String
        lists: [List]
    }

    type List implements Entity {
        id: ID!
        owner: User
        items: [Item]
    }

    type Item implements Entity {
        id: ID!
        list: List
        completed: Boolean
        content: String
    }

    type Query {
        users: [User]
        getUser(id: ID!): User
        findUser(contains: String): [User]
    }
`;
