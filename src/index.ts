import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import countryRoutes from './routes/country.routes';
import { initializeDatabase } from './config/database';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

app.use('/', countryRoutes);

app.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'Country Currency & Exchange API',
        version: '1.0.0',
        endpoints: {
            'POST /countries/refresh': 'Refresh country data from external APIs',
            'GET /countries': 'Get all countries (supports ?region=, ?currency=, ?sort=)',
            'GET /countries/:name': 'Get specific country by name',
            'DELETE /countries/:name': 'Delete a country',
            'GET /status': 'Get API status',
            'GET /countries/image': 'Get summary image'
        }
    });
});

app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
});

const startServer = async () => {
    try {
        await initializeDatabase();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 API URL: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();