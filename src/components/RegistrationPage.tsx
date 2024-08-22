import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

  const { username, password } = inputs;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const onSubmitForm = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/register', {
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
    <form onSubmit={onSubmitForm}>
      <input type="text" name="username" placeholder="username" value={username} onChange={onChange} />
      <input type="password" name="password" placeholder="password" value={password} onChange={onChange} />
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;