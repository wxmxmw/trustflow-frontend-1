import api from './api';

interface NonceResponse {
  nonce: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user_info: {
    user_id: number;
    wallet_address: string;
  };
}

export const authService = {
  getNonce: (wallet_address: string) => {
    return api.post<unknown, NonceResponse>('/auth/nonce', { wallet_address });
  },
  
  login: (wallet_address: string, signature: string) => {
    return api.post<unknown, LoginResponse>('/auth/login', { wallet_address, signature });
  }
};
