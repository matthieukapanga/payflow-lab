"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPayment = exports.processPayment = void 0;
const uuid_1 = require("uuid");
const paymentStore_1 = require("../store/paymentStore");
const processPayment = async (req, res) => {
    try {
        const { amount, currency, description } = req.body;
        //validate required fields
        if (!amount || !currency || !description) {
            const response = {
                success: false,
                error: 'Missing required fields: amount, currency, description',
                timestamps: new Date().toISOString()
            };
            res.status(400).json(response);
            return;
        }
        //valuidate amount is positive
        if (amount <= 0) {
            const response = {
                success: false,
                error: 'Amount must be greater than 0',
                timestamps: new Date().toISOString()
            };
            res.status(400).json(response);
            return;
        }
        //simulate payment processing 
        //In production this would call a payment gateway
        const now = new Date().toISOString();
        const payment = {
            id: (0, uuid_1.v4)(),
            amount,
            currency: currency.toUpperCase(),
            status: 'completed',
            description,
            createdAt: now,
            updatedAt: now
        };
        await paymentStore_1.paymentStore.save(payment);
        console.log(`[PayFlow] Payment processed: ${payment.id} - ${currency} ${amount}`);
        const response = {
            success: true,
            data: payment,
            timestamps: new Date().toISOString()
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('[PAyFlow] Error processing payment: ', error);
        const response = {
            success: false,
            error: 'Internal server error',
            timestamps: new Date().toISOString()
        };
        res.status(500).json(response);
    }
};
exports.processPayment = processPayment;
const getPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await paymentStore_1.paymentStore.findById(id.toString());
        if (!payment) {
            const response = {
                success: false,
                error: `Payment with id ${id} not found`,
                timestamps: new Date().toISOString()
            };
            res.status(404).json(response);
            return;
        }
        const response = {
            success: true,
            data: payment,
            timestamps: new Date().toISOString()
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('[Payflow] Error retreiving payment: ', error);
        const response = {
            success: false,
            error: 'Internal server error',
            timestamps: new Date().toISOString()
        };
        res.status(500).json(response);
    }
};
exports.getPayment = getPayment;
