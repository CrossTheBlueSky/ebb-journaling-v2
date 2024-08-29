import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getThemeClass, useThemeColors } from '../utils/theme-utils';
import EbbHeading from './EbbHeading';

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

  const themeColors = useThemeColors();

  const { username, password } = inputs;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const onSubmitForm = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const response = await fetch('/api/login', {
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
    <div className={`h-full flex  items-center justify-center bg-gradient-to-br ${
      themeColors.root === 'bg-amber-50' 
        ? 'from-amber-300 to-amber-50' 
        : 'from-slate-900 to-slate-600'
    }`}>
              {/* <EbbHeading /> */}
      <div className={`max-w-md mx-auto w-full space-y-8 p-10 rounded-xl shadow-lg ${getThemeClass('background')} bg-opacity-80`}>

        <div>
          <h2 className={`mt-6 text-center text-2xl font-extrabold ${getThemeClass('text')}`}>
            Sign in to access your journal
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={onSubmitForm}>
          <input type="hidden" name="remember" value="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${getThemeClass('secondary')} placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 focus:z-10 sm:text-sm`}
                placeholder="Username"
                value={username}
                onChange={onChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${getThemeClass('secondary')} placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
                value={password}
                onChange={onChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md ${getThemeClass('primary')} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition duration-150 ease-in-out`}
            >
              Sign in
            </button>
          </div>
        </form>
        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate('/register')}
            className={`font-medium ${getThemeClass('accent')} hover:underline transition duration-150 ease-in-out`}
          >
            Create new account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;