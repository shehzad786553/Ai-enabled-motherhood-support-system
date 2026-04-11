import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem('momcare_token');
      if (token) {
        try {
          const { user: me } = await authAPI.getMe();
          setUser(me);
        } catch {
          localStorage.removeItem('momcare_token');
        }
      }
      setLoading(false);
    };
    restore();
  }, []);

  const login = async (credentials) => {
    const { token, user: loggedUser } = await authAPI.login(credentials);
    localStorage.setItem('momcare_token', token);
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (userData) => {
    const { token, user: newUser } = await authAPI.register(userData);
    localStorage.setItem('momcare_token', token);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('momcare_token');
  };

  const updateUser = useCallback(async (updates) => {
    try {
      const { user: updated } = await authAPI.update(updates);
      setUser(updated);
      return updated;
    } catch {
      return user;
    }
  }, [user]);

  if (loading) {
    return (
      <div style={{
        minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
        background:'#0a2540', flexDirection:'column', gap:'16px'
      }}>
        <div style={{ fontSize:'48px' }}>🌸</div>
        <div style={{ color:'white', fontFamily:'Georgia,serif', fontSize:'18px' }}>
          MomCare AI loading...
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
