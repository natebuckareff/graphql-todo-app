import * as schema from '../gen/graphql';
import { DatabaseConnectionType } from 'slonik';
import { createAccessToken, AccessToken } from './auth';
import { createTodoList, getTodoListByOwner } from './orm/TodoList';
import { createUser, getAllUsers, getUserByID } from './orm/User';
import { getTodoItemByList } from './orm/TodoItem';
import { transaction } from './util';

export interface Context {
    con: DatabaseConnectionType;
    access?: AccessToken;
}

function auth<TResult, TParent, TArgs>(
    resolver: schema.ResolverFn<TResult, TParent, Context, TArgs>,
): schema.ResolverFn<TResult, TParent, Context, TArgs> {
    return (parent, args, context, info) => {
        if (!context.access) {
            throw new Error('Unauthorized request');
        }
        return resolver(parent, args, context, info);
    };
}

const resolvers: schema.Resolvers<Context> = {
    Query: {
        login: (_root, { name, password }, { con }) =>
            createAccessToken(con, name, password),

        users: async (_root, _args, { con }) =>
            transaction(con, trx => getAllUsers(trx)),

        getUser: async (_root, { id }, { con }) =>
            transaction(con, trx => getUserByID(trx, id)),
    },

    Mutation: {
        register: async (_root, { name, password }, { con }) => {
            const user = await transaction(con, trx =>
                createUser(trx, { name, password }),
            );
            return {
                id: user.id,
                name: user.name,
            };
        },

        createList: auth(async (_root, { list }, { con, access }) => {
            const r = await transaction(con, trx =>
                createTodoList(trx, {
                    owner: access!.uid,
                    items: list.items,
                }),
            );
            return {
                id: r.id,
                items: await getTodoItemByList(con, r.id),
            };
        }),
    },

    User: {
        lists: auth(async (parent, _args, { con, access }) => {
            if (parent.id !== access!.uid) {
                throw new Error('Unauthorized request');
            }
            return (await getTodoListByOwner(con, parent.id)).map(({ id }) => ({
                id,
            }));
        }),
    },

    TodoList: {
        owner: (parent, _args, { con }) => getUserByID(con, parent.owner!.id),
        items: (parent, _args, { con }) => getTodoItemByList(con, parent.id),
    },
};

export default resolvers;
