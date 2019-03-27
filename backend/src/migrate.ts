import pool from './pool';
import { DatabasePoolConnectionType } from 'slonik';
import { readdirSync } from 'fs';

async function up(connection: DatabasePoolConnectionType, name: string) {
    const module = await import(`./migrations/${name}`);
    connection.transaction(async tx => module.up(tx));
}

async function down(connection: DatabasePoolConnectionType, name: string) {
    const module = await import(`./migrations/${name}`);
    connection.transaction(async tx => module.down(tx));
}

async function allUp(connection: DatabasePoolConnectionType) {
    const migrations = readdirSync('./migrations');
    migrations.sort((a, b) => a.localeCompare(b));
    for (const migration of migrations) {
        await up(connection, migration);
    }
}

async function allDown(connection: DatabasePoolConnectionType) {
    const migrations = readdirSync('./migrations');
    migrations.sort((a, b) => b.localeCompare(a));
    for (const migration of migrations) {
        await down(connection, migration);
    }
}

async function main() {
    const mode = process.argv[2];
    const name = process.argv[3];
    if (mode !== 'up' && mode !== 'down') {
        console.error('Usage: migrate (up | down) [<migration>]');
        return;
    }
    await pool.connect(async connection => {
        if (name) {
            if (mode === 'up') {
                await up(connection, name);
            } else if (mode === 'down') {
                await down(connection, name);
            }
        } else {
            if (mode === 'up') {
                await allUp(connection);
            } else if (mode === 'down') {
                await allDown(connection);
            }
        }
    });
}
main().then();
