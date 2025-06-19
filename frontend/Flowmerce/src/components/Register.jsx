import React from 'react';
import { FaUser, FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Register = () => {
  return (
    <div className="h-full flex items-center justify-center mt-5">
      <form className="w-full max-w-md bg-white rounded-xl shadow p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Create Account</h1>
        
        {/* Name Field */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaUser className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Full Name"
            className="w-full pl-10 pr-4 py-3 rounded-4xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        
        {/* Email Field */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaEnvelope className="text-gray-400" />
          </div>
          <input
            type="email"
            placeholder="Email"
            className="w-full pl-10 pr-4 py-3 rounded-4xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        
        {/* Password Field */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaLock className="text-gray-400" />
          </div>
          <input
            type="password"
            placeholder="Password"
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