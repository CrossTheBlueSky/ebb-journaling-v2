import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginCheck = () => {
  const [name, setName] = useState<string>("");
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      getName();
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const getName = async (): Promise<void> => {
    try {
      const response = await fetch('http://localhost:5000/api/protected', {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setName(data.logged_in_as);
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (err) {
      console.error(err);
      logout();
      navigate('/login');
    }
  };

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  return { name, logout: handleLogout };
};