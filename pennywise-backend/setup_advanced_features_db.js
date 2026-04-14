const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const user = 'postgres';
const password = 'Lakshay29@';
const host = 'localhost';
const port = 5432;

async function setupAdvanced() {
    const appClient = new Client({ user, password, host, port, database: 'pennywise_db' });
    try {
        await appClient.connect();
        const sqlParams = fs.readFileSync(path.join(__dirname, 'database', 'setup_advanced_features.sql'), 'utf8');
        console.log("Executing advanced features schema setup...");
        await appClient.query(sqlParams);
        console.log("Advanced features schema setup complete.");
        process.exit(0);
    } catch (err) {
         console.error("Error setting up advanced features schema:", err);
         process.exit(1);
    } finally {
        await appClient.end();
    }
}

setupAdvanced();
