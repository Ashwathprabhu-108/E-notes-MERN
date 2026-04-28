import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      // Decode the token payload to get user info
      const payload = JSON.parse(atob(token.split('.')[1]));
      login(token, { id: payload.id, username: payload.username });
      navigate('/');
    } else {
      navigate('/login');
    }
  }, []);

  return <p>Signing you in...</p>;
}