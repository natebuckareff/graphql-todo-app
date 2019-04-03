import * as ck from './check';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import * as path from 'path';
import { DatabaseConnectionType, sql } from 'slonik';
import { promisify } from 'util';
import { transaction } from './util';

const pbkdf2 = promisify(crypto.pbkdf2);

const SECRET_KEY = fs.readFileSync(
    path.resolve(`/run/secrets/backend_accesstoken_keyfile`),
    { encoding: 'utf8' },
);

export type HashedPassword = {
    hash: Buffer;
    salt: Buffer;
    reps: number;
};

export type AccessToken = {
    uid: string;
};

export async function createHashedPassword(
    password: string,
): Promise<HashedPassword> {
    const salt = crypto.pseudoRandomBytes(32);
    const reps = 69105;
    const hash = await hashPassword(password, salt, reps);
    return { hash, salt, reps };
}

export function hashPassword(
    password: string,
    salt: Buffer,
    reps: number,
): Promise<Buffer> {
    return pbkdf2(password, salt, reps, 64, 'SHA512');
}

async function sign(payload: any): Promise<string> {
    return new Promise((resolve, reject) => {
        const opts = {
            algorithm: 'HS256',
            expiresIn: '24h',
        };
        jwt.sign(payload, SECRET_KEY, opts, (err, token) => {
            if (err) {
                reject(err);
            }
            resolve(token);
        });
    });
}

async function verify(token: string): Promise<string | object> {
    return new Promise((resolve, reject) => {
        jwt.verify(
            token,
            SECRET_KEY,
            { algorithms: ['HS256'] },
            (err, decoded) => {
                if (err) {
                    reject(err);
                }
                resolve(decoded);
            },
        );
    });
}

export function createAccessToken(
    con: DatabaseConnectionType,
    name: string,
    password: string,
): Promise<string> {
    return transaction(con, async trx => {
        const r = await trx.maybeOne(sql`
            select "User".id as id, hash, salt, reps
            from "User"
            join "Auth" on "Auth".id = "User".auth
            where name = ${name}
        `);
        if (r === null) {
            throw new Error('Authentication failed');
        }

        const salt = ck.guard<Buffer>(x => Buffer.isBuffer(x))(r.salt);
        const reps = ck.number(r.reps);
        const hashChallenge = ck.guard<Buffer>(x => Buffer.isBuffer(x))(r.hash);
        const hashResponse = await hashPassword(password, salt, reps);

        if (!hashChallenge.equals(hashResponse)) {
            throw new Error('Authentication failed');
        }

        const uid = ck.union(ck.number, ck.string)(r.id) + '';
        return sign({ uid } as AccessToken);
    });
}

export async function verifyAccessToken(token: string): Promise<AccessToken> {
    const decoded = await verify(token);
    if (typeof decoded === 'string') {
        throw new Error('Invalid access token');
    }
    return decoded as AccessToken;
}
