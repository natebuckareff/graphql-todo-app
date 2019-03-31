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

- [x] Setup dev environment with docker and basic queries
- [ ] Mutations
- [x] User registration and login
- [x] Basic authentication
- [ ] Authenticated resolvers
- [ ] Setup repo secrets management
- [x] Postgres schema and deciding on an ORM
- [ ] Refactor ORM into individual models
- [ ] Improve DX with npm and docker-compose
- [ ] Redis caching for fun and profit
- [ ] MVP frontend
