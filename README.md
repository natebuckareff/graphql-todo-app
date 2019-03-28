# graphql-todo-app

Toy todo list app for learning GraphQL and Apollo.

## Quick Start

Rename `.env.example` to `.env` and change the secrets to something sane

Ensure docker and docker-compose are installed

    docker-compose up --build

In a seperate terminal

    cd backend
    npm run codegen-watch

Go to http://localhost:5000/.

## Todo

- [x] Setup dev environment with docker and basic queries
- [ ] Mutations
- [ ] Authentication
- [ ] Setup repo secrets management
- [ ] Postgres schema and deciding on an ORM
- [ ] Improve DX with npm and docker-compose
- [ ] Redis caching for fun and profit
- [ ] MVP frontend