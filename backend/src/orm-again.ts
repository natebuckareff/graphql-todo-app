import * as ck from './check';
import { CommonQueryMethodsType, sql } from 'slonik';
import { createHashedPassword } from './auth';

export class Entity {
    private _id: string;

    constructor(object: any) {
        this._id = ck.union(ck.number, ck.string)(object.id) + '';
    }

    static fromArray<R extends Entity>(
        ctor: new (arg: any) => R,
        objects: any[],
    ) {
        return objects.map(x => new ctor(x));
    }

    get id() {
        return this._id;
    }
}

export class Auth extends Entity {
    private _hash: Buffer;
    private _salt: Buffer;
    private _reps: number;

    constructor(object: any) {
        super(object);
        this._hash = Buffer.from(ck.string(object.hash), 'hex');
        this._salt = Buffer.from(ck.string(object.salt), 'hex');
        this._reps = ck.number(object.reps);
    }

    get hash() {
        return this._hash;
    }

    get salt() {
        return this._salt;
    }

    get reps() {
        return this._reps;
    }
}

export class User extends Entity {
    private _auth: Entity;
    private _name: string;

    constructor(object: any) {
        super(object);
        this._auth = new Entity(object.auth);
        this._name = ck.string(object.name);
    }

    get auth() {
        return this._auth as User;
    }

    get name() {
        return this._name;
    }
}

export class TodoList extends Entity {
    private _owner: Entity;

    constructor(object: any) {
        super(object);
        this._owner = new Entity(object.owner);
    }

    get owner() {
        return this._owner;
    }
}

export class TodoItem extends Entity {
    private _list: Entity;
    private _completed: boolean;
    private _content: string;

    constructor(object: any) {
        super(object);
        this._list = new Entity(object.list);
        this._completed = ck.boolean(object.completed);
        this._content = ck.string(object.content);
    }

    get list() {
        return this._list;
    }

    get completed() {
        return this._completed;
    }

    get content() {
        return this._content;
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

type CreateTodoItem = {
    completed: boolean;
    content: string;
};

type CreateTodoList = {
    owner: User;
    items: CreateTodoItem[];
};

export async function createTodoList(
    q: CommonQueryMethodsType,
    owner: User,
    params: CreateTodoList,
) {
    const list = new TodoList(
        await q.one(sql`
            insert into "TodoList" (owner)
            values (${owner.id})
            returning *
        `),
    );
    const values = sql.tupleList(
        params.items.map(({ completed, content }) => [
            list.id,
            completed,
            content,
        ]),
    );
    await q.many(sql`
        insert into "TodoItem" (list, completed, content)
        values ${values}
    `);
    return list;
}
