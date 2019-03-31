import {
    DatabaseTransactionConnectionType,
    DatabaseConnectionType,
} from 'slonik';

export type Maybe<T> = T | null;

export function transaction<R>(
    con: DatabaseConnectionType,
    fn: (trx: DatabaseTransactionConnectionType) => Promise<R>,
): Promise<R> {
    return new Promise((resolve, reject) => {
        con.transaction(fn)
            .then(r => resolve(r as R))
            .catch(reject);
    });
}
