import * as ck from '../check';
import Entity from './Entity';
import { CommonQueryMethodsType, sql } from 'slonik';

export default class TodoItem extends Entity {
    private _list: Entity;
    private _completed: boolean;
    private _content: string;

    constructor(object: any) {
        super(object);
        this._list = new Entity({ id: object.list });
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

export type CreateTodoItem = {
    completed: boolean;
    content: string;
};

export async function getTodoItemByList(
    q: CommonQueryMethodsType,
    list: string,
) {
    return (await q.any(
        sql`select * from "TodoItem" where list = ${list}`,
    )).map(x => new TodoItem(x));
}
