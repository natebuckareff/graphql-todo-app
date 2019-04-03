import * as ck from '../check';
import Entity from './Entity';

export default class Auth extends Entity {
    private _hash: Buffer;
    private _salt: Buffer;
    private _reps: number;

    constructor(object: any) {
        super(object);
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
