const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const user = 'postgres';
const password = 'Lakshay29@';
const host = 'localhost';
const port = 5432;

async function setup() {
    const client = new Client({ user, password, host, port, database: 'postgres' });
    try {
        await client.connect();
        console.log("Connected to postgres. Checking if pennywise_db exists...");
        const res = await client.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = 'pennywise_db'`);
        if (res.rowCount === 0) {
            console.log("Creating database pennywise_db...");
            await client.query(`CREATE DATABASE pennywise_db`);
        } else {
            console.log("Database pennywise_db already exists.");
        }
    } catch (err) {
        console.error("Error creating database:", err);
    } finally {
        await client.end();
    }

    const appClient = new Client({ user, password, host, port, database: 'pennywise_db' });
    try {
        await appClient.connect();
        const sqlParams = fs.readFileSync(path.join(__dirname, 'database', 'setup_db.sql'), 'utf8');
        console.log("Executing schema setup...");
        await appClient.query(sqlParams);
        console.log("Schema setup complete.");
    } catch (err) {
         console.error("Error setting up schema:", err);
    } finally {
        await appClient.end();
    }
}

setup();
