import { Request, Response } from 'express';
import { paymentStore } from '../store/paymentStore';
import { ApiResponse } from '../types/payment';

interface HealthStatus {
    status: 'healthy' | 'unleathy';
    uptime: number;
    totalPayments: number;
    environment: string;
    version: string;
};

export const healthCheck = (req: Request, res: Response): void => {
    const health: HealthStatus = {
        status: 'healthy',
        uptime: Math.floor(process.uptime()),
        totalPayments: paymentStore.count(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    };

    const response: ApiResponse<HealthStatus> = {
        success: true,
        data: health,
        timestamps: new Date().toISOString()
    };

    res.status(200).json(response);
};


