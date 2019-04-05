import * as ck from '../check';
import TodoItem, { CreateTodoItem } from './TodoItem';
import { CommonQueryMethodsType, sql } from 'slonik';
import { Entity, EntitySet } from '../ent';

export default class TodoList extends Entity {
    private _owner?: string;

    constructor(object: any, eset: EntitySet) {
        super(object, eset, ['owner'], ['items']);
        this._owner = ck.string(object.owner);
    }

    getFields() {
        return ['id', 'owner', 'items'];
    }

    isRef(field: string) {
        return field === 'items';
    }

    get owner() {
        return this._owner;
    }

    get items() {
        return this.eset.getMany(TodoItem, 'list', this.id);
    }
}

type CreateTodoList = {
    owner: string;
    items: CreateTodoItem[];
};

export async function createTodoList(
    q: CommonQueryMethodsType,
    es: EntitySet,
    params: CreateTodoList,
): Promise<TodoList> {
    const list = es.fromOne(
        TodoList,
        await q.one(sql`
            insert into "TodoList" (owner)
            values (${params.owner})
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
    es.fromMany(
        TodoItem,
        await q.any(sql`
            insert into "TodoItem" (list, completed, content)
            values ${values}
            returning *
        `),
    );
    return list;
}

export async function getTodoListByOwner(
    q: CommonQueryMethodsType,
    es: EntitySet,
    owner: string,
): Promise<TodoList[]> {
    return es.fromMany(
        TodoList,
        await q.any(sql`select * from "TodoList" where owner = ${owner}`),
    );
}
