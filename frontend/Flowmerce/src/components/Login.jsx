import React from 'react';
import { FaLock, FaUser, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="h-full flex items-center justify-center mt-5">
      <form className="w-full max-w-md bg-white rounded-xl shadow p-8 space-y-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Login</h1>
        
        
        {/* Username Field */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaUser className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Username"
            className="w-full pl-10 pr-4 py-3 rounded-4xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
            className="w-full pl-10 pr-4 py-3 rounded-4xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
          <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline">
            Forgot password?
          </a>
        </div>
        
        {/* Login Button */}
        <button
          type="submit"
          className="w-full bg-[#ff5c00] text-white font-medium py-3 px-4 rounded-4xl transition duration-200 flex items-center justify-center space-x-2"
        >
          <span>Login</span>
          <FaArrowRight className="text-sm" />
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