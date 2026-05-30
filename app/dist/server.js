"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const paymentStore_1 = require("./store/paymentStore");
const node_repl_1 = require("node:repl");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
//Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
//Request logging middleware
app.use((req, res, next) => {
    console.log(`[Payflow] ${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
//Route
app.use('/api', paymentRoutes_1.default);
//404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.path} not found`,
        timeStamp: new Date().toISOString()
    });
});
//Global error handler
app.use((err, req, res, next) => {
    console.error('[Payflow] Unhandled error:', err.message);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        timeStamp: new Date().toISOString()
    });
});
//Start server
async function Start() {
    try {
        await (0, paymentStore_1.initializeDatabase)();
        app.listen(PORT, () => {
            console.log(`
    ===============================
        PayFlow API Server
    ===============================
        Status: RUNNING
        Port: ${PORT}
        Environment: ${process.env.NODE_ENV || 'development'}
        Health: http://localhost:${PORT}/api/health
    ===============================
        `);
        });
    }
    catch (error) {
        console.error('[Payflow] failed to start server: ', error);
        process.exit(1);
    }
}
(0, node_repl_1.start)();
exports.default = app;
