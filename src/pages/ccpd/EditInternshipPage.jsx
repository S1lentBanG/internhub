import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BuildingOffice2Icon, XMarkIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import axiosInstance from '../../api/axiosInstance';

const BRANCHES = [
  'CSE',
  'ECE',
  'EEE',
  'Mathematics & Computing',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology',
];

const INITIAL_FORM_STATE = {
  title: '',
  companyName: '',
  description: '',
  location: '',
  type: 'full-time',
  salary: '',
  cgpaCutoff: '',
  deadline: '',
  domain: '',
  skills: '',
  branch: [],
  internshipPeriod: '',
  companyLogoUrl: '',
  responsibilities: '',
  aboutCompany: '',
};

export default function EditInternshipPage() {
  const { id: internshipId } = useParams();
  console.log("[EditInternshipPage] Loaded. Internship ID from useParams:", internshipId);

  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const branchDropdownRef = useRef(null);

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [loading, setLoading] = useState(false); // For form submission
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (currentUser && !['ccpd', 'admin'].includes(currentUser.role)) {
      console.warn("[EditInternshipPage] User not authorized. Redirecting.");
      navigate('/');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const fetchInternshipData = async () => {
      setInitialLoading(true);
      setError('');
      console.log("[EditInternshipPage] useEffect for fetch. Attempting to fetch data for ID:", internshipId);
      try {
        const response = await axiosInstance.get(`/internships/${internshipId}`);
        const data = response.data;
        console.log("[EditInternshipPage] Successfully fetched data:", data);

        const newFormData = {
          title: data.title || '',
          companyName: data.companyName || '',
          companyLogoUrl: data.companyLogoUrl || '',
          description: data.description || '',
          location: data.location || '',
          type: data.type || 'full-time',
          salary: data.salary || '',
          cgpaCutoff: data.cgpaCutoff?.toString() || '',
          deadline: data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : '',
          domain: Array.isArray(data.domain) ? data.domain.join(', ') : '',
          skills: Array.isArray(data.skills) ? data.skills.join(', ') : '',
          branch: Array.isArray(data.branch) ? data.branch : [],
          internshipPeriod: data.internshipPeriod || '',
          responsibilities: data.responsibilities || '',
          aboutCompany: data.aboutCompany || '',
        };
        console.log("[EditInternshipPage] Prepared formData for state update:", newFormData);
        setFormData(newFormData);
      } catch (err) {
        console.error("[EditInternshipPage] Error during fetchInternshipData:", err);
        setError(err.response?.data?.message || 'Failed to load internship data. Please check the ID or try again.');
      } finally {
        setInitialLoading(false);
      }
    };

    if (internshipId) {
      fetchInternshipData();
    } else {
      console.warn("[EditInternshipPage] internshipId is undefined in useEffect, skipping fetch.");
      setInitialLoading(false);
      setError('Internship ID is missing. Cannot load data.');
    }
  }, [internshipId]);


  useEffect(() => {
    if (!showBranchDropdown) return;
    function handleClickOutside(event) {
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target)) {
        setShowBranchDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showBranchDropdown]);

  const capitalizeTags = (str) => str.split(',').map(s => s.trim()).filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase());

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBranchSelect = (branchName) => {
    setFormData((prev) => {
      const newBranches = prev.branch.includes(branchName)
        ? prev.branch.filter((b) => b !== branchName)
        : [...prev.branch, branchName];
      return { ...prev, branch: newBranches };
    });
  };
  
  const requiredFields = [
    { key: 'title', label: 'Internship Title' },
    { key: 'companyName', label: 'Company Name' },
    { key: 'description', label: 'Description' },
    { key: 'location', label: 'Location' },
    { key: 'deadline', label: 'Deadline' },
  ];

  const getMissingFields = () => requiredFields.filter(f => !formData[f.key]?.trim()).map(f => f.label);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const missing = getMissingFields();
    if (missing.length > 0) {
      setError(`Please fill all required fields: ${missing.join(', ')}.`);
      setLoading(false);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const deadlineDate = new Date(formData.deadline);
    if (deadlineDate < today) {
      setError('Deadline must be today or a future date.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        cgpaCutoff: formData.cgpaCutoff ? Number(formData.cgpaCutoff) : null,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        domain: formData.domain ? capitalizeTags(formData.domain) : [],
        skills: formData.skills ? capitalizeTags(formData.skills) : [],
        // Ensure 'branch' is already an array from state
      };
      
      // Clean up empty optional fields to avoid sending them as empty strings if backend expects null/undefined
      Object.keys(payload).forEach(key => {
        if (payload[key] === '' && !requiredFields.find(f => f.key === key)) {
            if (key === 'cgpaCutoff' || key === 'salary' || key === 'companyLogoUrl' || key === 'internshipPeriod' || key === 'responsibilities' || key === 'aboutCompany') {
                 payload[key] = null; // Set to null if backend handles it
            } else if (key === 'domain' || key === 'skills' || key === 'branch') {
                 // Arrays are fine if empty
            } else {
                 delete payload[key]; // Or delete if backend prefers fields not to be present
            }
        }
      });

      console.log("[EditInternshipPage] Submitting payload:", payload);
      await axiosInstance.put(`/internships/${internshipId}`, payload);
      setSuccess('Internship updated successfully! You will be redirected shortly.');
      setTimeout(() => navigate('/ccpd/manage-internships'), 2500);
    } catch (err) {
      console.error("[EditInternshipPage] Error submitting form:", err);
      const message = err.response?.data?.message || 'Failed to update internship. Please try again.';
      setError(message);
    }
    setLoading(false);
  };

  if (initialLoading) {
    return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner message="Loading internship data..." /></div>;
  }

  // If there's a general error and no form data has been loaded (e.g., initial fetch failed badly)
  if (error && !formData.title && initialLoading === false) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage title="Error Loading Internship" message={error} />
        <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up min-h-screen bg-brand-surface dark:bg-brand-dark">
      <section
        aria-label="Edit internship hero section"
        className="relative flex items-stretch justify-stretch min-h-[300px] w-full overflow-hidden"
      >
        <div aria-hidden="true" className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-teal-600 opacity-30 blur-3xl" />
        <div aria-hidden="true" className="absolute bottom-0 right-10 w-64 h-64 rounded-full bg-gray-700 opacity-25 blur-2xl" />
        <div className="relative bg-gradient-to-br from-sky-700 via-teal-600 to-cyan-500 bg-opacity-70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-[0_20px_50px_rgba(14,116,144,0.4)] w-full max-w-full px-12 py-14 text-center z-10 sm:mx-0">
          <span className="inline-flex justify-center mb-8">
            <BuildingOffice2Icon className="drop-shadow-lg" style={{ width: 64, height: 64, color: '#e0f2f7' }} aria-hidden="true" />
          </span>
          <h1 className="text-5xl font-extrabold mb-4 text-white drop-shadow-lg leading-tight">Edit Internship</h1>
          <p className="text-xl text-white/90 mx-auto drop-shadow-lg px-4 sm:px-0 max-w-xl">Update the details for the internship posting.</p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-colors"
          >
            <ArrowUturnLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Back to Manage Internships
          </button>
          
          <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl">
            {/* Display general form error OR success message */}
            {error && <ErrorMessage title="Form Submission Error" message={error} />}
            {success && (
              <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-900/40 dark:text-green-300 border border-green-500/50" role="alert">
                {success}
              </div>
            )}

            {/* Internship Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Internship Title <span className="text-red-500">*</span></label>
              <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="mt-1 input-field" />
            </div>

            {/* Company Name & Logo URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name <span className="text-red-500">*</span></label>
                <input type="text" name="companyName" id="companyName" value={formData.companyName} onChange={handleChange} required className="mt-1 input-field" />
              </div>
              <div>
                <label htmlFor="companyLogoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Logo URL (Optional)</label>
                <input type="url" name="companyLogoUrl" id="companyLogoUrl" value={formData.companyLogoUrl} onChange={handleChange} placeholder="https://example.com/logo.png" className="mt-1 input-field" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description <span className="text-red-500">*</span></label>
              <textarea name="description" id="description" rows="4" value={formData.description} onChange={handleChange} required className="mt-1 input-field" placeholder="Detailed description of the internship role..."></textarea>
            </div>
            
            {/* Responsibilities */}
            <div>
              <label htmlFor="responsibilities" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Responsibilities (Optional, one per line)</label>
              <textarea name="responsibilities" id="responsibilities" rows="4" value={formData.responsibilities} onChange={handleChange} placeholder="- Developed new API endpoints...
