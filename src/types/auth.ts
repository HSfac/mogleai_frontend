export interface User {
  _id: string;
  email: string;
  username: string;
  profileImage?: string;
  tokens: number;
  creatorLevel: string;
  isSubscribed: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
} 