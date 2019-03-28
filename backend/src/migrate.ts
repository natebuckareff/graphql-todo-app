import pool from './pool';
import * as fs from 'fs';
import * as path from 'path';
import { DatabasePoolConnectionType } from 'slonik';

const MIGRATIONS_DIR = './src/migrations';

function importMigration(filename: string) {
    const [name] = filename.split('.');
    return require(path.resolve(process.cwd(), MIGRATIONS_DIR, name));
}

function listMigrations(ascending: boolean = true) {
    const migrations = fs.readdirSync(MIGRATIONS_DIR);
    migrations.sort((a, b) =>
        ascending ? a.localeCompare(b) : b.localeCompare(a),
    );
    return migrations;
}

async function up(connection: DatabasePoolConnectionType, filename: string) {
    const module = importMigration(filename);
    connection.transaction(async tx => module.up(tx));
}

async function down(connection: DatabasePoolConnectionType, filename: string) {
    const module = importMigration(filename);
    connection.transaction(async tx => module.down(tx));
}

async function allUp(connection: DatabasePoolConnectionType) {
    for (const migration of listMigrations()) {
        await up(connection, migration);
    }
}

async function allDown(connection: DatabasePoolConnectionType) {
    for (const migration of listMigrations(true)) {
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
