import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {useThemeColors, getThemeClass} from '../utils/theme-utils';

interface RegisterInputs {
  username: string;
  password: string;
}

const Register: React.FC = () => {
  const [inputs, setInputs] = useState<RegisterInputs>({
    username: "",
    password: ""
  });
  const navigate = useNavigate();
  const themeColors = useThemeColors();

  const { username, password } = inputs;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const onSubmitForm = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.msg === "User created successfully") {
        navigate('/login');
      } else {
        throw new Error(data.msg || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={`h-full flex items-center justify-center bg-gradient-to-br ${
      themeColors.root === 'bg-amber-50' 
        ? 'from-amber-300 to-amber-50' 
        : 'from-slate-900 to-slate-600'
    }`}>
      <div className={`max-w-md w-full space-y-8 p-10 rounded-xl shadow-lg ${getThemeClass('background')} bg-opacity-80`}>
        <div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold ${getThemeClass('text')}`}>
            Create your account
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
              Register
            </button>
          </div>
        </form>
        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className={`font-medium ${getThemeClass('accent')} hover:underline transition duration-150 ease-in-out`}
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;