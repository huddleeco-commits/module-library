import client from './client';

export const authAPI = {
  register: async (email, password, fullName, referralCode = null) => {
    const response = await client.post('/auth/register', { email, password, fullName, referralCode });
    return response.data;
  },

  login: async (email, password) => {
    const response = await client.post('/auth/login', { email, password });
    return response.data;
  },
};