- Optimized database queries..." className="mt-1 input-field"></textarea>
            </div>

            {/* About Company */}
            <div>
              <label htmlFor="aboutCompany" className="block text-sm font-medium text-gray-700 dark:text-gray-300">About Company (Optional)</label>
              <textarea name="aboutCompany" id="aboutCompany" rows="3" value={formData.aboutCompany} onChange={handleChange} placeholder="Briefly describe the company culture, mission, etc..." className="mt-1 input-field"></textarea>
            </div>

            {/* Location & Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location <span className="text-red-500">*</span></label>
                <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} required className="mt-1 input-field" />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Internship Type</label>
                <select name="type" id="type" value={formData.type} onChange={handleChange} className="mt-1 input-field">
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
            </div>

            {/* Salary & CGPA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="salary" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Salary/Stipend (Optional)</label>
                    <input type="text" name="salary" id="salary" value={formData.salary} onChange={handleChange} placeholder="e.g., ₹20,000/month or Not Disclosed" className="mt-1 input-field" />
                </div>
                <div>
                    <label htmlFor="cgpaCutoff" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CGPA Cutoff (Optional)</label>
                    <input type="number" step="0.01" min="0" max="10" name="cgpaCutoff" id="cgpaCutoff" value={formData.cgpaCutoff} onChange={handleChange} placeholder="e.g., 7.5" className="mt-1 input-field" />
                </div>
            </div>

            {/* Deadline & Period */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Application Deadline <span className="text-red-500">*</span></label>
                <input type="date" name="deadline" id="deadline" value={formData.deadline} onChange={handleChange} required className="mt-1 input-field" />
              </div>
              <div>
                <label htmlFor="internshipPeriod" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Internship Period (Optional)</label>
                <input type="text" name="internshipPeriod" id="internshipPeriod" value={formData.internshipPeriod} onChange={handleChange} placeholder="e.g., 2 Months, Summer 2024" className="mt-1 input-field" />
              </div>
            </div>

            {/* Domain & Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="domain" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Domain (Optional, comma-separated)</label>
                <input type="text" name="domain" id="domain" value={formData.domain} onChange={handleChange} placeholder="e.g., Web Development, AI" className="mt-1 input-field" />
              </div>
              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Skills (Optional, comma-separated)</label>
                <input type="text" name="skills" id="skills" value={formData.skills} onChange={handleChange} placeholder="e.g., React, Python" className="mt-1 input-field" />
              </div>
            </div>
            
            {/* Branch Selection */}
            <div className="relative" ref={branchDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Eligible Branches (Optional, select all that apply)</label>
              <button
                type="button"
                onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                className="mt-1 input-field text-left w-full flex justify-between items-center"
                aria-haspopup="listbox"
                aria-expanded={showBranchDropdown}
              >
                <span>{formData.branch.length > 0 ? `${formData.branch.length} branch${formData.branch.length > 1 ? 'es' : ''} selected` : 'Select Branches'}</span>
                <svg className={`w-5 h-5 transform transition-transform ${showBranchDropdown ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
              {showBranchDropdown && (
                <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto" role="listbox">
                  {BRANCHES.map((branchName) => (
                    <label key={branchName} className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer" role="option" aria-selected={formData.branch.includes(branchName)}>
                      <input
                        type="checkbox"
                        checked={formData.branch.includes(branchName)}
                        onChange={() => handleBranchSelect(branchName)}
                        className="form-checkbox h-4 w-4 text-brand-primary border-gray-300 dark:border-gray-500 rounded focus:ring-brand-primary"
                      />
                      <span className="ml-3 text-sm text-gray-700 dark:text-gray-200">{branchName}</span>
                    </label>
                  ))}
                </div>
              )}
              {formData.branch.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.branch.map((branchName) => (
                    <span key={branchName} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-accent/20 text-brand-accent dark:bg-brand-accent/30 dark:text-brand-accent-light">
                      {branchName}
                      <button type="button" onClick={() => handleBranchSelect(branchName)} className="ml-1.5 flex-shrink-0 text-brand-accent/70 hover:text-brand-accent dark:text-brand-accent-light/70 dark:hover:text-brand-accent-light">
                        <XMarkIcon className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={loading || getMissingFields().length > 0}
                className="btn btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <LoadingSpinner size="sm" className="mr-2" /> : 'Update Internship'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}