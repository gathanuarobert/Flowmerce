import React from 'react';
import { FaUser, FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Register = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        email: "",
    });

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/register/', formData)
            console.log('Registration successfully:', response.data);
            navigate('/login')
        } catch (error) {
            console.error('Registration failed:', error.response.data)
        }
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

  return (
    <div className="h-full flex items-center justify-center mt-5">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-xl shadow p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Create Account</h1>
        
        {/* Name Field */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaUser className="text-gray-400" />
          </div>
          <input
            name='name'
            type="text"
            placeholder="Full Name"
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 rounded-4xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        
        {/* Email Field */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaEnvelope className="text-gray-400" />
          </div>
          <input
            name='email'
            type="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 rounded-4xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 rounded-4xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-[#ff5c00] text-white font-medium py-3 px-4 rounded-4xl transition duration-200 flex items-center justify-center space-x-2"
        >
          <span>Register</span>
          <FaArrowRight className="text-sm" />
        </button>
        
        <div className="text-center text-gray-600 text-sm">
          <p>
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-colors"
            >
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;