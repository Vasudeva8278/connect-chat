import { useState, useCallback } from 'react';
import { User, Message, AuthState } from '@/types/chat';

const API_BASE = 'http://localhost:3000';

export function useChat() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (mobileNumber: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(async (mobileNumber: string, otp: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/verifyotp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber, otp }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'OTP verification failed');
      
      setAuthState({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
      });
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OTP verification failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    if (!authState.token) return;
    try {
      const response = await fetch(`${API_BASE}/api/users`, {
        headers: { Authorization: `Bearer ${authState.token}` },
      });
      const data = await response.json();
      if (response.ok) {
        const filteredUsers = (data.Users || []).filter(
          (u: User) => u._id !== authState.user?._id
        );
        setUsers(filteredUsers);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, [authState.token, authState.user?._id]);

  const fetchMessages = useCallback(async (receiverId: string) => {
    if (!authState.token) return;
    try {
      const response = await fetch(
        `${API_BASE}/api/message/receive?receiverId=${receiverId}`,
        { headers: { Authorization: `Bearer ${authState.token}` } }
      );
      const data = await response.json();
      if (response.ok && data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  }, [authState.token]);

  const sendMessage = useCallback(async (receiverId: string, message: string) => {
    if (!authState.token || !authState.user) return { success: false };
    try {
      const response = await fetch(`${API_BASE}/api/message/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authState.token}`,
        },
        body: JSON.stringify({ receiverId, message }),
      });
      
      if (response.ok) {
        const newMessage: Message = {
          senderId: authState.user._id,
          receiverId,
          message,
          createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, newMessage]);
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      console.error('Error sending message:', err);
      return { success: false };
    }
  }, [authState.token, authState.user]);

  const selectUser = useCallback((user: User) => {
    setSelectedUser(user);
    setMessages([]);
    fetchMessages(user._id);
  }, [fetchMessages]);

  const logout = useCallback(() => {
    setAuthState({ user: null, token: null, isAuthenticated: false });
    setUsers([]);
    setMessages([]);
    setSelectedUser(null);
  }, []);

  return {
    authState,
    users,
    messages,
    selectedUser,
    isLoading,
    error,
    login,
    verifyOtp,
    fetchUsers,
    fetchMessages,
    sendMessage,
    selectUser,
    logout,
    setError,
  };
}
