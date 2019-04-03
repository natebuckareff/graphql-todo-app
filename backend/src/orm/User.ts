import * as ck from '../check';
import Entity from './Entity';
import { CommonQueryMethodsType, sql } from 'slonik';
import { createHashedPassword } from '../auth';

export default class User extends Entity {
    private _auth: Entity;
    private _name: string;

    constructor(object: any) {
        super(object);
        this._auth = new Entity({ id: object.auth });
        this._name = ck.string(object.name);
    }

    get auth() {
        return this._auth as User;
    }

    get name() {
        return this._name;
    }
}

export type CreateUser = { name: string; password: string };

export async function createUser(
    q: CommonQueryMethodsType,
    params: CreateUser,
) {
    const hashedPassword = await createHashedPassword(params.password);
    const hash = hashedPassword.hash.toString('hex');
    const salt = hashedPassword.salt.toString('hex');
    const { reps } = hashedPassword;
    const authId = await q.oneFirst(sql`
            insert into "Auth" (hash, salt, reps)
            values (decode(${hash}, 'hex'), decode(${salt}, 'hex'), ${reps})
            returning id
        `);
    return new User(
        await q.one(sql`
            insert into "User" (auth, name)
            values (${authId}, ${params.name})
            returning *
        `),
    );
}

export async function getAllUsers(q: CommonQueryMethodsType) {
    return (await q.many(sql`select * from "User"`)).map(x => new User(x));
}

export async function getUserByID(q: CommonQueryMethodsType, id: string) {
    const r = await q.maybeOne(sql`select * from "User" where id = ${id}`);
    return r && new User(r);
}

export async function getUserByName(q: CommonQueryMethodsType, name: string) {
    const r = await q.maybeOne(sql`select * from "User" where name = ${name}`);
    return r && new User(r);
}
