import { getItem, findItems } from './store';

export default {
    Query: {
        users: () => findItems('user'),
        getUser: (_root, { id }) => getItem('user', id),
        findUser: (_root, { contains }) =>
            findItems('user', ({ name }: { name: string }) =>
                name.includes(contains)
            )
    },
    User: {
        lists: parent => findItems('list', ({ id }) => id === parent.id)
    },
    List: {
        owner: parent => getItem('user', parent.owner),
        items: parent => findItems('item', ({ list }) => list === parent.id)
    },
    Item: {
        list: parent => getItem('list', parent.list)
    }
};
