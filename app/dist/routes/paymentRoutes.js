"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentController_1 = require("../controllers/paymentController");
const healthController_1 = require("../controllers/healthController");
const router = (0, express_1.Router)();
//Health check
router.get('/health', healthController_1.healthCheck);
//payment routes
router.post('/payments', paymentController_1.processPayment);
router.get('/payments/:id', paymentController_1.getPayment);
exports.default = router;
