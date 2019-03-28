import { DatabasePoolType, DatabaseTransactionConnectionType } from 'slonik';

export function transaction<R>(
    pool: DatabasePoolType,
    fn: (trx: DatabaseTransactionConnectionType) => Promise<R>,
): Promise<R> {
    return new Promise((resolve, reject) => {
        pool.connect(connection => {
            return connection.transaction(trx => {
                return fn(trx);
            });
        })
            .then(r => resolve(r as R))
            .catch(reject);
    });
}
