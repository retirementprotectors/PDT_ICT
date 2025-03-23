import { Express } from 'express';
import { authRoutes } from './auth.routes';
import { userRoutes } from './user.routes';
import { correspondenceRoutes } from './correspondence.routes';

export const setupRoutes = (app: Express) => {
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/correspondence', correspondenceRoutes);
}; 