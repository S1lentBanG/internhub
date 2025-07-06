import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { 
  BriefcaseIcon, CalendarDaysIcon, MapPinIcon, BuildingOffice2Icon, 
  CurrencyDollarIcon, AcademicCapIcon, LightBulbIcon, CheckCircleIcon,
  ArrowLeftIcon, InformationCircleIcon, ClockIcon, UserGroupIcon, TagIcon,
  ExclamationTriangleIcon // For error messages
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

// Helper to format date (can be moved to a utils file later)
const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    return new Date(isoString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid Date';
  }
};

export default function InternshipDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Get currentUser
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for application status
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [applicationError, setApplicationError] = useState(null);
  const [applicationSuccess, setApplicationSuccess] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchDetailsAndApplicationStatus = async () => {
      setLoading(true);
      setError(null);
      setHasApplied(false); // Reset before fetching
      setApplicationError(null);
      setApplicationSuccess(null);

      try {
        const internshipResponse = await axiosInstance.get(`/internships/${id}`);
        if (isMounted) {
          setInternship(internshipResponse.data);

          // If user is a student, check if they have applied
          if (currentUser && currentUser.role === 'student') {
            try {
              const applicationsResponse = await axiosInstance.get('/applications/my');
              if (isMounted && applicationsResponse.data) {
                const alreadyApplied = applicationsResponse.data.some(
                  (app) => app.internship?._id === id || app.internship === id
                );
                setHasApplied(alreadyApplied);
              }
            } catch (appErr) {
              console.error("Failed to fetch user applications:", appErr);
              // Not critical for page load, but good to note
              // setApplicationError('Could not verify application status.'); 
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
            err.message ||
            'Failed to load internship details. Please try again later.'
          );
          if (err.response?.status === 404) {
            // navigate('/404', { replace: true }); 
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchDetailsAndApplicationStatus();
    }

    return () => {
      isMounted = false;
    };
  }, [id, navigate, currentUser]); // Added currentUser dependency

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner message="Loading internship details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage title="Error" message={error} />
        <button onClick={() => navigate(-1)} className="mt-4 btn btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <InformationCircleIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Internship Not Found</h1>
        <p className="text-gray-600 mb-6">The internship you are looking for does not exist or may have been removed.</p>
        <Link to="/internships" className="btn btn-primary">
          Explore Other Internships
        </Link>
      </div>
    );
  }

  // Deadline logic
  const deadlineDate = internship.deadline ? new Date(internship.deadline) : null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const hasDeadlinePassed = deadlineDate ? deadlineDate < today : false;

  const handleApplyNow = async () => {
    setApplicationError(null);
    setApplicationSuccess(null);

    if (!currentUser) {
      setApplicationError('You must be logged in to apply. Please log in and try again.');
      // navigate('/login', { state: { from: `/internships/${id}` } }); // Optional: redirect to login
      return;
    }

    if (currentUser.role !== 'student') {
      setApplicationError('Only students can apply for internships.');
      return;
    }

    if (hasDeadlinePassed) {
      setApplicationError("Application deadline has passed. Cannot apply.");
      return;
    }

    if (hasApplied) {
      setApplicationError("You have already applied for this internship.");
      return;
    }

    setApplicationLoading(true);
    try {
      const response = await axiosInstance.post('/applications', { internshipId: id });
      if (response.status === 201 && response.data) {
        setHasApplied(true);
        setApplicationSuccess('Successfully applied for the internship!');
      } else {
        setApplicationError('Failed to apply. Server returned an unexpected response.');
      }
    } catch (err) {
      setApplicationError(err.response?.data?.message || err.message || 'Failed to submit application.');
    }
    setApplicationLoading(false);
  };
  
  // Fallback for missing fields to prevent rendering errors
  const safeInternship = {
    title: 'N/A',
    companyName: 'N/A Company',
    location: 'N/A',
    salary: 'Not Disclosed',
    description: 'No description provided.',
    domain: [],
    skills: [],
    branch: [],
    type: 'N/A',
    internshipPeriod: 'N/A',
    cgpaCutoff: null,
    responsibilities: '',
    aboutCompany: '',
    ...internship // Spread actual internship data, overwriting defaults
  };
  
  // Simplified displaySalary logic
  const displaySalary = (safeInternship.salary && safeInternship.salary.trim() !== '' && safeInternship.salary !== 'Not Disclosed')
                        ? safeInternship.salary 
                        : 'Not Disclosed';


  return (
    <div className="animate-fade-in-up container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-brand-primary hover:text-brand-accent transition-colors duration-200 font-medium"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Internships
        </button>
      </div>

      <div className="bg-gradient-to-br from-brand-surface via-brand-surface/90 to-brand-surface/80 dark:from-brand-dark dark:via-brand-dark/90 dark:to-brand-dark/80 p-6 sm:p-8 rounded-xl shadow-2xl backdrop-blur-lg border border-white/10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 pb-6 border-b border-brand-border">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-text-main dark:text-white mb-2">
              {safeInternship.title}
            </h1>
            <div className="flex items-center text-lg text-brand-accent font-semibold">
              <BuildingOffice2Icon className="h-5 w-5 mr-2 opacity-80" />
              {safeInternship.companyName}
            </div>
            <div className="mt-2 flex items-center text-sm text-text-secondary">
              <MapPinIcon className="h-4 w-4 mr-1.5 opacity-70" />
              {safeInternship.location}
            </div>
          </div>
          <div className="flex-shrink-0 text-left md:text-right">
            <div className={`text-sm font-semibold px-3 py-1.5 rounded-full inline-block mb-2 ${
                hasDeadlinePassed 
                ? 'bg-red-200 text-red-700 dark:bg-red-700/30 dark:text-red-300' 
                : 'bg-green-200 text-green-700 dark:bg-green-700/30 dark:text-green-300'
              }`}
            >
              {hasDeadlinePassed ? 'Deadline Passed' : 'Accepting Applications'}
            </div>
            <p className="text-sm text-text-tertiary">
              Apply by: {deadlineDate ? formatDate(internship.deadline) : 'N/A'}
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-text-main dark:text-white mb-3">Internship Description</h2>
              <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                {safeInternship.description}
              </p>
            </div>

            {/* Responsibilities (if any) */}
            {safeInternship.responsibilities && (
              <div>
                <h2 className="text-xl font-semibold text-text-main dark:text-white mb-3">Responsibilities</h2>
                <ul className="list-disc list-inside text-text-secondary space-y-1.5 pl-2 leading-relaxed">
                  {safeInternship.responsibilities.split('\n').map((item, index) => item.trim() && <li key={index}>{item.trim()}</li>)}
                </ul>
              </div>
            )}
            
            {/* About Company (if any) */}
             {safeInternship.aboutCompany && (
              <div>
                <h2 className="text-xl font-semibold text-text-main dark:text-white mb-3">About {safeInternship.companyName}</h2>
                <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                  {safeInternship.aboutCompany}
                </p>
              </div>
            )}


            {/* Skills & Domains */}
            <div>
              <h2 className="text-xl font-semibold text-text-main dark:text-white mb-3">Skills & Domains</h2>
              <div className="flex flex-wrap gap-2">
                {safeInternship.skills?.map((skill, index) => (
                  <span key={`skill-${index}`} className="bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200 px-3 py-1 text-xs font-medium rounded-full">
                    {skill}
                  </span>
                ))}
                {safeInternship.domain?.map((dom, index) => (
                  <span key={`domain-${index}`} className="bg-purple-100 text-purple-800 dark:bg-purple-900/70 dark:text-purple-200 px-3 py-1 text-xs font-medium rounded-full">
                    {dom}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Key Info & Apply Button */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 bg-brand-surface dark:bg-brand-dark rounded-lg shadow-lg border border-brand-border">
              <h2 className="text-lg font-semibold text-text-main dark:text-white mb-4">Internship Overview</h2>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center">
                  <CalendarDaysIcon className="h-5 w-5 mr-2.5 text-brand-accent opacity-80" />
                  <div>
                    <span className="font-medium text-text-secondary dark:text-text-secondary">Deadline:</span>
                    <span className="ml-1 text-text-main dark:text-white">{deadlineDate ? formatDate(internship.deadline) : 'N/A'}</span>
                  </div>
                </li>
                 <li className="flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 mr-2.5 text-brand-accent opacity-80" />
                   <div>
                    <span className="font-medium text-text-secondary dark:text-text-secondary">Salary/Stipend:</span>
                    <span className="ml-1 text-text-main dark:text-white">{displaySalary}</span>
                  </div>
                </li>
                {safeInternship.cgpaCutoff && (
                  <li className="flex items-center">
                    <AcademicCapIcon className="h-5 w-5 mr-2.5 text-brand-accent opacity-80" />
                    <div>
                      <span className="font-medium text-text-secondary dark:text-text-secondary">CGPA Cutoff:</span>
                      <span className="ml-1 text-text-main dark:text-white">{safeInternship.cgpaCutoff}+</span>
                    </div>
                  </li>
                )}
                <li className="flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2.5 text-brand-accent opacity-80" />
                   <div>
                    <span className="font-medium text-text-secondary dark:text-text-secondary">Type:</span>
                    <span className="ml-1 text-text-main dark:text-white">{safeInternship.type}</span>
                  </div>
                </li>
                <li className="flex items-center">
                  <UserGroupIcon className="h-5 w-5 mr-2.5 text-brand-accent opacity-80" />
                  <div>
                    <span className="font-medium text-text-secondary dark:text-text-secondary">Open For Branches:</span>
                    <span className="ml-1 text-text-main dark:text-white">
                      {safeInternship.branch && safeInternship.branch.length > 0 ? safeInternship.branch.join(', ') : 'All Branches'}
                    </span>
                  </div>
                </li>
              </ul>
              
              {/* Application Messages */}
              {applicationSuccess && (
                <div className="mt-4 p-3 text-sm text-green-700 bg-green-100 border border-green-400 rounded-md flex items-center">
                  <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" />
                  {applicationSuccess}
                </div>
              )}
              {applicationError && (
                <div className="mt-4 p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded-md flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-600" />
                   {applicationError}
                </div>
              )}

              {currentUser && currentUser.role === 'student' && (
                <button
                  onClick={handleApplyNow}
                  disabled={hasDeadlinePassed || hasApplied || applicationLoading}
                  className={`w-full mt-6 btn btn-lg transition-all duration-200 ease-in-out 
                    ${hasDeadlinePassed ? 'btn-disabled-error' : 
                      hasApplied ? 'btn-success-outline' : 'btn-primary'}
                    ${applicationLoading ? 'opacity-75 cursor-not-allowed' : ''}
                  `}
                >
                  {applicationLoading ? (
                    <span className="flex items-center justify-center">
                      <LoadingSpinner size="sm" className="mr-2" /> Submitting...
                    </span>
                  ) : hasApplied ? (
                    'Applied Successfully'
                  ) : hasDeadlinePassed ? (
                    'Deadline Passed'
                  ) : (
                    'Apply Now'
                  )}
                </button>
              )}
              {(!currentUser || currentUser.role !== 'student') && !hasDeadlinePassed && (
                 <p className="mt-6 text-sm text-center text-text-secondary">
                    Please <Link to="/login" state={{ from: location.pathname }} className="font-medium text-brand-primary hover:underline">log in as a student</Link> to apply.
                 </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 