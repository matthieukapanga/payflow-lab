import { Router } from 'express';
import { processPayment, getPayment } from '../controllers/paymentController';
import { healthCheck } from '../controllers/healthController';

const router = Router();

//Health check
router.get('/health', healthCheck);

//payment routes
router.post('/payments', processPayment);
router.get('/payments/:id', getPayment);

export default router;