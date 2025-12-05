import { useState, useCallback, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
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
  const [isConnected, setIsConnected] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);
  const selectedUserRef = useRef<User | null>(null);

  // Keep selectedUserRef in sync
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Initialize socket connection when authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      const socket = io(API_BASE);
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        setIsConnected(true);
        // Join personal room with user ID
        socket.emit('join_room', authState.user!._id);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      // Listen for room messages
      socket.on('receive_message', (data) => {
        console.log('Received message:', data);
        const currentSelected = selectedUserRef.current;
        if (!currentSelected) return;
        
        // Only add if from the selected user (not own messages)
        if (String(data.senderId) === String(currentSelected._id)) {
          const newMessage: Message = {
            senderId: data.senderId,
            receiverId: authState.user!._id,
            message: data.message,
            createdAt: data.timestamp || new Date().toISOString(),
          };
          setMessages(prev => [...prev, newMessage]);
        }
      });

      // Listen for private messages
      socket.on('private_message', (data) => {
        console.log('Received private message:', data);
        const currentSelected = selectedUserRef.current;
        if (!currentSelected) return;
        
        // Only add if from the selected user
        if (String(data.from) === String(currentSelected._id)) {
          const newMessage: Message = {
            senderId: data.from,
            receiverId: authState.user!._id,
            message: data.message,
            createdAt: data.timestamp || new Date().toISOString(),
          };
          setMessages(prev => [...prev, newMessage]);
        }
      });

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    }
  }, [authState.isAuthenticated, authState.user]);

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

        // Emit via socket
        if (socketRef.current) {
          const roomId = [authState.user._id, receiverId].sort().join('_');
          
          // Send to room
          socketRef.current.emit('send_message', {
            roomId,
            message,
            senderId: authState.user._id,
            senderName: authState.user.name || authState.user.moblieNumber,
          });

          // Send private message
          socketRef.current.emit('private_message', {
            to: receiverId,
            message,
            from: authState.user._id,
            senderName: authState.user.name || authState.user.moblieNumber,
          });
        }

        return { success: true };
      }
      return { success: false };
    } catch (err) {
      console.error('Error sending message:', err);
      return { success: false };
    }
  }, [authState.token, authState.user]);

  const selectUser = useCallback((user: User | null) => {
    setSelectedUser(user);
    setMessages([]);
    
    if (user && socketRef.current && authState.user) {
      // Join the room between both users
      const roomId = [authState.user._id, user._id].sort().join('_');
      socketRef.current.emit('join_room', roomId);
      fetchMessages(user._id);
    }
  }, [fetchMessages, authState.user]);

  const logout = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setAuthState({ user: null, token: null, isAuthenticated: false });
    setUsers([]);
    setMessages([]);
    setSelectedUser(null);
    setIsConnected(false);
  }, []);

  return {
    authState,
    users,
    messages,
    selectedUser,
    isLoading,
    error,
    isConnected,
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
