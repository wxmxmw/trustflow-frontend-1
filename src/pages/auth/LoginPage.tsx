// src/pages/auth/LoginPage.tsx
import React from 'react';
import { Button, Typography } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import { useWeb3Login } from '../../hooks/useWeb3Login';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const { connectAndLogin, loading } = useWeb3Login();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.logoSection}>
          <div style={styles.logoCircle} />
          <Title level={2} style={{ margin: '16px 0 8px' }}>TrustFlow</Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            Blockchain-backed AIGC provenance
          </Text>
        </div>

        <div style={styles.actionSection}>
          <Button 
            type="primary" 
            size="large" 
            icon={<WalletOutlined />} 
            onClick={connectAndLogin} 
            loading={loading}
            style={styles.loginBtn}
          >
            Connect wallet to sign in
          </Button>
          
          <div style={styles.footerText}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              No registration needed. Connect your Web3 wallet to get started.
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
  } as React.CSSProperties,
  content: {
    width: '100%',
    maxWidth: '400px',
    padding: '40px',
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  logoSection: {
    marginBottom: '40px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  logoCircle: {
    width: '60px',
    height: '60px',
    backgroundColor: '#000',
    borderRadius: '50%',
    marginBottom: '10px',
  },
  actionSection: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  loginBtn: {
    height: '50px',
    borderRadius: '6px',
    fontSize: '16px',
    backgroundColor: '#10a37f',
    borderColor: '#10a37f',
    width: '100%',
  },
  footerText: {
    marginTop: '20px',
  }
};

export default LoginPage;
