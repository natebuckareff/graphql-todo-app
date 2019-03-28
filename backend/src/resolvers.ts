import * as schema from '../gen/graphql';
import { DatabasePoolType } from 'slonik';
import { User, TodoList, TodoItem } from './orm';
import { transaction } from './util';

interface Context {
    pool: DatabasePoolType;
}

const resolvers: schema.Resolvers<Context> = {
    Query: {
        users: async (_root, _args, { pool }) => User.getAll(pool),

        getUser: async (_root, { id }, { pool }) => User.getByID(pool, id),

        findUser: (_root, { contains }, { pool }) =>
            User.getByName(pool, contains),
    },
    Mutation: {
        register: async (_root, { name, password }, { pool }) =>
            transaction(pool, trx => User.create(trx, name, password)),
    },
    User: {
        lists: (parent, _args, { pool }) => TodoList.getByOwner(pool, parent),
    },
    TodoList: {
        owner: (parent, _args) => parent.owner,
        items: (parent, _args, { pool }) => TodoItem.getByList(pool, parent),
    },
    TodoItem: {
        list: (parent, _args, { pool }) =>
            TodoList.getByID(pool, parent.list!.id),
    },
};

export default resolvers;
