import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('token');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing stored user:", error);
      localStorage.removeItem('token'); // Clear corrupted data
      return null;
    }
  });

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'token') {
        try {
          const newUser = event.newValue ? JSON.parse(event.newValue) : null;
          setUser(newUser);
        } catch (error) {
          console.error("Error parsing stored user on storage event:", error);
          setUser(null); 
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('token', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const value = {
    user,
    login,
    logout,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}