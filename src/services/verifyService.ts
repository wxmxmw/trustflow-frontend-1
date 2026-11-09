import api from './api';

export const verifyService = {
  check: async (params: { type: 'text' | 'image'; text?: string; file?: File }) => {
    const formData = new FormData();
    formData.append('type', params.type);
    if (params.text) formData.append('text', params.text);
    if (params.file) formData.append('file', params.file);
    
    const response = await api.post('/verify/check', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  lookupHash: async (txHash: string) => {
    const response = await api.get(`/verify/tx/${txHash}`);
    return response.data;
  }
};