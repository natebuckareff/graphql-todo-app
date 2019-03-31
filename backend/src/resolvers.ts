import * as schema from '../gen/graphql';
import { DatabaseConnectionType } from 'slonik';
import { User, TodoList, TodoItem } from './orm';
import { createAccessToken, verifyAccessToken } from './auth';
import { transaction, Maybe } from './util';

interface Context {
    auth: string;
    con: DatabaseConnectionType;
}

function auth<TResult, TParent, TArgs>(
    resolver: schema.ResolverFn<TResult, TParent, Context, TArgs>,
): schema.ResolverFn<TResult, TParent, Context, TArgs> {
    return async (parent, args, context, info) => {
        const [prefix, token] = context.auth.split(' ');
        if (prefix !== 'Bearer') {
            throw new Error('Invalid Bearer Authorization header');
        }
        try {
            await verifyAccessToken(token);
        } catch {
            throw new Error('Failed to verify access token');
        }
        return resolver(parent, args, context, info);
    };
}

const resolvers: schema.Resolvers<Context> = {
    Query: {
        login: async (_root, { name, password }, { con }) =>
            createAccessToken(con, name, password),

        users: async (_root, _args, { con }) => User.getAll(con),
        getUser: async (_root, { id }, { con }) => User.getByID(con, id),
    },
    Mutation: {
        register: async (_root, { name, password }, { con }) =>
            transaction(con, trx => User.create(trx, name, password)),

        createList: auth(_root => {
            return null;
        }),
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
