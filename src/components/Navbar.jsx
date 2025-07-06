import { NavLink, Link } from 'react-router-dom';
import { Bars3BottomLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { currentUser, logout } = useAuth();

  const navLinksBase = [
    { name: 'Home', path: '/' },
    { name: 'Internships', path: '/internships' },
  ];

  const navLinksAuth = [
    // Show Dashboard only if NOT ccpd or admin (i.e., for students)
    ...( !(currentUser?.role === 'ccpd' || currentUser?.role === 'admin') ?
        [{ name: 'Dashboard', path: '/dashboard' }]
      :
        []
    ),
    // Show CCPD/Admin specific links
    ...( (currentUser?.role === 'ccpd' || currentUser?.role === 'admin') ? 
        [
          { name: 'Post Internship', path: '/post-internship' },
          { name: 'Manage Internships', path: '/ccpd/manage-internships' },
          { name: 'Manage Applications', path: '/ccpd/manage-applications' },
          { name: 'Analytics', path: '/ccpd/analytics' }
        ] 
      : 
        []
    ),
  ];

  const navLinksGuest = [
    { name: 'Login', path: '/login' },
    { name: 'Sign Up', path: '/register', isButton: true },
  ];

  const navLinks = [
    ...navLinksBase,
    ...(currentUser ? navLinksAuth : []),
    ...(currentUser ? [] : navLinksGuest),
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsOpen(false);
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navbarClasses = `sticky top-0 z-50 transition-all duration-300 ease-custom-ease ${
    isScrolled
      ? 'bg-brand-surface/80 dark:bg-brand-surface/80 backdrop-blur-lg shadow-md border-b border-border-color'
      : 'bg-transparent border-b border-transparent'
  }`;

  const handleLogout = async () => {
    try {
      await logout();
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className={navbarClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center group">
              <svg
                className="h-8 w-auto text-brand-primary group-hover:opacity-80 transition"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="ml-2 text-2xl font-bold text-text-primary group-hover:opacity-80 transition">
                InternHub
              </span>
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {navLinks.map((link) =>
              link.isButton ? (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className="btn btn-primary text-sm px-5 py-2"
                >
                  {link.name}
                </NavLink>
              ) : (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `relative px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 group
                     ${
                       isActive
                         ? 'text-brand-primary'
                         : 'text-text-secondary hover:text-text-primary'
                     }
                     after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-0.5 after:w-0 after:bg-brand-primary 
                     after:transition-all after:duration-300 after:-translate-x-1/2 
                     ${isActive ? 'after:w-4/5' : 'group-hover:after:w-4/5'}`
                  }
                >
                  {link.name}
                </NavLink>
              )
            )}
            {/* Logout Button - Show if logged in */}
            {currentUser && (
              <button
                onClick={handleLogout}
                className="btn btn-secondary text-sm px-5 py-2"
                style={{
                  '--gradient-from': 'theme("colors.grad-red-from")',
                  '--gradient-to': 'theme("colors.grad-red-to")',
                }}
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <XMarkIcon className="block h-7 w-7" aria-hidden="true" />
              ) : (
                <Bars3BottomLeftIcon className="block h-7 w-7" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div
          className="md:hidden absolute top-full left-0 right-0 bg-brand-surface shadow-xl border-t border-border-color animate-slide-down"
          id="mobile-menu"
        >
          <div className="px-4 pt-4 pb-5 space-y-3">
            {navLinks.map((link) =>
              link.isButton ? (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center btn btn-primary py-3"
                >
                  {link.name}
                </NavLink>
              ) : (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-3 rounded-md text-base font-medium transition-colors duration-150
                     ${
                       isActive
                         ? 'text-brand-primary bg-brand-dark'
                         : 'text-text-secondary hover:text-text-primary hover:bg-brand-dark'
                     }`
                  }
                >
                  {link.name}
                </NavLink>
              )
            )}
            {/* Mobile Logout Button */}
            {currentUser && (
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="block w-full text-center btn btn-secondary mt-3 py-3"
                style={{
                  '--gradient-from': 'theme("colors.grad-red-from")',
                  '--gradient-to': 'theme("colors.grad-red-to")',
                }}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}