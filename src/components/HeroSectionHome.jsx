import React from 'react'; // Import React
import { Link, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, AcademicCapIcon, BriefcaseIcon, ChartBarIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext'; // Add this import

export default function HeroSectionHome() {
  console.log("HeroSectionHome.jsx: Rendering"); // Add log
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Add this

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.elements.search.value;
    const targetUrl = `/internships?q=${encodeURIComponent(searchTerm)}`;
    console.log("[HeroSectionHome] Search submitted. Term:", searchTerm, "Target URL:", targetUrl);
    navigate(targetUrl);
  };

  // Add this function
  const handleEmployerClick = (e) => {
    // If user is not logged in or not a CCPD member/Admin, redirect to login with a message
    if (!currentUser || !['ccpd', 'admin'].includes(currentUser.role)) {
      e.preventDefault();
      navigate('/login', { 
        state: { 
          message: "You need to be logged in as a CCPD member or Admin to post internships.",
          redirectTo: "/post-internship" 
        } 
      });
    }
    // If they are an authorized role, the Link component will handle the navigation
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative pt-20 pb-20 md:pt-28 md:pb-32 overflow-hidden bg-gradient-radial from-brand-dark via-brand-surface to-brand-dark">
      <div className="absolute inset-0 opacity-[0.03]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="heroPattern" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="scale(2) rotate(0)"><rect x="0" y="0" width="100%" height="100%" fill="none"/><path d="M20 0L20 40M0 20L40 20" strokeWidth="0.5" stroke="currentColor" fill="none"/></pattern></defs><rect width="100%" height="100%" fill="url(#heroPattern)"/></svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-text-primary mb-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Unlock Your <span className="text-gradient-purple">Career Potential</span>.
          </h1>

          <p className="text-lg font-medium text-brand-accent mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Curated Internship Opportunities for NIT Warangal Students
          </p>

          <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="relative flex items-center">
              <MagnifyingGlassIcon className="absolute left-4 h-5 w-5 text-text-tertiary pointer-events-none" />
              <input
                type="search"
                name="search"
                placeholder="Search role, company, skill, location, or description..."
                className="input-field w-full !pl-12 !py-3.5 !bg-brand-surface/50 dark:!bg-brand-surface/50 focus:!bg-brand-surface"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <motion.button 
                  type="submit" 
                  className="btn btn-primary px-5 py-2 text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Search
                </motion.button>
              </div>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/internships"
                className="btn btn-primary w-full sm:w-auto text-base px-8 py-3"
              >
                Browse All Internships
              </Link>
            </motion.div>
            
            {/* Conditional rendering for Post an Internship button */}
            {currentUser && (currentUser.role === 'ccpd' || currentUser.role === 'admin') && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/post-internship"
                  onClick={handleEmployerClick} // Uses the updated handler
                  className="btn btn-secondary w-full sm:w-auto text-base px-8 py-3"
                  style={{ '--gradient-from': 'theme("colors.grad-blue-from")', '--gradient-to': 'theme("colors.grad-blue-to")' }}
                >
                  Post an Internship
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Why Students Trust InternHub */}
      

      {/* Featured Internships */}
      

      {/* How It Works */}
      <motion.div 
  className="container mx-auto px-4 sm:px-6 lg:px-8 mt-20"
  initial="hidden"
  animate="visible"
  variants={fadeInUp}
>
  <h2 className="text-4xl font-extrabold text-center text-text-primary mb-16 tracking-tight">
    How It Works
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
    {[
      { icon: MagnifyingGlassIcon, title: "Search internships" },
      { icon: BriefcaseIcon, title: "Apply in one click" },
      { icon: AcademicCapIcon, title: "Get matched instantly" },
      { icon: ChartBarIcon, title: "Track your application" }
    ].map((step, index) => (
      <motion.div
        key={index}
        className="bg-brand-surface/30 backdrop-blur-md shadow-lg rounded-2xl p-6 text-center transform-gpu border border-white/10"
        whileHover={{ rotateX: 8, rotateY: -8, scale: 1.03 }}
        transition={{ type: "spring", stiffness: 150, damping: 20 }}
        style={{
          perspective: 1000,
          transformStyle: 'preserve-3d',
        }}
      >
        <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-grad-purple-from to-grad-blue-to shadow-lg">
          <step.icon className="h-8 w-8 text-white z-10" />
          <div className="absolute inset-0 rounded-full bg-white opacity-10 blur-sm" />
        </div>
        <h3 className="text-xl font-semibold text-text-primary">{step.title}</h3>
      </motion.div>
    ))}
  </div>
</motion.div>

    </div>
  );
}