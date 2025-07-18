import React from 'react';
import { useState } from 'react';
import { FaLock, FaArrowRight, FaSpinner, FaEnvelope } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",  // Changed from username to email
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/login/', {
        email: formData.email,  // Changed to match backend expectation
        password: formData.password
      });
      
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      const errorMessage = error.response?.data?.error ||  // Matches your Django error key
                         error.response?.data?.message || 
                         'Login failed. Please check your credentials.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="h-full flex items-center justify-center mt-5">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-xl shadow p-8 space-y-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Login</h1>
        
        {/* Email Field - Updated to use email */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaEnvelope className="text-gray-400" />
          </div>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 rounded-4xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            required
          />
        </div>
        
        {/* Password Field */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaLock className="text-gray-400" />
          </div>
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 rounded-4xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            required
          />
        </div>
        
        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 text-gray-600">
            <input 
              type="checkbox" 
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline">
            Forgot password?
          </Link>
        </div>
        
        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#ff5c00] text-white font-medium py-3 px-4 rounded-4xl transition duration-200 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <FaSpinner className="animate-spin" />
          ) : (
            <>
              <span>Login</span>
              <FaArrowRight className="text-sm" />
            </>
          )}
        </button>
        
        {/* Sign Up Link */}
        <div className="text-center text-gray-600 text-sm">
          <p>
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-colors"
            >
              Register
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;