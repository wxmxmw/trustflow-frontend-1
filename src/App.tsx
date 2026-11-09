import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import LoginPage from './pages/auth/LoginPage';
import ChatPage from './pages/chat/ChatPage';
import { useAuthStore } from './store/useAuthStore';
import KnowledgePage from './pages/knowledge/KnowledgePage';
import VerificationPage from './pages/verification/VerificationPage';
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify" element={<VerificationPage />} />
        

        <Route 
          path="/chat" 
          element={
            <PrivateRoute>
              <ChatPage />
            </PrivateRoute>
          } 
        />
        
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/knowledge" element={<KnowledgePage />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;