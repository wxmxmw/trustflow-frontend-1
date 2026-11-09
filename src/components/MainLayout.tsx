import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Layout, 
  Button, 
  Input, 
  List, 
  Modal,
} from 'antd';
import { 
  PlusOutlined, 
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  SettingOutlined,
  DatabaseOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';

const { Sider } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
  onNewChat?: () => void;
  sessions?: { session_id: number; title: string; last_active: string }[];
  currentSessionId?: number | null;
  onSessionClick?: (id: number) => void;
  onOpenSettings?: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  onNewChat,
  onSessionClick,
  onOpenSettings,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  
  const { 
    sessions: globalSessions, 
    fetchSessions, 
    currentSessionId: globalSessionId, 
    setCurrentSessionId 
  } = useChatStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const isKnowledgePage = location.pathname === '/knowledge';

  const filteredSessions = globalSessions.filter(session => 
    session.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const formatAddress = (address?: string) => {
    if (!address) return "Wallet not connected";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleLogout = () => {
    Modal.confirm({
      title: 'Confirm sign out',
      content: 'Are you sure you want to sign out?',
      okText: 'Sign out',
      cancelText: 'Cancel',
      onOk: () => {
        logout();
        navigate('/login');
      },
    });
  };

  const handleInternalSessionClick = (id: number) => {
    setCurrentSessionId(id);
    if (onSessionClick) {
      onSessionClick(id);
    }
    if (isKnowledgePage) {
      navigate('/chat');
    }
  };

  const styles = {
    sider: { 
      background: '#f9f9f9', 
      borderRight: '1px solid #e5e5e5',
      display: 'flex',
      flexDirection: 'column' as const,
      height: '100vh'
    },
    sidebarBtn: {
      textAlign: 'left' as const,
      border: 'none',
      background: 'transparent',
      padding: '10px',
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: '#000',
      fontSize: '14px',
      borderRadius: '8px',
      cursor: 'pointer',
    },
  };

  return (
    <Layout style={{ height: '100vh', background: '#fff' }}>
      <Sider 
        width={260} 
        style={styles.sider} 
        trigger={null} 
        collapsible 
        collapsed={!isSidebarOpen}
        collapsedWidth={0}
        theme="light"
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ padding: '16px 16px 0 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <Button 
                type="text" 
                icon={<PlusOutlined />} 
                onClick={() => {
                  setCurrentSessionId(null);
                  if (isKnowledgePage) navigate('/chat');
                  onNewChat?.();
                }} 
                style={{ flex: 1, textAlign: 'left', border: '1px solid #e5e5e5', borderRadius: 8 }}
              >
                New Chat
              </Button>
            </div>
            <Input 
              placeholder="Search chats..." 
              prefix={<SearchOutlined style={{ color: '#999' }} />} 
              variant="filled"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ borderRadius: 8, background: '#ececec' }}
            />
            
            <div 
              style={{ 
                ...styles.sidebarBtn, 
                marginTop: 12,
                background: isKnowledgePage ? '#e0e0e0' : 'transparent',
              }} 
              className="hover-bg-gray"
              onClick={() => navigate('/knowledge')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <DatabaseOutlined /> Knowledge Base
              </span>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', paddingLeft: '8px' }}>
              Recent
            </div>
            <List
              dataSource={filteredSessions}
              split={false}
              renderItem={item => (
                <List.Item style={{ padding: 0, marginBottom: 4 }}>
                  <div 
                    className="hover-bg-gray"
                    style={{
                      ...styles.sidebarBtn,
                      background: globalSessionId === item.session_id && !isKnowledgePage ? '#e0e0e0' : 'transparent',
                      fontWeight: globalSessionId === item.session_id && !isKnowledgePage ? 500 : 400,
                    }}
                    onClick={() => handleInternalSessionClick(item.session_id)}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </span>
                  </div>
                </List.Item>
              )}
            />
          </div>

          <div style={{ padding: '12px', borderTop: '1px solid #e5e5e5' }}>
            <div 
              style={{ ...styles.sidebarBtn, marginBottom: 4 }} 
              className="hover-bg-gray"
              onClick={() => onOpenSettings?.()}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <SettingOutlined /> Settings
              </span>
            </div>

            <div 
              style={{ ...styles.sidebarBtn, marginBottom: 4, color: '#ff4d4f' }} 
              className="hover-bg-gray"
              onClick={handleLogout}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <LogoutOutlined /> Sign out
              </span>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '8px', 
              borderRadius: '8px', 
              marginTop: 4,
              background: '#f0f0f0'
            }}>
              <div style={{ 
                width: 28, 
                height: 28, 
                background: '#10a37f', 
                borderRadius: '6px',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#fff', 
                fontSize: 10,
                fontWeight: 600
              }}>
                W3
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#333' }}>
                  {formatAddress(user?.wallet_address)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Sider>

      <Layout style={{ background: '#fff', position: 'relative' }}>
        <div style={{ 
          height: '50px', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '0 16px', 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          zIndex: 10,
        }}>
          <Button 
            type="text" 
            icon={isSidebarOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />} 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ color: '#666' }}
          />
        </div>
        
        {children}
      </Layout>
    </Layout>
  );
};

export default MainLayout;
