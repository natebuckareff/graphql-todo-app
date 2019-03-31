# graphql-todo-app

Toy todo list app for learning GraphQL and Apollo.

## Quick Start

Rename `.env.example` to `.env` and change the secrets to something sane

Install openssl. With chocolatey on windows:

    choco install openssl.light

Ensure docker and docker-compose are installed and run migration

    npm run docker
    npm run migrate:up

In a seperate terminal

    cd backend
    npm run codegen-watch

Go to http://localhost:5000/.

## Todo

- [ ] Mutations
- [ ] Authenticated resolvers
- [ ] Setup repo secrets management
- [ ] Refactor ORM into individual models
- [ ] Improve DX with npm and docker-compose
    - [ ] Parameterize container names
- [ ] Redis caching for fun and profit
- [ ] MVP frontend
- [x] ~~Setup dev environment with docker and basic queries~~
- [x] ~~User registration and login~~
- [x] ~~Basic authentication~~
- [x] ~~Postgres schema and deciding on an ORM~~
