const db = require('../db');

class GroupRepository {
    async createGroup(groupName) {
        const result = await db.query(
            'INSERT INTO Groups (group_name) VALUES ($1) RETURNING *',
            [groupName]
        );
        return result.rows[0];
    }

    async addUserToGroup(userId, groupId) {
        const result = await db.query(
            'INSERT INTO Group_Members (user_id, group_id) VALUES ($1, $2) RETURNING *',
            [userId, groupId]
        );
        return result.rows[0];
    }
}
module.exports = new GroupRepository();
