import { Payment } from '../types/payment';

//In-memory store simulating a database
//This will be replaced with RDS

const payments: Map<string, Payment> = new Map();

export const paymentStore = {
    save : (payment: Payment): Payment => {
        payments.set(payment.id, payment);
        return payment;
    },

    findById: (id: string): Payment | undefined => {
        return payments.get(id);
    },

    findAll: (): Payment[] => {
        return Array.from(payments.values());
    },

    count: (): number => {
        return payments.size;
    }
};
