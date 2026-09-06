/**
 * API client for backend communication.
 */

import axios from 'axios';
import { UserProfile, Questionnaire, AnalysisResponse } from './types';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api/v1';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiClient = {
  createUser: async (name: string, email: string) => {
    const response = await client.post('/users', { name, email });
    return response.data;
  },

  runAnalysis: async (
    userId: string,
    profile: UserProfile,
    questionnaire: Questionnaire
  ): Promise<AnalysisResponse> => {
    const response = await client.post(
      `/analysis?userId=${userId}`,
      { profile, questionnaire }
    );
    return response.data;
  },

  getAnalysis: async (analysisId: string): Promise<AnalysisResponse> => {
    const response = await client.get(`/analysis/${analysisId}`);
    return response.data;
  },

  listAnalyses: async (userId: string) => {
    const response = await client.get(`/analysis?userId=${userId}`);
    return response.data;
  },
};
