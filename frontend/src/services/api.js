import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get all study logs
export const getStudyLogs = async () => {
  const response = await axios.get(`${API_URL}/study-logs`);
  return response.data;
};

// Add a study log
export const addStudyLog = async (logData) => {
  const response = await axios.post(`${API_URL}/study-logs`, logData);
  return response.data;
};

// Get analytics data (includes streak)
export const getAnalytics = async () => {
  const response = await axios.get(`${API_URL}/study-logs/analytics`);
  return response.data;
};

// Delete a study log
export const deleteStudyLog = async (id) => {
  const response = await axios.delete(`${API_URL}/study-logs/${id}`);
  return response.data;
};

// User profile & favorites
export const getProfile = async () => {
  const response = await axios.get(`${API_URL}/users/profile`);
  return response.data;
};

export const getFavorites = async () => {
  const profile = await getProfile();
  return profile.favoriteSubjects || [];
};

export const updateFavorites = async (favoriteSubjects) => {
  const response = await axios.put(`${API_URL}/users/favorites`, { favoriteSubjects });
  return response.data;
};

export const toggleFavorite = async (subject) => {
  const response = await axios.post(`${API_URL}/users/favorites/${encodeURIComponent(subject)}`);
  return response.data;
};

// Study groups
export const getStudyGroups = async () => {
  const response = await axios.get(`${API_URL}/study-groups`);
  return response.data;
};

export const getStudyGroup = async (id) => {
  const response = await axios.get(`${API_URL}/study-groups/${id}`);
  return response.data;
};

export const createStudyGroup = async (name, description) => {
  const response = await axios.post(`${API_URL}/study-groups`, { name, description });
  return response.data;
};

export const inviteToGroup = async (groupId, email) => {
  const response = await axios.post(`${API_URL}/study-groups/${groupId}/invite`, { email });
  return response.data;
};

export const leaveStudyGroup = async (groupId) => {
  const response = await axios.post(`${API_URL}/study-groups/${groupId}/leave`);
  return response.data;
};
