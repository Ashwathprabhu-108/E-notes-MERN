// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            const updatedUser = { id: data.id, username: data.username, email: data.email, isDisabled: data.isDisabled };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
          } else if (res.status === 403) {
            const stored = localStorage.getItem('user');
            if (stored) {
              const parsed = JSON.parse(stored);
              parsed.isDisabled = true;
              localStorage.setItem('user', JSON.stringify(parsed));
              setUser(parsed);
            }
          } else if (res.status === 401) {
            logout();
          }
        } catch (err) {
          console.error("Failed to fetch user status", err);
        }
      }
    };
    fetchCurrentUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);