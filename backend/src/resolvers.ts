import { getItem, findItems } from './store';
import { Resolvers } from '../gen/graphql';

const resolvers: Resolvers = {
    Query: {
        users: () => findItems('user'),
        getUser: (_root, { id }) => getItem('user', id),
        findUser: (_root, { contains }) =>
            findItems('user', ({ name }: { name: string }) =>
                name.includes(contains),
            ),
    },
    User: {
        lists: parent => findItems('list', ({ id }) => id === parent.id),
    },
    List: {
        owner: parent => getItem('user', parent.owner.id),
        items: parent => findItems('item', ({ list }) => list === parent.id),
    },
    Item: {
        list: parent => getItem('list', parent.list.id),
    },
};

export default resolvers;
