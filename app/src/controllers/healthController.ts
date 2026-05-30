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

export const healthCheck = async (req: Request, res: Response): Promise<void> => {
    try{
        const totalPayments = await paymentStore.count();

        const health: HealthStatus = {
        status: 'healthy',
        uptime: Math.floor(process.uptime()),
        totalPayments,
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    };

    const response: ApiResponse<HealthStatus> = {
        success: true,
        data: health,
        timestamps: new Date().toISOString()
    };
    res.status(200).json(response);
} catch(error){
    const response: ApiResponse<null> ={
        success: false,
        error: 'Database connection failed',
        timestamps: new Date().toISOString()
    };
    res.status(503).json(response);
}
};

