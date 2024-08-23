import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface UserData {
  id: string;
  name: string;
}

export const useLoginCheck = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      getUserData();
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const getUserData = async (): Promise<void> => {
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
        setUserData({
          id: data.user_id,
          name: data.logged_in_as
        });
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (err) {
      console.error(err);
      handleLogout();
    }
  };

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  return { 
    userId: userData?.id,
    userName: userData?.name,
    logout: handleLogout 
  };
};