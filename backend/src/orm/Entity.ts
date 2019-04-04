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

    encode(): any {
        return { id: this.id };
    }

    deref<R extends Entity>(ctor: new (...args: any[]) => R): R | undefined {
        if (this instanceof ctor) {
            return this as R;
        } else {
            return undefined;
        }
    }
}

export function makeRef<R extends Entity>(
    ctor: new (...args: any[]) => R,
    object: any,
) {
    return object instanceof ctor ? object : new Entity({ id: object });
}
