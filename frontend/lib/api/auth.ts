import { apiClient } from './client';
import type { LoginInput, SignupInput } from '../validators/auth';

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}

export async function login(credentials: LoginInput): Promise<AuthResponse> {
  return apiClient<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function signup(data: SignupInput): Promise<AuthResponse> {
  return apiClient<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getCurrentUser() {
  return apiClient<AuthResponse['user']>('/auth/me');
}
