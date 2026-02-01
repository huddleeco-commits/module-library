import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Input from '../shared/Input';
import Button from '../shared/Button';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/home'); // ← CHANGED FROM '/dashboard'
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      {error && (
        <div className='p-4 bg-danger/20 border border-danger rounded-xl text-danger text-sm'>
          {error}
        </div>
      )}
      
      <Input
        type='email'
        label='Email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder='you@example.com'
        required
      />
      
      <div>
        <Input
          type='password'
          label='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='Enter your password'
          required
        />
        <div className='text-right mt-2'>
          <Link 
            to='/forgot-password' 
            className='text-sm text-slate-400 hover:text-indigo-400 transition-colors'
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <Button type='submit' className='w-full' disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}