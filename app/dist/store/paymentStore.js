"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentStore = void 0;
exports.initializeDatabase = initializeDatabase;
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'payflow',
    user: process.env.DB_USER || 'payflow_user',
    password: process.env.DB_PASSWORD || '',
});
async function initializeDatabase() {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS payments (
                id VARCHAR(36) PRIMARY KEY,
                amount DECIMAL(10,2) NOT NULL,
                currency VARCHAR(3) NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'completed',
                description TEXT NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);
        console.log('[PayFlow] Database initialized successfully');
    }
    finally {
        client.release();
    }
}
exports.paymentStore = {
    async save(payment) {
        await pool.query(`INSERT INTO payments (id, amount, currency, status, description, "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
            payment.id,
            payment.amount,
            payment.currency,
            payment.status,
            payment.description,
            payment.createdAt,
            payment.updatedAt
        ]);
    },
    async findById(id) {
        const result = await pool.query('SELECT * FROM payments WHERE id = $1', [id]);
        if (result.rows.length === 0)
            return null;
        const row = result.rows[0];
        return {
            id: row.id,
            amount: parseFloat(row.amount),
            currency: row.currency,
            status: row.status,
            description: row.description,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
        };
    },
    async count() {
        const result = await pool.query('SELECT COUNT(*) FROM payments');
        return parseInt(result.rows[0].count);
    }
};
