const express = require('express');
const cors = require('cors');
require('dotenv').config();
const http = require('http');
const authMiddleware = require('./src/middleware/authMiddleware');
const websocketService = require('./src/services/websocketService');
const cronJobs = require('./src/utils/cronJobs');

const app = express();
const server = http.createServer(app);

// Initialize Sockets and Schedulers
websocketService.initialize(server);
cronJobs.start();

const path = require('path');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const expensesRoutes = require('./src/routes/expenseRoutes');
const authRoutes = require('./src/routes/authRoutes');
const groupRoutes = require('./src/routes/groupRoutes');
const settlementRoutes = require('./src/routes/settlementRoutes');

const userRoutes = require('./src/routes/userRoutes');

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Pennywise backend is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/expenses', authMiddleware, expensesRoutes);
app.use('/api/groups', authMiddleware, groupRoutes);
app.use('/api/groups/:groupId/settlements', authMiddleware, settlementRoutes);
const communityRoutes = require('./src/routes/communityRoutes');
const advancedFeaturesRoutes = require('./src/routes/advancedFeaturesRoutes');
app.use('/api/community', authMiddleware, communityRoutes);
app.use('/api/advanced', authMiddleware, advancedFeaturesRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
