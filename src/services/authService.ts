import apiClient from './apiClient';
import { jwtDecode } from 'jwt-decode';

export interface User {
  id: string;
  _id?: string; // MongoDB compatibility
  email: string;
  fullName: string;
  phoneNumber: string;
  productId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  productKey: string;
  phoneNumber: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

interface DecodedToken {
  userId: string;
  email: string;
  exp: number;
}

export const authService = {
  // Sign up new user
  async signUp(data: SignUpData) {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/signup', data);
      let { token, user } = response.data;
      
      // Normalize _id to id (MongoDB compatibility)
      if (user && user._id && !user.id) {
        user = { ...user, id: user._id };
      }
      
      // Store token and user data
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { data: { token, user }, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.message || error.message || 'Sign up failed' 
      };
    }
  },

  // Sign in user
  async signIn(data: SignInData) {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', data);
      let { token, user } = response.data;
      
      // Normalize _id to id (MongoDB compatibility)
      if (user && user._id && !user.id) {
        user = { ...user, id: user._id };
      }
      
      // Store token and user data
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { data: { token, user }, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.message || error.message || 'Sign in failed' 
      };
    }
  },

  // Sign out user
  async signOut() {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // Get current user from token
  getCurrentUser(): { user: User | null; error: any } {
    try {
      const token = localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('user');
      
      if (!token || !userStr) {
        return { user: null, error: null };
      }

      // Check if token is expired
      const decoded = jwtDecode<DecodedToken>(token);
      if (decoded.exp * 1000 < Date.now()) {
        this.signOut();
        return { user: null, error: 'Token expired' };
      }

      let user = JSON.parse(userStr);
      
      // Normalize _id to id (MongoDB compatibility)
      if (user && user._id && !user.id) {
        user.id = user._id;
        // Update localStorage with normalized data
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      // Validate user has required id field
      if (!user || !user.id) {
        console.error('User object missing id field:', user);
        this.signOut();
        return { user: null, error: 'Invalid user data' };
      }
      
      return { user, error: null };
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return { user: null, error };
    }
  },

  // Get user profile from server
  async getUserProfile(userId: string): Promise<{ data: User | null; error: any }> {
    try {
      if (!userId) {
        throw new Error('userId is required');
      }
      const response = await apiClient.get<User>(`/users/${userId}`);
      let user = response.data;
      
      // Normalize _id to id (MongoDB compatibility)
      if (user && user._id && !user.id) {
        user = { ...user, id: user._id };
      }
      
      return { data: user, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<User>) {
    try {
      const response = await apiClient.put<User>(`/users/${userId}`, updates);
      
      // Update local storage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const updatedUser = { ...user, ...response.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return { data: response.data, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  // Reset password
  async resetPassword(email: string) {
    try {
      await apiClient.post('/auth/reset-password', { email });
      return { error: null };
    } catch (error: any) {
      return { 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  // Update password
  async updatePassword(currentPassword: string, newPassword: string) {
    try {
      const response = await apiClient.post('/auth/update-password', {
        currentPassword,
        newPassword
      });
      return { data: response.data, error: null };
    } catch (error: any) {
      return { 
        data: null,
        error: error.response?.data?.message || error.message || 'Failed to update password'
      };
    }
  },

  // Verify token
  verifyToken(): boolean {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return false;

      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },

  // Get auth token
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
};