import * as ck from '../check';
import Auth from './Auth';
import TodoList from './TodoList';
import { CommonQueryMethodsType, sql } from 'slonik';
import { Entity, EntitySet } from '../ent';
import { createHashedPassword } from '../auth';

export default class User extends Entity {
    private _auth: string;
    private _name: string;

    constructor(object: any, eset: EntitySet) {
        super(object, eset, ['auth', 'name'], ['lists']);
        this._auth = ck.union(ck.number, ck.string)(object.auth) + '';
        this._name = ck.string(object.name);
    }

    get auth() {
        return this._auth && this.eset.getOne(User, this._auth);
    }

    get name() {
        return this._name;
    }

    get lists() {
        return this.eset.getMany(TodoList, 'owner', this.id);
    }
}

export type CreateUser = { name: string; password: string };

export async function createUser(
    q: CommonQueryMethodsType,
    es: EntitySet,
    params: CreateUser,
): Promise<User> {
    const hashedPassword = await createHashedPassword(params.password);
    const hash = hashedPassword.hash.toString('hex');
    const salt = hashedPassword.salt.toString('hex');
    const { reps } = hashedPassword;
    const auth = es.fromOne(
        Auth,
        await q.one(sql`
            insert into "Auth" (hash, salt, reps)
            values (decode(${hash}, 'hex'), decode(${salt}, 'hex'), ${reps})
            returning *
        `),
    );
    return es.fromOne(
        User,
        await q.one(sql`
            insert into "User" (auth, name)
            values (${auth.id}, ${params.name})
            returning *
        `),
    );
}

export async function getAllUsers(
    q: CommonQueryMethodsType,
    es: EntitySet,
): Promise<User[]> {
    return es.fromMany(User, await q.many(sql`select * from "User"`));
}

export async function getUserByID(
    q: CommonQueryMethodsType,
    es: EntitySet,
    id: string,
): Promise<User | undefined> {
    return es.fromOneMaybe(
        User,
        await q.maybeOne(sql`select * from "User" where id = ${id}`),
    );
}

export async function getUserByName(
    q: CommonQueryMethodsType,
    es: EntitySet,
    name: string,
): Promise<User | undefined> {
    return es.fromOneMaybe(
        User,
        await q.maybeOne(sql`select * from "User" where name = ${name}`),
    );
}
