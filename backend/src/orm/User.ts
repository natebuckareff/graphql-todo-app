import * as ck from '../check';
import Auth from './Auth';
import Entity, { makeRef } from './Entity';
import { CommonQueryMethodsType, sql } from 'slonik';
import { createHashedPassword } from '../auth';

export default class User extends Entity {
    private _auth: Entity;
    private _name: string;

    constructor(object: any) {
        super(object);
        this._auth = makeRef(Auth, object.auth);
        this._name = ck.string(object.name);
    }

    get auth() {
        return this._auth as User;
    }

    get name() {
        return this._name;
    }

    encode(): any {
        return {
            ...super.encode(),
            auth: this.auth.encode(),
        };
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
    const auth = new Auth(
        await q.one(sql`
                insert into "Auth" (hash, salt, reps)
                values (decode(${hash}, 'hex'), decode(${salt}, 'hex'), ${reps})
                returning *
            `),
    );
    return new User({
        ...(await q.one(sql`
            insert into "User" (auth, name)
            values (${auth.id}, ${params.name})
            returning *
        `)),
        auth,
    });
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
