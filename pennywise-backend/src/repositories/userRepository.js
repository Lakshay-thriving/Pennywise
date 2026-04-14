const db = require('../db');

class UserRepository {
    async createUser(name, email, passwordHash) {
        const result = await db.query(
            'INSERT INTO Users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
            [name, email, passwordHash]
        );
        return result.rows[0];
    }

    async getUserByEmail(email) {
        const result = await db.query('SELECT * FROM Users WHERE email = $1', [email]);
        return result.rows[0];
    }
}
module.exports = new UserRepository();
