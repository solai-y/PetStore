'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';
import { api } from './api';

const AuthContext = createContext(null);

function authReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload, isLoading: false };
    case 'LOGIN':
      return { ...state, user: action.payload.user, token: action.payload.token, isLoading: false };
    case 'LOGOUT':
      return { user: null, token: null, isLoading: false };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('carepets_token');
    const userStr = localStorage.getItem('carepets_user');
    const user = userStr ? JSON.parse(userStr) : null;
    dispatch({ type: 'HYDRATE', payload: { token, user } });
  }, []);

  const login = async (email, password) => {
    const data = await api.auth.login({ email, password });
    localStorage.setItem('carepets_token', data.access_token);
    localStorage.setItem('carepets_user', JSON.stringify(data.user));
    dispatch({ type: 'LOGIN', payload: { user: data.user, token: data.access_token } });
    return data;
  };

  const signup = async (body) => {
    await api.auth.signup(body);
    return login(body.email, body.password);
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore logout errors
    }
    localStorage.removeItem('carepets_token');
    localStorage.removeItem('carepets_user');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
