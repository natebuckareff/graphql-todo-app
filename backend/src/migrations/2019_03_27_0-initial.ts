import { DatabaseTransactionConnectionType, sql } from 'slonik';

export async function up(tx: DatabaseTransactionConnectionType) {
    await tx.query(sql`
        create table "Auth" (
            id serial primary key,
            hash bytea not null,
            salt bytea not null,
            reps int4 not null
        );

        create table "User" (
            id serial primary key,
            auth int not null references "Auth" (id),
            name text unique not null
        );

        create table "TodoList" (
            id serial primary key,
            owner int not null references "User" (id)
        );

        create table "TodoItem" (
            id serial primary key,
            list int not null references "TodoList" (id),
            completed boolean not null,
            content text not null
        );
    `);
}

export async function down(tx: DatabaseTransactionConnectionType) {
    await tx.query(sql`
        drop table "User" cascade;
        drop table "Auth" cascade;
        drop table "TodoList" cascade;
        drop table "TodoItem" cascade;
    `);
}
