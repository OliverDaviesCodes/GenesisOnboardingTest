import type { ReactNode } from 'react';

export type { ReactNode };

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface DataEntry {
  id: number;
  title: string;
  description: string;
  category: string;
  value: number;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface CreateDataEntryRequest {
  title: string;
  description: string;
  category: string;
  value: number;
}

export interface UpdateDataEntryRequest {
  title: string;
  description: string;
  category: string;
  value: number;
}