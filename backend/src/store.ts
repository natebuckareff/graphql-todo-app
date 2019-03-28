import * as schema from '../gen/graphql';
import { sql, CommonQueryMethodsType } from 'slonik';

function isType<T>(type: string, value: any): T {
    if (typeof value === type) {
        return value;
    }
    throw new Error(`Expected ${type}`);
}

const isBoolean = (x: any) => isType<boolean>('boolean', x);
const isString = (x: any) => isType<string>('string', x);
const isNumber = (x: any) => isType<number>('number', x);

function isID(value: any): string {
    if (typeof value === 'string' || typeof value === 'number') {
        return value + '';
    }
    throw new Error('Expected string or number');
}

function isInstance<T>(ctor: new () => T, value?: any): T {
    if (value instanceof ctor) {
        return value;
    }
    throw new Error(`Expected instance of '${ctor.name}`);
}

function isArray<T>(predicate: (value: any) => T, values: any[]): T[] {
    return values.map(x => predicate(x));
}

function isMaybe<T>(predicate: (value: any) => T, value: any): T | null {
    if (Object.is(value, null) || Object.is(value, undefined)) {
        return null;
    } else {
        return predicate(value);
    }
}

export class User implements schema.User {
    private _id: string;
    private _name: string | null;
    private _lists: any[];

    constructor(object?: any) {
        this._id = isID(object.id);
        this._name = isMaybe(isString, object.name);
        this._lists = isMaybe(
            x => isArray(x => isInstance(TodoList, x), x),
            object.lists,
        );
    }

    static async getAll(q: CommonQueryMethodsType) {
        const r = await q.many(sql`select * from "User"`);
        return r.map(x => new User(x));
    }

    static async getByID(q: CommonQueryMethodsType, id: string) {
        return new User(
            await q.one(sql`select * from "User" where id = ${id}`),
        );
    }

    static async getByName(q: CommonQueryMethodsType, name: string) {
        const r = await q.any(
            sql`select * from "User" where name like ${'%' + name + '%'}`,
        );
        return r.map(x => new User(x));
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    get lists() {
        return this._lists;
    }

    async getLists(q: CommonQueryMethodsType): Promise<this> {
        this._lists = await TodoList.getByOwner(q, this);
        return this;
    }
}

export class TodoList implements schema.TodoList {
    private _id: string;
    private _owner: User;
    private _items: any[];

    constructor(object?: any) {
        this._id = isID(object.id);
        this._owner = isMaybe(x => isInstance(User, x), object.owner);
        this._items = isMaybe(
            x => isArray(x => isInstance(TodoItem, x), x),
            object.items,
        );
    }

    static async getByID(q: CommonQueryMethodsType, id: string) {
        const list = await q.one(
            sql`select * from "TodoList" where id = ${id}`,
        );
        const user = await q.one(
            sql`select * from "User" where id = ${isID(list.owner)}`,
        );
        return new TodoList({ ...list, owner: new User(user) });
    }

    static async getByOwner(q: CommonQueryMethodsType, owner: schema.User) {
        const r = await q.any(
            sql`select * from "TodoList" where owner = ${owner.id}`,
        );
        return r.map(x => new TodoList({ ...x, owner }));
    }

    get id() {
        return this._id;
    }

    get owner() {
        return this._owner;
    }

    get items() {
        return this._items;
    }
}

export class TodoItem implements schema.TodoItem {
    private _id: string;
    private _list: TodoList | null;
    private _completed: boolean;
    private _content: string;

    constructor(object?: any) {
        this._id = isID(object.id);
        this._list = isInstance(TodoList, object.list);
        this._completed = isBoolean(object.completed);
        this._content = isString(object.content);
    }

    static async getByID(q: CommonQueryMethodsType, id: string) {
        const item = await q.one(
            sql`select * from "TodoItem" where id = ${id}`,
        );
        const list = await q.one(
            sql`select * from "TodoList" where id = ${isString(item.list)}`,
        );
        return new TodoItem({ ...item, list: new TodoList(list) });
    }

    static async getByList(q: CommonQueryMethodsType, list: schema.TodoList) {
        const r = await q.many(
            sql`select * from "TodoItem" where list = ${list.id}`,
        );
        return r.map(x => new TodoItem({ ...x, list }));
    }

    get id() {
        return this._id;
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
