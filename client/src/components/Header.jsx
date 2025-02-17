import React, { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore.js'
import { Link } from 'react-router-dom';
import { Flame, User, LogOut, Menu } from 'lucide-react';

const Header = () => {
    const {authUser, logout} = useAuthStore();
    const [dropDownOpen, setDropDownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setDropDownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

  return (
    <header className='bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 shadow-lg'>
        <div className='max-w-7x1 mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between items-center py-4'>
                <div className='flex items-center'>
                    <Link to="/" className='flex items-center space-x-2'>
                        <Flame className='w-8 h-8 text-white'/>
                        <span className='text-2xl font-bold text-white hidden sm:inline'>DePal</span>
                    </Link>
                </div>

                <div className='hidden md:flex items-center space-x-4'>
                    {authUser ? (
                        <div className='relative' ref={dropdownRef}>
                            <button 
                            onClick={() => setDropDownOpen(!dropDownOpen)}
                            className='flex items-center space-x-2 focus:outline-none'
                            >
                                <img 
                                src={authUser.image || "/avatar.png"}
                                className='h-10 w-10 object-cover rounded-full border-2 border-white'
                                alt='User image'
                                />
                                <span className='text-white font-medium'>
                                    {authUser.name}
                                </span>
                            </button>

                            {dropDownOpen && (
                                <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10'>
                                    <Link 
                                    to='/profile'
                                    className='px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center'
                                    onClick={() => setDropDownOpen(false)}
                                    >
                                        <User className='mr-2' size={16} />
                                        Profile
                                    </Link>
                                    <button
                                    onClick={logout}
                                    className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center'
                                    >
                                        <LogOut className='mr-2' size={16} />
                                        Logout                                       
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link 
                                to='/auth'
                                className='text-white hover:text-yellow-200 transition duration-150 ease-in-out'
                            >
                                Login
                            </Link>
                            <Link
                                to='/auth'
                                className='bg-white text-yellow-600 px-4 py-2 rounded-full font-medium hover:bg-yellow-100 transtision duration-150 ease-in-out'
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>

                <div className='md:hidden'>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className='text-white focus:outline-none'
                    >
                        <Menu className='size-6' />
                    </button>
                </div>
            </div>
        </div>

        {mobileMenuOpen && (
            <div className='md:hidden bg-yellow-600'>
                <div className='px-2 pt-2 pb-3 space-y-1 sm:px-3'>
                    {authUser ? (
                        <>
                            <Link
                                to='/profile'
                                className='block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-yellow-700'
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Profile
                            </Link>
                            <button
                                onClick={() => {
                                    logout();
                                    setMobileMenuOpen(false);
                                }}
                                className='block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-yellow-700'
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to='/auth'
                                className='block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-yellow-700'
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Login
                            </Link>
                            <Link
                                to='/auth'
                                className='block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-yellow-700'
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        )}
    </header>
  )
}

export default Header