import express = require('express');
import pool from './pool';
import resolvers from './resolvers';
import { ApolloServer, gql } from 'apollo-server-express';
import { readFileSync } from 'fs';
import { verifyAccessToken } from './auth';

const typeDefs = gql(
    readFileSync('./src/schema.graphql', { encoding: 'utf8' }),
);

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req, res }) => {
        let access = undefined;
        if (req.headers.authorization) {
            const [prefix, token] = req.headers.authorization.split(' ');
            if (prefix !== 'Bearer') {
                throw new Error('Expected Bearer authorization header');
            }
            try {
                access = await verifyAccessToken(token);
            } catch {
                throw new Error('Failed to verify access token');
            }
        }
        return {
            con: res.locals.con,
            access,
        };
    },
});

const app = express();

app.use('/', (_req, res, next) =>
    pool.connect(async con => {
        res.locals = { con };
        next();
    }),
);

server.applyMiddleware({ app, path: '/graphql' });

app.listen({ port: 5000 }, () =>
    console.log(`Ready at http://localhost:5000${server.graphqlPath}`),
);
