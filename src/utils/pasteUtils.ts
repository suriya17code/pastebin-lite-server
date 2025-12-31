import { Request } from 'express';
import Paste, { IPaste } from '../models/Paste';
import { getCurrentTime } from './timeUtils';

// Get Paste Function (Reusable logic)
// Returns the paste document if available, null otherwise.
// Handles view counting decrement.
export const fetchAndCountPaste = async (id: string, req: Request): Promise<IPaste | null> => {
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
