import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Input from '../shared/Input';
import Button from '../shared/Button';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(email, password, fullName);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
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
        type='text'
        label='Full Name'
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder='John Doe'
        required
      />
      
      <Input
        type='email'
        label='Email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder='you@example.com'
        required
      />
      
      <Input
        type='password'
        label='Password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder='Create a password'
        required
        minLength={6}
      />

      <Button type='submit' className='w-full' disabled={loading}>
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );
}
