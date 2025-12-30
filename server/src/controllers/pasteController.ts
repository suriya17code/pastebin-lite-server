import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Paste, { IPaste } from '../models/Paste';

// Helper for deterministic time
const getCurrentTime = (req: Request): Date => {
  const testMode = process.env.TEST_MODE === '1';
  if (testMode) {
    const headerTime = req.headers['x-test-now-ms'];
    if (headerTime && typeof headerTime === 'string') {
      const ms = parseInt(headerTime, 10);
      if (!isNaN(ms)) {
        return new Date(ms);
      }
    }
  }
  return new Date();
};

// Create Paste
export const createPaste = async (req: Request, res: Response) => {
  try {
    const { content, ttl_seconds, max_views } = req.body;

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return res.status(400).json({ error: 'Content is required and must be a non-empty string' });
    }

    const now = getCurrentTime(req);
    let expires_at: Date | undefined;
    if (ttl_seconds && typeof ttl_seconds === 'number' && ttl_seconds >= 1) {
      expires_at = new Date(now.getTime() + ttl_seconds * 1000);
    }

    let remaining_views: number | undefined;
    if (max_views && typeof max_views === 'number' && max_views >= 1) {
      remaining_views = max_views;
    }

    const paste = new Paste({
      content,
      max_views,
      remaining_views, // Can be undefined
      expires_at,
      created_at: now,
    });

    await paste.save();

    // Determine protocol and host for URL
    const protocol = req.protocol;
    const host = req.get('host');
    const url = `${protocol}://${host}/p/${paste._id}`;

    res.status(201).json({ id: paste._id, url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get Paste Function (Reusable logic)
// Returns the paste document if available, null otherwise.
// Handles view counting decrement.
const fetchAndCountPaste = async (id: string, req: Request): Promise<IPaste | null> => {
  const now = getCurrentTime(req);

  // 1. Fetch first to check expiry without modifying
  // We need to verify if it exists and expires_at
  const pasteAttempt = await Paste.findById(id);

  if (!pasteAttempt) return null;

  // Check TTL
  if (pasteAttempt.expires_at && pasteAttempt.expires_at < now) {
    return null;
  }

  // Check View Limit & Decrement
  // If remaining_views is undefined/null, it's unlimited.
  if (pasteAttempt.remaining_views === undefined || pasteAttempt.remaining_views === null) {
      return pasteAttempt;
  }

  // If we have a view limit, we must decrement atomically
  // Update only if remaining_views > 0
  const updatedPaste = await Paste.findOneAndUpdate(
    { _id: id, remaining_views: { $gt: 0 } },
    { $inc: { remaining_views: -1 } },
    { new: true } // Return the updated document
  );
  
  // Note: if atomic update fails (returned null), it means remaining_views was 0.
  // We also need to re-check TTL on the updated doc technically, but we did it above.
  // The only race condition is if expires_at passes between findById and findOneAndUpdate.
  // But strictly, if 'updatedPaste' is null, it might be due to remaining_views being 0.
  
  if (!updatedPaste) return null; 

  // Re-check TTL on updatedPaste just in case
  if (updatedPaste.expires_at && updatedPaste.expires_at < now) {
      return null;
  }

  return updatedPaste;
};

// API Get Paste
export const getPaste = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const paste = await fetchAndCountPaste(id, req);

    if (!paste) {
      return res.status(404).json({ error: 'Paste not found or unavailable' });
    }

    res.json({
      content: paste.content,
      remaining_views: paste.remaining_views, // might be undefined/null which is fine
      expires_at: paste.expires_at,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


// HTML View Paste
export const viewPaste = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const paste = await fetchAndCountPaste(id, req);

    if (!paste) {
      return res.status(404).send('<h1>404 - Paste not found or unavailable</h1>');
    }

    // Sanitize content minimally (basic escape) for display
    // In a real app use a library. Here we replace < with &lt;
    const safeContent = paste.content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>View Paste</title>
        <style>
            body { font-family: sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; line-height: 1.6; }
            pre { background: #f4f4f4; padding: 1rem; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; }
        </style>
      </head>
      <body>
        <h1>Paste Content</h1>
        <pre>${safeContent}</pre>
      </body>
      </html>
    `;
    res.send(html);

  } catch (error: any) {
     res.status(404).send('<h1>404 - Error</h1>');
  }
}

export const healthCheck = (req: Request, res: Response) => {
  // Check db connection state
  // mongoose.connection.readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const isDbConnected = mongoose.connection.readyState === 1;
  
  // Requirement: "reflect whether the application can access its persistence layer"
  if (isDbConnected) {
      res.status(200).json({ ok: true });
  } else {
      res.status(503).json({ ok: false, error: 'Database disconnected' });
  }
};
