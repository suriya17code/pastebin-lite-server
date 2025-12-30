import express from 'express';
import { createPaste, getPaste, viewPaste, healthCheck } from '../controllers/pasteController';

const router = express.Router();

// API Routes
router.get('/api/healthz', healthCheck);
router.post('/api/pastes', createPaste);
router.get('/api/pastes/:id', getPaste);

// View Route
router.get('/p/:id', viewPaste);

export default router;
