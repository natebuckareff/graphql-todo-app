import * as schema from '../gen/graphql';
import { DatabaseConnectionType } from 'slonik';
import { User, TodoList, TodoItem } from './orm';
import { transaction, Maybe } from './util';

interface Context {
    con: DatabaseConnectionType;
}

const resolvers: schema.Resolvers<Context> = {
    Query: {
        users: async (_root, _args, { con }) => User.getAll(con),
        getUser: async (_root, { id }, { con }) => User.getByID(con, id),

        findUser: (_root, { contains }, { con }) =>
            User.getByName(con, contains),
    },
    Mutation: {
        register: async (_root, { name, password }, { con }) =>
            transaction(con, trx => User.create(trx, name, password)),
    },
    User: {
        lists: (parent, _args, { con }) => TodoList.getByOwner(con, parent),
    },
    TodoList: {
        owner: (parent, _args) => parent.owner as Maybe<User>,
        items: (parent, _args, { con }) => TodoItem.getByList(con, parent),
    },
    TodoItem: {
        list: (parent, _args, { con }) =>
            TodoList.getByID(con, parent.list!.id),
    },
};

export default resolvers;
