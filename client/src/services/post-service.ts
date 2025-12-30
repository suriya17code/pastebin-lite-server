import { apiService } from './api-service';
import { ENDPOINTS } from './api-constants';

export interface CreatePasteDTO {
  content: string;
  ttl_seconds?: number;
  max_views?: number;
}

export interface PasteResponse {
  id: string;
  url: string;
}

export interface GetPasteResponse {
  content: string;
  remaining_views?: number;
  expires_at?: string;
}

export const postService = {
  createPaste: (data: CreatePasteDTO) => {
    return apiService.post<PasteResponse>(ENDPOINTS.PASTES, data);
  },
  
  getPaste: (id: string) => {
      // The requirement says GET /api/pastes/:id
    return apiService.get<GetPasteResponse>(`${ENDPOINTS.PASTES}/${id}`);
  },

  checkHealth: () => {
    return apiService.get<{ ok: boolean }>(ENDPOINTS.HEALTH);
  }
};
