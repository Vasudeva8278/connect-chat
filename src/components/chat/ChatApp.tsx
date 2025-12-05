import { useState, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { LoginForm } from './LoginForm';
import { OtpForm } from './OtpForm';
import { UsersSidebar } from './UsersSidebar';
import { ChatArea } from './ChatArea';

type AuthStep = 'login' | 'otp' | 'chat';

export function ChatApp() {
  const [authStep, setAuthStep] = useState<AuthStep>('login');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isConnected, setIsConnected] = useState(true);

  const {
    authState,
    users,
    messages,
    selectedUser,
    isLoading,
    error,
    login,
    verifyOtp,
    fetchUsers,
    sendMessage,
    selectUser,
    logout,
    setError,
  } = useChat();

  useEffect(() => {
    if (authState.isAuthenticated) {
      setAuthStep('chat');
      fetchUsers();
    }
  }, [authState.isAuthenticated, fetchUsers]);

  const handleLogin = async (mobile: string) => {
    setMobileNumber(mobile);
    const result = await login(mobile);
    if (result.success) {
      setAuthStep('otp');
      setError(null);
    }
    return result;
  };

  const handleVerifyOtp = async (otp: string) => {
    const result = await verifyOtp(mobileNumber, otp);
    return result;
  };

  const handleBack = () => {
    setAuthStep('login');
    setError(null);
  };

  const handleLogout = () => {
    logout();
    setAuthStep('login');
    setMobileNumber('');
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedUser) return { success: false };
    return sendMessage(selectedUser._id, message);
  };

  if (authStep === 'login') {
    return <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />;
  }

  if (authStep === 'otp') {
    return (
      <OtpForm
        mobileNumber={mobileNumber}
        onSubmit={handleVerifyOtp}
        onBack={handleBack}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar - responsive */}
      <div className="w-80 lg:w-96 shrink-0 hidden md:block">
        <UsersSidebar
          users={users}
          currentUser={authState.user}
          selectedUser={selectedUser}
          isConnected={isConnected}
          onSelectUser={selectUser}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile sidebar toggle */}
      <div className="md:hidden absolute top-0 left-0 right-0 z-50">
        {!selectedUser && (
          <div className="h-screen">
            <UsersSidebar
              users={users}
              currentUser={authState.user}
              selectedUser={selectedUser}
              isConnected={isConnected}
              onSelectUser={selectUser}
              onLogout={handleLogout}
            />
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatArea
          selectedUser={selectedUser}
          currentUser={authState.user}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* Mobile back button when in chat */}
      {selectedUser && (
        <button
          onClick={() => selectUser(null as any)}
          className="md:hidden fixed top-4 left-4 z-50 bg-primary text-primary-foreground p-2 rounded-full shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
    </div>
  );
}
