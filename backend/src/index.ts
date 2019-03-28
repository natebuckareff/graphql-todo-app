import pool from './pool';
import resolvers from './resolvers';
import { ApolloServer, gql } from 'apollo-server';
import { readFileSync } from 'fs';

const typeDefs = gql(
    readFileSync('./src/schema.graphql', { encoding: 'utf8' }),
);

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: { pool },
});

server
    .listen({ port: 5000 })
    .then(({ url }: { url: String }) => console.log(`Backend ready at ${url}`));
