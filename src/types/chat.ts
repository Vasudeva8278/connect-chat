export interface User {
  _id: string;
  name?: string;
  moblieNumber: string;
}

export interface Message {
  _id?: string;
  senderId: string | { _id: string; name?: string; moblieNumber?: string };
  receiverId: string;
  message: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
