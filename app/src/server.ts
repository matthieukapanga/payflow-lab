import express, {Application, Request, Response, NextFunction} from 'express';
import routes from './routes/paymentRoutes';
import { error, timeStamp } from 'node:console';

const app: Application = express();
const PORT = process.env.PORT || 3000;

//Middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//Request logging middleware
app.use((req:Request, res: Response, next: NextFunction) =>{
    console.log(`[Payflow] ${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

//Route
app.use('/api', routes);

//404 handler
app.use((req: Request, res: Response) =>{
    res.status(404).json({
        success: false,
        error: `Route ${req.path} not found`,
        timeStamp: new Date().toISOString()
    });
});

//Global error handler
app.use((err:Error, req: Request, res: Response, next: NextFunction) =>{
    console.error('[Payflow] Unhandled error:', err.message);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        timeStamp: new Date().toISOString()
    });
});

//Start server
app.listen(PORT, () => {
    console.log(`
    ===============================
        PayFlow API Server
    ===============================
        Status: RUNNING
        Port: ${PORT}
        Environment: ${process.env.NODE_ENV || 'development'}
        Health: http://localhost:${PORT}/api/health
    ===============================
        `);
});

export default app;
