import { DatabasePoolConnectionType, sql } from 'slonik';
import { Resolvers } from '../gen/graphql';
import { User, TodoList, TodoItem } from './store';

interface Context {
    connection: DatabasePoolConnectionType;
}

const resolvers: Resolvers<Context> = {
    Query: {
        users: async (_root, _args, { connection }) => User.getAll(connection),

        getUser: async (_root, { id }, { connection }) =>
            User.getByID(connection, id),

        findUser: (_root, { contains }, { connection }) =>
            User.getByName(connection, contains),
    },
    User: {
        lists: (parent, _args, { connection }) =>
            TodoList.getByOwner(connection, parent),
    },
    TodoList: {
        owner: (parent, _args) => parent.owner,
        items: (parent, _args, { connection }) =>
            TodoItem.getByList(connection, parent),
    },
    TodoItem: {
        list: (parent, _args, { connection }) =>
            TodoList.getByID(connection, parent.list.id),
    },
};

export default resolvers;
