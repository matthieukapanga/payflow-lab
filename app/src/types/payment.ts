export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface Payment {
    id : string;
    amount: number;
    currency: String;
    status: PaymentStatus;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePaymentRequest {
    amount: number;
    currency: string;
    description: string;
}

export interface ApiResponse<T>{
    success: boolean;
    data?: T;
    error?: string;
    timestamps: string;
}