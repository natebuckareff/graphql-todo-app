import Entity from './Entity';
import { CommonQueryMethodsType, sql } from 'slonik';
import { CreateTodoItem } from './TodoItem';
import { User } from '../../gen/graphql';

export default class TodoList extends Entity {
    private _owner: Entity;

    constructor(object: any) {
        super(object);
        this._owner = new Entity({ id: object.owner });
    }

    get owner() {
        return this._owner;
    }
}

type CreateTodoList = {
    owner: string;
    items: CreateTodoItem[];
};

export async function createTodoList(
    q: CommonQueryMethodsType,
    params: CreateTodoList,
) {
    const list = new TodoList(
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
    await q.any(sql`
        insert into "TodoItem" (list, completed, content)
        values ${values}
        returning *
    `);
    return list;
}

export async function getTodoListByOwner(
    q: CommonQueryMethodsType,
    owner: string,
) {
    return (await q.any(
        sql`select * from "TodoList" where owner = ${owner}`,
    )).map(x => new TodoList(x));
}
