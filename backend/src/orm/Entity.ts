import * as ck from '../check';

export default class Entity {
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
