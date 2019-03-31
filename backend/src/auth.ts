import * as crypto from 'crypto';
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import * as path from 'path';
import { DatabaseConnectionType, sql } from 'slonik';
import { isNumber, isBuffer, isID } from './deserialize';
import { promisify } from 'util';
import { transaction } from './util';

const pbkdf2 = promisify(crypto.pbkdf2);

const PRIVATE_KEY = fs.readFileSync(
    path.resolve(process.cwd(), 'keys/ecdsa-p521-private.pem'),
    { encoding: 'utf8' },
);

export type HashedPassword = {
    hash: Buffer;
    salt: Buffer;
    reps: number;
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

export async function createAccessToken(
    con: DatabaseConnectionType,
    name: string,
    password: string,
): Promise<string> {
    return transaction(con, async trx => {
        const r = await trx.maybeOne(sql`
            select id, hash, salt, reps
            from "User"
            where name = ${name}
        `);
        if (r === null) {
            throw new Error('Authentication failed');
        }

        const salt = isBuffer(r.salt);
        const reps = isNumber(r.reps);
        const hashChallenge = isBuffer(r.hash);
        const hashResponse = await hashPassword(password, salt, reps);

        if (!hashChallenge.equals(hashResponse)) {
            throw new Error('Authentication failed');
        }

        const id = isID(r.id);
        return jwt.sign({ id }, PRIVATE_KEY, {
            algorithm: 'HS256',
            expiresIn: '24h',
        });
    });
}
