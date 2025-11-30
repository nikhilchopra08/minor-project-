'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/authSlice';

import Link from 'next/link';

const HeaderWrapper: React.FC = () => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Routes where header should be hidden
  const hideHeaderRoutes = ['/login', '/register', '/'];
  const shouldShowHeader = !hideHeaderRoutes.includes(pathname);

  if (!shouldShowHeader) {
    return null;
  }

    const handleLogout = () => {
      dispatch(logout());
      window.location.href = '/login';
    };

  // Get role badge based on user role
  const getRoleBadge = (role: string) => {
    const roleConfig = {
      customer: { color: 'bg-green-500', text: 'Customer' },
      dealer: { color: 'bg-emerald-500', text: 'Dealer' },
      admin: { color: 'bg-purple-500', text: 'Admin' }
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || { color: 'bg-gray-500', text: 'User' };
    
    return (
      <span className={`${config.color} text-white px-2 py-1 rounded-full text-xs font-medium ml-2`}>
        {config.text}
      </span>
    );
  };

  // Navigation items based on user role
  console.log(user?.role)
  const getNavItems = () => {
    if (user?.role === 'USER') {
      return [
        { href: '/services', label: 'Services' },
        { href: '/packages', label: 'Packages' },
        { href: '/progress', label: 'Progress' },
        { href: '/dashboard/user', label : "Monitor"}
      ];
    } else if (user?.role === 'DEALER') {
      return [
        { href: '/dealer/packages', label: 'Packages' },
        { href: '/dealer/service', label: 'Services' },
        { href: '/dealer-availability', label: 'Availabilty' },
      ];
    } else {
      // Default navigation for non-logged in users
      return [
        { href: '/dealers', label: 'Find Dealers' },
        { href: '/how-it-works', label: 'How It Works' },
        { href: '/about', label: 'About' }
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-[#708E62] border-b border-emerald-700">
      <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex justify-between h-24">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#708E62]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-3xl font-bold text-white">Greenify</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className="text-white hover:text-emerald-100 px-5 py-3 rounded-lg text-lg font-semibold transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 text-white hover:text-emerald-100 px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                    <span className="font-semibold">
                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left">
                    {/* <div className="font-semibold">{user.fullName || 'User'}</div> */}
                    {/* <div className="text-sm text-emerald-100">{getRoleBadge(user.role)}</div> */}
                  </div>
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-green-50 rounded-lg shadow-lg border border-emerald-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-emerald-100">
                      <p className="text-sm text-gray-600">Signed in as</p>
                      <p className="font-semibold text-gray-800">{user.email}</p>
                    </div>
                    <Link 
                      href={user.role === 'customer' ? '/profile' : '/dashboard'} 
                      className="block px-4 py-2 text-gray-700 hover:bg-emerald-50 transition-colors duration-200"
                    >
                      Profile
                    </Link>
                    {/* <Link 
                      href={user.role === 'customer' ? '/dashboard' : '/dealer/dashboard'} 
                      className="block px-4 py-2 text-gray-700 hover:bg-emerald-50 transition-colors duration-200"
                    >
                      Dashboard
                    </Link> */}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-emerald-50 transition-colors duration-200">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-white hover:text-emerald-100 px-5 py-3 rounded-lg text-lg font-semibold transition-colors duration-200">
                  Login
                </Link>
                <Link href="/get-started" className="bg-green-50 hover:bg-emerald-50 text-[#708E62] px-8 py-4 rounded-lg text-lg font-bold transition-colors duration-200 shadow-md hover:shadow-lg">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-4 rounded-lg text-white hover:text-emerald-100 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <svg className={`${isMenuOpen ? 'hidden' : 'block'} h-8 w-8`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg className={`${isMenuOpen ? 'block' : 'hidden'} h-8 w-8`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-[#708E62] border-t border-emerald-700`}>
        <div className="px-4 pt-4 pb-6 space-y-3">
          {navItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className="text-white hover:text-emerald-100 block px-5 py-4 rounded-lg text-xl font-semibold transition-colors duration-200" 
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          
          <div className="border-t border-emerald-700 pt-6">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 px-5 py-3">
                  <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-white">
                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">{user.name || 'User'}</div>
                    <div className="text-emerald-100">{getRoleBadge(user.role)}</div>
                  </div>
                </div>
                <Link 
                  href={user.role === 'customer' ? '/profile' : '/dashboard'} 
                  className="text-white hover:text-emerald-100 block px-5 py-3 rounded-lg text-lg font-semibold transition-colors duration-200" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                {/* <Link 
                  href={user.role === 'customer' ? '/dashboard' : '/dealer/dashboard'} 
                  className="text-white hover:text-emerald-100 block px-5 py-3 rounded-lg text-lg font-semibold transition-colors duration-200" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link> */}
                <button className="text-white hover:text-emerald-100 block px-5 py-3 rounded-lg text-lg font-semibold transition-colors duration-200 w-full text-left" onClick={() => setIsMenuOpen(false)}>
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-white hover:text-emerald-100 block px-5 py-4 rounded-lg text-xl font-semibold transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>
                  Login
                </Link>
                <Link href="/get-started" className="bg-green-50 hover:bg-emerald-50 text-[#708E62] block px-5 py-4 rounded-lg text-xl font-bold transition-colors duration-200 mx-3 mt-2 text-center shadow-md hover:shadow-lg" onClick={() => setIsMenuOpen(false)}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default HeaderWrapper;