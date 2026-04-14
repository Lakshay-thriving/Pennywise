const socketIo = require('socket.io');

class WebsocketService {
    constructor() {
        this.io = null;
    }

    initialize(server) {
        this.io = socketIo(server, {
            cors: { origin: '*', methods: ['GET', 'POST'] }
        });

        this.io.on('connection', (socket) => {
            console.log(`Socket client connected: ${socket.id}`);

            socket.on('join_group', (groupId) => {
                socket.join(`group_${groupId}`);
                console.log(`Socket ${socket.id} joined group_${groupId}`);
            });

            socket.on('disconnect', () => {
                console.log(`Socket client disconnected: ${socket.id}`);
            });
        });
    }

    // Broadcast a payload representing a generic update or specific state sync
    broadcastGroupUpdate(groupId, payload) {
        if (this.io) {
            this.io.to(`group_${groupId}`).emit('group_balance_update', payload);
        }
    }
}

module.exports = new WebsocketService();
