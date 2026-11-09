// src/services/chatService.ts
import api from './api';


export interface SessionItem {
  session_id: number;
  title: string;
  last_active: string; // ISO Time
}


export interface Citation {
  doc_id: number;
  chunk_id: number;
  file_name: string;
  page: number | null;
  score: number;
  text_snippet: string;
  url?: string;
  download_url?: string;

  content_snippet?: string;
  file_hash?: string;
  chunk_hash?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
  
  content_type?: 'text' | 'image';
  artifact_url?: string;
  tx_hash?: string;
  watermark_status?: string;
  citations?: Citation[];
}


export interface CreateSessionRequest {
  title?: string;
}
export interface CreateSessionResponse {
  session_id: number;
  title: string;
  latest_tx_hash: string | null;
  created_at: string;
}

export interface SendMessageRequest {
  session_id: number;
  mode: 'text' | 'image';
  model: string;
  prompt: string;
  parameters?: {
    temperature?: number;         // text mode
    image_size?: string;          // image mode
    num_inference_steps?: number; // image mode
    batch_size?: number;          // image mode
  };
}

export interface SendMessageResponse {
  session_id: number;
  record_id: number;
  content_type: 'text' | 'image';
  role: 'assistant';
  content: string;
  tx_hash: string;
  citations?: Citation[];
  artifact_url?: string;
  watermark_status?: string;
}


export const chatService = {
  createSession: (title?: string) => {
    return api.post<unknown, CreateSessionResponse>('/sessions', { title });
  },

  getSessions: () => {
    return api.get<unknown, SessionItem[]>('/sessions');
  },

  getHistory: (sessionId: number) => {
    return api.get<unknown, ChatMessage[]>(`/sessions/${sessionId}/history`);
  },

  sendMessage: (data: SendMessageRequest) => {
    return api.post<unknown, SendMessageResponse>('/chat/completions', data, {
      timeout: 300000
    });
  }
};
