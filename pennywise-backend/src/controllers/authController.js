const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/userRepository');

class AuthController {
    async register(req, res) {
        try {
            const { name, email, password } = req.body;
            
            const existingUser = await UserRepository.getUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'Email already exists' });
            }

            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            const user = await UserRepository.createUser(name, email, passwordHash);

            const token = jwt.sign(
                { id: user.id, email: user.email }, 
                process.env.JWT_SECRET || 'fallback_secret_key',
                { expiresIn: '30d' }
            );

            res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Server error during registration' });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            const user = await UserRepository.getUserByEmail(email);
            if (!user) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email }, 
                process.env.JWT_SECRET || 'fallback_secret_key',
                { expiresIn: '30d' }
            );

            res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email } });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Server error during login' });
        }
    }

    async searchUsers(req, res) {
        try {
            const { q } = req.query;
            if (!q) return res.status(200).json({ data: [] });
            
            const db = require('../db');
            const client = await db.getClient();
            try {
                const query = `
                    SELECT id, name, email FROM Users 
                    WHERE name ILIKE $1 OR email ILIKE $1 
                    LIMIT 5
                `;
                const result = await client.query(query, [`%${q}%`]);
                res.status(200).json({ success: true, data: result.rows });
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Search error:', error);
            res.status(500).json({ error: 'Server error during user search' });
        }
    }
}

module.exports = new AuthController();
