import api from './api';

export interface KnowledgeFile {
  id: number;
  filename: string;
  file_type: string;
  file_size: number;
  status: 'processing' | 'indexed' | 'failed' | 'uploading' | 'ready'; 
  created_at: string;
  hash?: string;
  tx_hash?: string;
  chunk_count?: number;
}

interface BackendDocument {
  doc_id: number;
  file_name: string;
  file_size?: number;
  status: KnowledgeFile['status'];
  upload_time: string;
  tx_hash?: string;
  file_hash?: string;
  chunk_count?: number;
}

const mapBackendToFrontend = (item: BackendDocument): KnowledgeFile => ({
  id: item.doc_id,
  filename: item.file_name,
  file_type: item.file_name.split('.').pop() || 'unknown',
  file_size: item.file_size || 0,
  status: item.status === 'indexed' ? 'ready' : item.status,
  created_at: item.upload_time,
  tx_hash: item.tx_hash,
  hash: item.file_hash,
  chunk_count: item.chunk_count || 0,
});

export const knowledgeService = {
  /**
   * Fetch documents.
   */
  getDocuments: async (): Promise<KnowledgeFile[]> => {
    const res = await api.get('/documents');
    const list = Array.isArray(res) ? res : (res?.data || []);
    return list.map(mapBackendToFrontend);
  },

  /**
   * Upload a document.
   */
  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete a document.
   */
  deleteDocument: async (docId: number) => {
    const response = await api.delete(`/documents/${docId}`);
    return response.data;
  },
};
