// src/components/Layout.jsx

import { Outlet } from 'react-router-dom';
import Navbar from './Navbar'; // Assuming Navbar.jsx is in the same directory
export default function Layout() {
  return (
    // Base styles applied via body tag in index.css
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Outlet renders the matched route's component */}
        <Outlet />
      </main>
      {/* Optional Footer - Can be added later if needed */}
      {/* <footer className="bg-brand-surface text-text-secondary py-6 text-center text-sm">
        © {new Date().getFullYear()} InternHub
      </footer> */}
    </div>
  );
}
