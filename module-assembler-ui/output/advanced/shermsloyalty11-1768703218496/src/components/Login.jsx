import React, { useState } from 'react';

const Login = ({ onLogin, switchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-600 to-blue-600">
      <div className="w-full max-w-md bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl border border-white border-opacity-30 p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-white text-opacity-80">Sign in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur border border-white border-opacity-30 rounded-xl text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              required
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur border border-white border-opacity-30 rounded-xl text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-3 bg-white bg-opacity-30 backdrop-blur border border-white border-opacity-50 rounded-xl text-white font-semibold hover:bg-opacity-40 transition-all"
          >
            Sign In
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <span className="text-white text-opacity-80">Don't have an account? </span>
          <button onClick={switchToRegister} className="text-white font-semibold underline">
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;