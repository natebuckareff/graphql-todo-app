import * as schema from '../gen/graphql';
import TodoItem from './orm/TodoItem';
import TodoList from './orm/TodoList';
import User from './orm/User';
import { DatabaseConnectionType } from 'slonik';
import { createAccessToken } from './auth';
import { transaction, Maybe } from './util';

export interface Context {
    con: DatabaseConnectionType;
    access?: any;
}

function auth<TResult, TParent, TArgs>(
    resolver: schema.ResolverFn<TResult, TParent, Context, TArgs>,
): schema.ResolverFn<TResult, TParent, Context, TArgs> {
    return (parent, args, context, info) => {
        if (context.access) {
            throw new Error('Unauthorized request');
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

        createList: auth((_root, { list }) => {
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
