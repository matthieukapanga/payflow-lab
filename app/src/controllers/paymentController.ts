import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { paymentStore } from "../store/paymentStore";
import { CreatePaymentRequest, ApiResponse, Payment } from "../types/payment";
import { error } from "node:console";

export const processPayment = (req: Request, res: Response): void => {
    try {
        const { amount, currency, description}: CreatePaymentRequest = req.body;

        //validate required fields
        if (!amount || !currency || !description){
            const response: ApiResponse<null> = {
                success: false,
                error: 'Missing required fields: amount, currency, description',
                timestamps: new Date().toISOString()
            };
            res.status(400).json(response);
            return;           
        }

        //valuidate amount is positive
        if (amount <= 0){
            const response: ApiResponse<null> = {
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
        const payment: Payment = {
            id: uuidv4(),
            amount,
            currency: currency.toUpperCase(),
            status: 'completed',
            description,
            createdAt: now,
            updatedAt: now
        };

        paymentStore.save(payment);

        console.log(`[PayFlow] Payment processed: ${payment.id} - ${currency} ${amount}`);

        const response: ApiResponse<Payment> = {
            success: true,
            data: payment,
            timestamps: new Date().toISOString()
        };

        res.status(201).json(response);
    }catch(error){
        console.error('[PAyFlow] Error processing payment: ', error);
        const response: ApiResponse<null> = {
            success: false,
            error: 'Internal server error',
            timestamps: new Date().toISOString()
        };
        res.status(500).json(response);
    }
};

export const getPayment = (req: Request, res: Response): void => {
    try {
        const { id } = req.params;
        const payment = paymentStore.findById(id.toString());

        if (!payment){
            const response: ApiResponse<null> = {
                success: false,
                error: `Payment with id ${id} not found`,
                timestamps: new Date().toISOString()
            };

            res.status(404).json(response);
            return;
        }

        const response: ApiResponse<Payment> = {
            success: true,
            data: payment,
            timestamps: new Date().toISOString()
        };

        res.status(200).json(response);
        
    }catch(error){
        console.error('[Payflow] Error retreiving payment: ', error);
        const response: ApiResponse<null> = {
            success: false,
            error: 'Internal server error',
            timestamps: new Date().toISOString()
        };
        res.status(500).json(response);
    }
};