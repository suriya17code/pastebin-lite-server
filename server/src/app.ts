import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db';
import pasteRoutes from './routes/pasteRoutes';

dotenv.config();

connectDB();

const app = express();

app.set('trust proxy', 1); // Trust proxy for secure cookies / protocol checks in serverless

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/', pasteRoutes);

// Export app for Vercel
export default app;

// Only listen if run directly (not imported)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
