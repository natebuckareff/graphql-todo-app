# graphql-todo-app

Toy todo list app for learning GraphQL and Apollo.

## Quick Start

Rename `.env.example` to `.env` and change the secrets to something sane

Install openssl. With chocolatey on windows:

    choco install openssl.light

Generate private key for signing access tokens and generate types from the
GraphQL schema file:

    cd backend
    npm i
    npm run keygen
    npm run codegen:watch

Ensure docker and docker-compose are installed. Then start the compose services,
and run database migrations:

    npm start
    npm run migrate:up

Go to http://localhost:5000/.

## Todo

- [ ] Mutations
- [ ] Setup repo secrets management
- [ ] Refactor ORM into individual models
- [ ] Improve DX with npm and docker-compose
    - [ ] Parameterize container names
- [ ] Redis caching for fun and profit
- [ ] MVP frontend
- [x] ~~Authenticated resolvers~~
- [x] ~~Better key management~~
- [x] ~~Setup dev environment with docker and basic queries~~
- [x] ~~User registration and login~~
- [x] ~~Basic authentication~~
- [x] ~~Postgres schema and deciding on an ORM~~
