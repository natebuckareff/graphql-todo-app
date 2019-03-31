import express = require('express');
import pool from './pool';
import resolvers from './resolvers';
import { ApolloServer, gql } from 'apollo-server-express';
import { readFileSync } from 'fs';

const typeDefs = gql(
    readFileSync('./src/schema.graphql', { encoding: 'utf8' }),
);

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => ({
        auth: req.headers.authorization,
        con: res.locals.con,
    }),
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
