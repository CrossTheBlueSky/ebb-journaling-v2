import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LoginInputs {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const [inputs, setInputs] = useState<LoginInputs>({
    username: "",
    password: ""
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { username, password } = inputs;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const onSubmitForm = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.access_token) {
        localStorage.setItem("token", data.access_token);
        login(data.access_token);
        const origin = location.state?.from?.pathname || '/calendar';
        navigate(origin);
      } else {
        throw new Error(data.msg || 'Login failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex justify-around">
    <form onSubmit={onSubmitForm}>
      <input type="text" name="username" placeholder="username" value={username} onChange={onChange} />
      <input type="password" name="password" placeholder="password" value={password} onChange={onChange} />
      <button type="submit">Login</button>
    </form>
    <button type="button" onClick={() => navigate('/register')}>Register</button>
    </div>
  );
};

export default Login;