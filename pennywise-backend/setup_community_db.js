const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const user = 'postgres';
const password = 'Lakshay29@'; // password derived from init_db.js
const host = 'localhost';
const port = 5432;

async function setupCommunity() {
    const appClient = new Client({ user, password, host, port, database: 'pennywise_db' });
    try {
        await appClient.connect();
        const sqlParams = fs.readFileSync(path.join(__dirname, 'database', 'setup_community.sql'), 'utf8');
        console.log("Executing community schema setup...");
        await appClient.query(sqlParams);
        console.log("Community schema setup complete.");
        process.exit(0);
    } catch (err) {
         console.error("Error setting up community schema:", err);
         process.exit(1);
    } finally {
        await appClient.end();
    }
}

setupCommunity();
