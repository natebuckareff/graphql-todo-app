import { createPool } from 'slonik';

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB } = process.env;
const pool = createPool(
    `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres/${POSTGRES_DB}`,
);

export default pool;
