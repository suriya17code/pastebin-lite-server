import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Paste from '../models/Paste';
import { getCurrentTime } from '../utils/timeUtils'; 
import { sendErrorResponse } from '../utils/responseUtils';
import { fetchAndCountPaste } from '../utils/pasteUtils';
 
// Create Paste
export const createPaste = async (req: Request, res: Response) => {
  try {
    const { content, ttl_seconds, max_views } = req.body;

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return sendErrorResponse(res, 400, 'Content is required and must be a non-empty string', 'json');
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
    sendErrorResponse(res, 500, error.message, 'json');
  }
};

// API Get Paste
export const getPaste = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const paste = await fetchAndCountPaste(id, req);

    if (!paste) {
      return sendErrorResponse(res, 404, 'Paste not found or unavailable', 'json');
    }

    res.json({
      content: paste.content,
      remaining_views: paste.remaining_views, // might be undefined/null which is fine
      expires_at: paste.expires_at,
    });
  } catch (error: any) {
    sendErrorResponse(res, 500, error.message, 'json');
  }
};

// HTML View Paste
export const viewPaste = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const paste = await fetchAndCountPaste(id, req);

    if (!paste) {
      return sendErrorResponse(res, 404, 'Paste not found or unavailable', 'html');
    }

    res.render('paste', {
        content: paste.content,
        expires_at: paste.expires_at,
        remaining_views: paste.remaining_views
    });

  } catch (error: any) {
     sendErrorResponse(res, 404, '404 - Error', 'html');
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
