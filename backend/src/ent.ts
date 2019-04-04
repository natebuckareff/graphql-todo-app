export type EntityCtor = new (...args: any[]) => Entity;
export type RelationCtor<R extends Entity> = new (...args: any[]) => R;
export type EntityQuery =
    | '*'
    | string
    | string[]
    | { [field: string]: EntityQuery };

export class Entity {
    private _id: string;

    constructor(object: any, private eset?: EntitySet) {
        this._id = object.id;
    }

    get id() {
        return this._id;
    }

    getFields(): string[] {
        return ['id'];
    }

    isRef(_field: string): boolean {
        return false;
    }

    encode(query: any): any {
        if (query === '*') {
            return this.encode(this.getFields());
        } else if (typeof query === 'string') {
            return (this as any)[query];
        } else {
            const o: { [field: string]: any } = {};
            if (Array.isArray(query)) {
                for (const k of query) {
                    o[k] = (this as any)[k];
                }
            } else {
                for (const [k, v] of Object.entries(query)) {
                    if (this.isRef(k)) {
                        o[k] = (this as any)[k].map((x: Entity) => x.encode(v));
                    } else {
                        o[k] = (this as any)[k];
                        if (o[k] instanceof Entity) {
                            o[k] = o[k].encode(v);
                        }
                    }
                }
            }
            return o;
        }
    }
}

export class EntitySet {
    private eset = new Map<EntityCtor, Map<string, Entity>>();

    private getMap<R extends Entity>(
        ctor: RelationCtor<R>,
    ): Map<string, R> | undefined {
        const m = this.eset.get(ctor);
        return m === undefined ? m : (m as Map<string, R>);
    }

    fromOne<R extends Entity>(ctor: RelationCtor<R>, value: any) {
        const r = new ctor(value, this);
        let m = this.getMap(ctor);
        if (m === undefined) {
            m = new Map();
            this.eset.set(ctor, m);
        }
        m.set(r.id, r);
        return r;
    }

    fromMany<R extends Entity>(ctor: RelationCtor<R>, values: any[]) {
        return values.map(x => this.fromOne(ctor, x));
    }

    getOne<R extends Entity>(ctor: RelationCtor<R>, id: string): R | undefined {
        let m = this.getMap(ctor);
        if (m === undefined) {
            return m;
        }
        const e = m.get(id);
        return e === undefined ? e : (e as R);
    }

    getMany<R extends Entity>(
        ctor: RelationCtor<R>,
        field: string,
        id: string,
    ): R[] {
        const r: R[] = [];
        const m = this.getMap(ctor);
        if (m === undefined) {
            return r;
        }
        for (const instance of m.values()) {
            if ((instance as any)[field].id === id) {
                r.push(instance);
            }
        }
        return r;
    }
}
