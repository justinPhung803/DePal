import React from 'react'
import {useState} from 'react';
import { useAuthStore } from '../store/useAuthStore.js';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const { login, loading } = useAuthStore();

  return <form className='space-y-6'
    onSubmit={(e) => {
      e.preventDefault();
      login({email, password});
    }}
  >
    <div>
        <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
            Email address
        </label>
        <div className='mt-1'>
            <input 
            id='email'
            name = 'email'
            type='email'
            autoComplete='email'
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm'
            />
        </div>
    </div>

    <div>
      <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
          Password
      </label>
      <div className='mt-1 relative'>
          <input
              id='password'
              name='password'
              type={showPassword ? 'text' : 'password'}
              autoComplete='current-password'
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm pr-10' 
          />
          <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className='absolute inset-y-0 right-2 flex items-center px-2 text-gray-500 hover:text-gray-700 focus:outline-none'
          >
              {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
      </div>
    </div>

    <button
        type='submit'
        className={`w-full flex justify-center py-2 px-4 border border-transparent 
          rounded-md shadow-sm text-sm font-medium text-white ${
            loading
              ? "bg-yellow-400 cursor-not-allowed"
              : "bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          }`}
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
  </form>;
  
}

export default LoginForm