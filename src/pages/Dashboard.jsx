import React, { useState, useEffect } from 'react';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../api/axiosInstance'; 
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import InternshipCard from '../components/InternshipCard'; // For recommendations

import {
  BriefcaseIcon, CalendarIcon, PencilIcon, TrashIcon, PlusIcon, UserCircleIcon, DocumentTextIcon, LightBulbIcon, AcademicCapIcon, ChevronRightIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { currentUser } = useAuth();

  // States for localStorage based features (can be refactored or kept)
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [deadlines, setDeadlines] = useState([]);
  const [newDeadline, setNewDeadline] = useState({ title: '', date: '', description: '' });

  // States for My Applications
  const [myApplications, setMyApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [applicationsError, setApplicationsError] = useState(null);

  // States for Recommended Internships
  const [recommendedInternships, setRecommendedInternships] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [recommendationsError, setRecommendationsError] = useState(null);

  // Load localStorage data and fetch API data
  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem('notes')) || [];
    const savedDeadlines = JSON.parse(localStorage.getItem('deadlines')) || [];
    setNotes(savedNotes);
    setDeadlines(savedDeadlines);

    // Fetch My Applications
    const fetchMyApplications = async () => {
      if (!currentUser) {
        setApplicationsLoading(false); // Stop loading if no user
        return;
      }
      setApplicationsLoading(true);
      setApplicationsError(null); // Reset error before new fetch
      try {
        const response = await axiosInstance.get('/applications/my');
        setMyApplications(response.data);
      } catch (err) {
        setApplicationsError(err.response?.data?.message || err.message || 'Failed to load applications.');
      } finally {
        setApplicationsLoading(false);
      }
    };

    // Fetch Recommended Internships
    const fetchRecommendedInternships = async () => {
      if (!currentUser || !currentUser.branch) {
        setRecommendationsLoading(false);
        setRecommendationsError(null); // Clear error if no branch for recommendations
        setRecommendedInternships([]); // Clear previous recommendations
        return;
      }
      setRecommendationsLoading(true);
      setRecommendationsError(null); // Reset error
      try {
        // TODO: Add logic to exclude already applied internships if myApplications is available
        const response = await axiosInstance.get(`/internships?branch=${currentUser.branch}&limit=3`);
        setRecommendedInternships(response.data.internships || []);
      } catch (err) {
        setRecommendationsError(err.response?.data?.message || err.message || 'Failed to load recommendations.');
      } finally {
        setRecommendationsLoading(false);
      }
    };
    
    fetchMyApplications();
    fetchRecommendedInternships();

  }, [currentUser]);

  // Save notes to localStorage
  const handleAddNote = () => {
    if (newNote.trim()) {
      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes);
      setNewNote('');
      localStorage.setItem('notes', JSON.stringify(updatedNotes));
    }
  };

  const handleDeleteNote = (index) => {
    const updatedNotes = notes.filter((_, i) => i !== index);
    setNotes(updatedNotes);
    localStorage.setItem('notes', JSON.stringify(updatedNotes));
  };

  // Add deadline
  const handleAddDeadline = () => {
    if (newDeadline.title && newDeadline.date) {
      const updatedDeadlines = [...deadlines, newDeadline];
      setDeadlines(updatedDeadlines);
      setNewDeadline({ title: '', date: '', description: '' });
      localStorage.setItem('deadlines', JSON.stringify(updatedDeadlines));
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  };
  
  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        return new Date(isoString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch (error) {
        return 'Invalid Date';
    }
  };

  if (!currentUser) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] bg-brand-dark">
            <LoadingSpinner message="Loading dashboard..." />
            <p className="mt-4 text-text-secondary">Please <Link to="/login" className="text-brand-primary hover:underline">login</Link> to view your dashboard.</p>
        </div>
    );
  }

  // Define card base classes for consistency
  const cardBaseClass = "bg-brand-surface/80 backdrop-blur-md p-6 rounded-xl shadow-xl border border-border-color";

  return (
    <div className="min-h-screen bg-brand-dark text-text-primary py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-10 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-text-primary">
            Welcome back, <span className="text-brand-gradient bg-clip-text text-transparent">{currentUser.name || 'InternHunter'}</span>!
          </h1>
          <p className="mt-3 text-lg text-text-secondary max-w-2xl">
            Here's an overview of your internship journey. Stay organized and ahead in your CCPD prep!
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Profile Overview Card */}
          <motion.div variants={itemVariants} className={`${cardBaseClass} lg:col-span-1`}>
            <div className="flex items-center mb-5">
              {currentUser.profilePic ? (
                <img 
                  src={`http://localhost:5000${currentUser.profilePic}`}
                  alt="Profile" 
                  className="h-12 w-12 rounded-full mr-4 object-cover border-2 border-brand-accent"
                  onError={(e) => { 
                    e.target.onerror = null; // prevent infinite loop
                    e.target.style.display = 'none'; // hide broken image
                    // Optionally, show a fallback icon here if needed by manipulating state or adding another element
                  }}
                />
              ) : (
                <UserCircleIcon className="h-12 w-12 text-brand-accent mr-4" />
              )}
              <h2 className="text-2xl font-semibold text-text-primary">Profile Snapshot</h2>
            </div>
            <div className="space-y-3 text-text-secondary">
              <div className="flex items-center">
                <UserCircleIcon className="h-5 w-5 mr-3 " />
                <span>{currentUser.name}</span>
              </div>
              <div className="flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-3 " />
                <span>{currentUser.email}</span>
              </div>
              {currentUser.branch && (
                <div className="flex items-center">
                  <AcademicCapIcon className="h-5 w-5 mr-3 " />
                  <span>Branch: {currentUser.branch}</span>
                </div>
              )}
            </div>
            <Link 
              to="/profile/edit" // Placeholder for actual edit profile page route
              className="mt-6 inline-flex items-center text-sm font-medium text-brand-accent hover:text-brand-primary transition-colors duration-200 group"
            >
              Edit Profile <ChevronRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* My Applications Card */}
          <motion.div variants={itemVariants} className={`${cardBaseClass} lg:col-span-2`}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center">
                <BriefcaseIcon className="h-10 w-10 text-brand-accent mr-4" />
                <h2 className="text-2xl font-semibold text-text-primary">My Applications</h2>
              </div>
              <Link to="/internships" className="text-sm text-brand-accent hover:underline">Apply to More</Link>
            </div>
            {applicationsLoading ? (
              <div className="flex justify-center items-center h-32">
                <LoadingSpinner message="Loading your applications..." />
              </div>
            ) : applicationsError ? (
              <ErrorMessage title="Could not load applications" message={applicationsError} />
            ) : myApplications.length === 0 ? (
              <p className="text-text-secondary text-center py-8">You haven't applied to any internships yet. <Link to="/internships" className="text-brand-primary hover:underline">Find some now!</Link></p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                {myApplications.map(app => (
                  <motion.div 
                    key={app._id} 
                    className="p-4 bg-brand-dark/70 rounded-lg shadow-md hover:bg-brand-dark transition-colors duration-200 flex justify-between items-center"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div>
                      <Link to={`/internships/${app.internship._id}`} className="text-lg font-semibold text-brand-primary hover:underline">
                        {app.internship.title}
                      </Link>
                      <p className="text-sm text-text-secondary">{app.internship.companyName}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-text-tertiary mb-1">Applied: {formatDate(app.appliedAt || app.createdAt)}</p>
                        {app.status && (
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full 
                            ${app.status === 'Applied' ? 'bg-blue-200 text-blue-800 dark:bg-blue-700/30 dark:text-blue-300' :
                              app.status === 'Under Review' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-700/30 dark:text-yellow-300' :
                              app.status === 'Shortlisted' ? 'bg-purple-200 text-purple-800 dark:bg-purple-700/30 dark:text-purple-300' :
                              app.status === 'Interviewing' ? 'bg-indigo-200 text-indigo-800 dark:bg-indigo-700/30 dark:text-indigo-300' :
                              app.status === 'Offered' ? 'bg-green-200 text-green-800 dark:bg-green-700/30 dark:text-green-300' :
                              app.status === 'Not Selected' ? 'bg-red-200 text-red-800 dark:bg-red-700/30 dark:text-red-300' :
                              app.status === 'Withdrawn' ? 'bg-gray-200 text-gray-800 dark:bg-gray-600/30 dark:text-gray-400' :
                              'bg-gray-300 text-gray-700 dark:bg-gray-500/30 dark:text-gray-300' // Default/fallback
                            }`}>
                            {app.status}
                          </span>
                        )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recommended Internships Card */}
          <motion.div variants={itemVariants} className={`${cardBaseClass} lg:col-span-3`}>
            <div className="flex items-center mb-5">
              <LightBulbIcon className="h-10 w-10 text-brand-accent mr-4" />
              <h2 className="text-2xl font-semibold text-text-primary">Recommended For You</h2>
            </div>
            {recommendationsLoading ? (
              <div className="flex justify-center items-center h-32">
                <LoadingSpinner message="Finding best matches..." />
              </div>
            ) : recommendationsError ? (
              <ErrorMessage title="Could not load recommendations" message={recommendationsError} />
            ) : recommendedInternships.length === 0 ? (
              <p className="text-text-secondary text-center py-8">
                {currentUser.branch 
                  ? `No specific recommendations for ${currentUser.branch} right now. Check the main internships page!` 
                  : "Update your profile with your branch to get personalized recommendations."}
                <Link to="/internships" className="ml-2 text-brand-primary hover:underline">Browse All Internships</Link>
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendedInternships.map(internship => (
                  <InternshipCard key={internship._id} internship={internship} />
                ))}
              </div>
            )}
          </motion.div>
          
          {/* Notes Section */}
          <motion.section variants={itemVariants} className={`${cardBaseClass} lg:col-span-1`}>
            <div className="flex items-center mb-5">
                <PencilIcon className="h-8 w-8 text-brand-accent mr-3" />
                <h2 className="text-xl font-semibold text-text-primary">My Prep Notes</h2>
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-2">
                {notes.map((note, index) => (
                <motion.div 
                    key={index} 
                    className="p-3 bg-brand-dark/70 rounded-lg shadow-sm flex justify-between items-start hover:bg-brand-dark transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="text-sm text-text-secondary prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown>{String(note)}</ReactMarkdown>
                    </div>
                    <button
                    onClick={() => handleDeleteNote(index)}
                    className="text-text-tertiary hover:text-brand-secondary transition-colors duration-200 ml-2 flex-shrink-0"
                    title="Delete note"
                    >
                    <TrashIcon className="h-4 w-4" />
                    </button>
                </motion.div>
                ))}
                {notes.length === 0 && <p className="text-text-secondary text-sm">No notes added yet.</p>}
            </div>
            <div className="mt-4 flex items-center space-x-2">
                <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Quick note for CCPD prep..."
                rows={2}
                className="input-field w-full text-sm bg-brand-dark text-text-primary placeholder-text-secondary border-border-color focus:ring-brand-primary focus:border-brand-primary"
                />
                <motion.button
                onClick={handleAddNote}
                className="btn btn-secondary p-2.5 self-end"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Add Note"
                >
                <PlusIcon className="h-5 w-5" />
                </motion.button>
            </div>
          </motion.section>

          {/* Deadline Reminders */}
          <motion.section variants={itemVariants} className={`${cardBaseClass} lg:col-span-2`}>
            <div className="flex items-center mb-5">
                <CalendarIcon className="h-8 w-8 text-brand-accent mr-3" />
                <h2 className="text-xl font-semibold text-text-primary">Track Deadlines</h2>
            </div>
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar pr-2 mb-6">
                {deadlines.length > 0 ? (
                    <VerticalTimeline layout="1-column-left" lineColor="var(--color-border-color)"> {/* Using CSS variable for lineColor */}
                    {deadlines.map((deadline, index) => (
                        <VerticalTimelineElement
                        key={index}
                        date={deadline.date ? formatDate(new Date(deadline.date).toISOString()) : 'No Date'}
                        dateClassName="!text-text-tertiary !text-sm"
                        iconStyle={{ background: 'var(--color-brand-accent)', color: '#fff' }} // Using CSS variable
                        icon={<CalendarIcon />}                       
                        contentStyle={{ background: 'rgba(var(--rgb-brand-dark), 0.7)', color: 'var(--color-text-primary)', boxShadow: 'none', border: '1px solid rgba(var(--rgb-border-color), 0.7)', padding: '1rem'}} // Using CSS variables
                        contentArrowStyle={{ borderRight: '7px solid rgba(var(--rgb-brand-dark), 0.7)' }} // Using CSS variables
                        className="vertical-timeline-element--custom"
                        >
                        <h3 className="!text-md !font-semibold !text-brand-primary">{deadline.title}</h3>
                        {deadline.description && <p className="!text-sm !text-text-secondary !font-normal">{deadline.description}</p>}
                        </VerticalTimelineElement>
                    ))}
                    </VerticalTimeline>
                ) : (
                    <p className="text-text-secondary text-sm text-center py-4">No custom deadlines added yet.</p>
                )}
            </div>
            
            <motion.div className="mt-1 p-1 bg-brand-dark/50 rounded-lg">
                <h3 className="text-md font-semibold text-text-primary mb-3 px-2 pt-2">Add Custom Deadline</h3>
                <div className="space-y-2 p-2">
                <input
                    type="text"
                    placeholder="Title (e.g., Resume Submission)"
                    value={newDeadline.title}
                    onChange={(e) => setNewDeadline({...newDeadline, title: e.target.value})}
                    className="input-field w-full text-sm bg-brand-dark text-text-primary placeholder-text-secondary border-border-color focus:ring-brand-primary focus:border-brand-primary"
                />
                <input
                    type="date"
                    value={newDeadline.date}
                    onChange={(e) => setNewDeadline({...newDeadline, date: e.target.value})}
                    className="input-field w-full text-sm bg-brand-dark text-text-primary placeholder-text-secondary border-border-color focus:ring-brand-primary focus:border-brand-primary"
                />
                <textarea
                    placeholder="Brief description (optional)"
                    value={newDeadline.description}
                    onChange={(e) => setNewDeadline({...newDeadline, description: e.target.value})}
                    rows={2}
                    className="input-field w-full text-sm bg-brand-dark text-text-primary placeholder-text-secondary border-border-color focus:ring-brand-primary focus:border-brand-primary"
                />
                <motion.button
                    onClick={handleAddDeadline}
                    className="btn btn-secondary py-2.5 w-full text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    Add Deadline Reminder
                </motion.button>
                </div>
            </motion.div>
          </motion.section>

        </motion.div>
      </motion.div>
      <style>{`
        /* Define CSS variables from Tailwind for use in JS/inline styles if needed */
        :root {
          --color-brand-dark: #0F0F0F; /* Using explicit hex for brand-dark */
          --rgb-brand-dark: 15 15 15; /* RGB for #0F0F0F */
          --color-brand-surface: #1F2937; /* Explicit hex for brand-surface (e.g., slate-700/gray-800) */
          --rgb-brand-surface: 31 41 55; /* RGB for #1F2937 */
          --color-brand-primary: #8A4FFF;
          --color-brand-accent: #4FEFFF;
          --color-text-primary: #F5F5F7;
          --color-text-secondary: #A0AEC0;
          --color-text-tertiary: #718096;
          --color-border-color: #3A3A3A;
          --rgb-border-color: 58 58 58; /* RGB for #3A3A3A */
        }
        body.dark :root { /* If you use a dark class on body */
            /* Potentially different values for dark mode if needed */
        }

        .text-brand-gradient {
          background-image: linear-gradient(to right, var(--color-brand-primary), var(--color-brand-accent));
        }

        .vertical-timeline-element-content .vertical-timeline-element-date {
          font-size: 0.8rem !important;
          opacity: 0.8 !important;
        }
        .vertical-timeline-element--custom .vertical-timeline-element-icon {
            width: 40px !important;
            height: 40px !important;
            box-shadow: 0 0 0 3px var(--color-brand-primary), inset 0 2px 0 rgba(0,0,0,.08),0 3px 0 4px rgba(0,0,0,.05) !important;
        }
        .vertical-timeline--animate .vertical-timeline-element-icon.is-hidden {
            transform: scale(0.8) !important;
        }
        .vertical-timeline--animate .vertical-timeline-element-content.is-hidden {
            transform: translateX(-10px) !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(var(--rgb-border-color), 0.3); /* Use border-color with opacity */
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: var(--color-brand-accent);
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: var(--color-brand-primary); 
        }
        .input-field {
            /* Base styles, ensure these are applied or defined in global.css if needed */
        }
      `}</style>
    </div>
  );
}