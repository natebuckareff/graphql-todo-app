import * as ck from '../check';
import TodoList from './TodoList';
import { CommonQueryMethodsType, sql } from 'slonik';
import { Entity, EntitySet } from '../ent';

export default class TodoItem extends Entity {
    private _list?: string;
    private _completed?: boolean;
    private _content?: string;

    constructor(object: any, eset: EntitySet) {
        super(object, eset, ['list', 'completed', 'content']);
        this._list = ck.string(object.list);
        this._completed = ck.boolean(object.completed);
        this._content = ck.string(object.content);
    }

    getFields() {
        return ['id', 'list', 'completed', 'content'];
    }

    get list() {
        return this.eset.getOne(TodoList, this._list!);
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
    es: EntitySet,
    list: string,
): Promise<TodoItem[]> {
    return es.fromMany(
        TodoItem,
        await q.any(sql`select * from "TodoItem" where list = ${list}`),
    );
}
