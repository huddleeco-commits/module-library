import React, { useState } from 'react';

const Register = ({ onRegister, switchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    onRegister(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-600 to-teal-600">
      <div className="w-full max-w-md bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl border border-white border-opacity-30 p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Join Us</h1>
          <p className="text-white text-opacity-80">Create your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur border border-white border-opacity-30 rounded-xl text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            required
          />
          
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur border border-white border-opacity-30 rounded-xl text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur border border-white border-opacity-30 rounded-xl text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            required
          />
          
          <input
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur border border-white border-opacity-30 rounded-xl text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            required
          />
          
          <input
            type="text"
            placeholder="Referral Code (Optional)"
            value={formData.referralCode}
            onChange={(e) => handleChange('referralCode', e.target.value)}
            className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur border border-white border-opacity-30 rounded-xl text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
          />
          
          <button
            type="submit"
            className="w-full py-3 bg-white bg-opacity-30 backdrop-blur border border-white border-opacity-50 rounded-xl text-white font-semibold hover:bg-opacity-40 transition-all"
          >
            Create Account
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <span className="text-white text-opacity-80">Already have an account? </span>
          <button onClick={switchToLogin} className="text-white font-semibold underline">
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;