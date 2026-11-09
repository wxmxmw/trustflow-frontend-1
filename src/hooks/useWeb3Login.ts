import { useState } from 'react';
import { ethers } from 'ethers';
import { isAxiosError } from 'axios';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';

export const useWeb3Login = () => {
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const connectAndLogin = async () => {
    if (!window.ethereum) {
      message.warning('MetaMask was not found. Please install it first.');
      return;
    }

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      

      const { nonce } = await authService.getNonce(address);
      if (!nonce) throw new Error('Could not obtain a valid signing nonce');

      const signature = await signer.signMessage(nonce);

      const data = await authService.login(address, signature);

      setAuth(data.access_token, data.user_info);
      message.success('Signed in successfully!');
      
      navigate('/chat');

    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ACTION_REJECTED') {
        message.info('You cancelled the signature request');
      } else if (isAxiosError(error) && error.response) {
        const serverError = error.response.data as { error?: string; detail?: string };
        if (serverError?.error === 'signature_invalid') {
          message.error('Signature verification failed. Please try again.');
        } else {
          message.error(`Sign in failed: ${serverError?.detail || 'Server error'}`);
        }
      } else {
        message.error('Network error. Check the backend service.');
      }
    } finally {
      setLoading(false);
    }
  };

  return { connectAndLogin, loading };
};
