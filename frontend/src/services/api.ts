import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { AuthResponse, LoginRequest, RegisterRequest, DataEntry, CreateDataEntryRequest, UpdateDataEntryRequest } from '../types';

const API_BASE_URL = 'https://localhost:7201/api'; // Default .NET Core Web API URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/register', userData);
    return response.data;
  },
};

export const dataEntriesApi = {
  getAll: async (): Promise<DataEntry[]> => {
    const response: AxiosResponse<DataEntry[]> = await api.get('/dataentries');
    return response.data;
  },

  getById: async (id: number): Promise<DataEntry> => {
    const response: AxiosResponse<DataEntry> = await api.get(`/dataentries/${id}`);
    return response.data;
  },

  create: async (data: CreateDataEntryRequest): Promise<DataEntry> => {
    const response: AxiosResponse<DataEntry> = await api.post('/dataentries', data);
    return response.data;
  },

  update: async (id: number, data: UpdateDataEntryRequest): Promise<void> => {
    await api.put(`/dataentries/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/dataentries/${id}`);
  },
};

export default api;