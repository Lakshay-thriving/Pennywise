const db = require('./src/db');

async function updateDb() {
    try {
        console.log("Applying manual ALTER TABLE for Pro features...");
        const client = await db.getClient();
        try {
            await client.query('BEGIN');
            
            // Alter Expenses table to append the new fields
            // Using DO blocks since traditional alter table add column fails if it already exists natively.
            await client.query(`
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='expenses' AND column_name='status') THEN
                        ALTER TABLE Expenses ADD COLUMN status VARCHAR(50) DEFAULT 'Pending';
                    END IF;
                    
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='expenses' AND column_name='is_deleted') THEN
                        ALTER TABLE Expenses ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
                    END IF;
                END
                $$;
            `);

            await client.query('COMMIT');
            console.log("Database schema successfully forced (Alter tables applied)!");
        } catch (e) {
            await client.query('ROLLBACK');
            console.error("Alter Error:", e);
        } finally {
            client.release();
        }
        process.exit(0);
    } catch (e) {
        console.error("DB error:", e);
        process.exit(1);
    }
}

updateDb();
