import * as ck from '../check';
import { Entity, EntitySet } from '../ent';
import User from './User';

export default class Auth extends Entity {
    private _hash?: Buffer;
    private _salt?: Buffer;
    private _reps?: number;

    constructor(object: any, eset: EntitySet) {
        super(object, eset, ['hash', 'salt', 'reps']);
        this._hash = ck.guard<Buffer>(x => Buffer.isBuffer(x))(object.hash);
        this._salt = ck.guard<Buffer>(x => Buffer.isBuffer(x))(object.hash);
        this._reps = ck.number(object.reps);
    }

    get hash() {
        return this._hash;
    }

    get salt() {
        return this._salt;
    }

    get reps() {
        return this._reps;
    }
}
