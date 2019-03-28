import * as dsz from './deserialize';
import * as schema from '../gen/graphql';
import { sql, CommonQueryMethodsType } from 'slonik';

export class User implements schema.User {
    private _id: string;
    private _name: string | null;
    private _lists: any[];

    constructor(object?: any) {
        this._id = dsz.isID(object.id);
        this._name = dsz.isMaybe(dsz.isString, object.name);
        this._lists = dsz.isMaybe(
            x => dsz.isArray(x => dsz.isInstance(TodoList, x), x),
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
        this._id = dsz.isID(object.id);
        this._owner = dsz.isMaybe(x => dsz.isInstance(User, x), object.owner);
        this._items = dsz.isMaybe(
            x => dsz.isArray(x => dsz.isInstance(TodoItem, x), x),
            object.items,
        );
    }

    static async getByID(q: CommonQueryMethodsType, id: string) {
        const list = await q.one(
            sql`select * from "TodoList" where id = ${id}`,
        );
        const user = await q.one(
            sql`select * from "User" where id = ${dsz.isID(list.owner)}`,
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
        this._id = dsz.isID(object.id);
        this._list = dsz.isInstance(TodoList, object.list);
        this._completed = dsz.isBoolean(object.completed);
        this._content = dsz.isString(object.content);
    }

    static async getByID(q: CommonQueryMethodsType, id: string) {
        const item = await q.one(
            sql`select * from "TodoItem" where id = ${id}`,
        );
        const list = await q.one(
            sql`select * from "TodoList" where id = ${dsz.isString(item.list)}`,
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
