"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = void 0;
const paymentStore_1 = require("../store/paymentStore");
;
const healthCheck = async (req, res) => {
    try {
        const totalPayments = await paymentStore_1.paymentStore.count();
        const health = {
            status: 'healthy',
            uptime: Math.floor(process.uptime()),
            totalPayments,
            environment: process.env.NODE_ENV || 'development',
            version: '1.0.0'
        };
        const response = {
            success: true,
            data: health,
            timestamps: new Date().toISOString()
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: 'Database connection failed',
            timestamps: new Date().toISOString()
        };
        res.status(503).json(response);
    }
};
exports.healthCheck = healthCheck;
