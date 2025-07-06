import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  BuildingOffice2Icon,
  LightBulbIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import axiosInstance from '../api/axiosInstance';

const BRANCHES = [
  'CSE',
  'ECE',
  'EEE',
  'Mathematics & Computing',
  'Mechanical',
  'Civil',
  'Chemical',
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
};

export default function PostInternshipPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const branchDropdownRef = useRef(null);

  useEffect(() => {
    if (currentUser && currentUser.role !== 'ccpd') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Close dropdown on outside click & Escape key, attach listeners only when dropdown open
  useEffect(() => {
    if (!showBranchDropdown) return;

    function handleClickOutside(event) {
      if (
        branchDropdownRef.current &&
        !branchDropdownRef.current.contains(event.target)
      ) {
        setShowBranchDropdown(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setShowBranchDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showBranchDropdown]);

  // Helper: capitalize and trim tags robustly
  const capitalizeTags = (arr) =>
    arr
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase());

  // Detect mobile viewport for dropdown behavior
  const isMobile = () => window.innerWidth < 768;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Branch selection: allow multiple selections, close dropdown on mobile after select
  const handleBranchSelect = (branch) => {
    if (!formData.branch.includes(branch)) {
      setFormData((prev) => ({
        ...prev,
        branch: [...prev.branch, branch],
      }));
    }
    if (isMobile()) setShowBranchDropdown(false);
  };

  const handleBranchRemove = (branch) => {
    setFormData((prev) => ({
      ...prev,
      branch: prev.branch.filter((b) => b !== branch),
    }));
  };

  // Required fields for validation
  const requiredFields = [
    { key: 'title', label: 'Internship Title' },
    { key: 'companyName', label: 'Company Name' },
    { key: 'description', label: 'Description' },
    { key: 'location', label: 'Location' },
    { key: 'deadline', label: 'Deadline' },
  ];

  const missingFields = () =>
    requiredFields
      .filter((f) => !formData[f.key].trim())
      .map((f) => f.label);

  const isFormValid = () => missingFields().length === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate required fields
    const missing = missingFields();
    if (missing.length > 0) {
      setError(`Please fill all the required fields: ${missing.join(', ')}.`);
      setLoading(false);
      return;
    }

    // Validate deadline is future date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(formData.deadline);
    if (deadlineDate < today) {
      setError('Deadline must be a future date.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        cgpaCutoff: formData.cgpaCutoff ? Number(formData.cgpaCutoff) : undefined,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
        domain: formData.domain
          ? capitalizeTags(formData.domain.split(','))
          : [],
        skills: formData.skills
          ? capitalizeTags(formData.skills.split(','))
          : [],
      };
      await axiosInstance.post('/internships', payload);
      setSuccess(
        'Your internship posting has been received! It will appear on the internships page.'
      );
      setFormData(INITIAL_FORM_STATE);
    } catch (err) {
      // Show backend error message if available
      const message =
        err.response?.data?.message ||
        'Failed to post internship. Please try again.';
      setError(message);
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in-up">
      {/* Hero Section */}
      <section
        aria-label="Partner with InternHub hero section"
        className="relative flex items-stretch justify-stretch min-h-[420px] w-full overflow-hidden"
      >
        {/* Decorative blurred circles */}
        <div
          aria-hidden="true"
          className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-purple-700 opacity-30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-0 right-10 w-64 h-64 rounded-full bg-black opacity-25 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="absolute top-10 right-32 w-48 h-48 rounded-full bg-blue-600 opacity-20 blur-2xl"
        />

        {/* Frosted Glass Card */}
        <div className="relative bg-gradient-to-br from-purple-800 via-violet-700 to-blue-600 bg-opacity-70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-[0_20px_50px_rgba(215,38,96,0.4)] w-full max-w-full px-12 py-14 text-center z-10 sm:mx-0">
          <span className="inline-flex justify-center mb-8">
            <BuildingOffice2Icon
              className="drop-shadow-lg"
              style={{ width: 64, height: 64, color: '#e0d3f5' }}
              aria-hidden="true"
            />
          </span>
          <h1 className="text-5xl font-extrabold mb-4 text-white drop-shadow-lg leading-tight">
            Partner with InternHub
          </h1>
          <p className="text-xl text-white/90 mx-auto drop-shadow-lg px-4 sm:px-0 max-w-xl">
            Make internship searching easier for NITW students. Post your
            CCPD-approved opportunities and help students find the right fit!
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Why Use InternHub */}
            <div className="col-span-1 md:col-span-5 mb-8 md:mb-0">
              <div className="space-y-10 md:sticky md:top-24 bg-gradient-to-br from-white/80 via-brand-surface/60 to-brand-accent/10 dark:from-brand-dark/70 dark:to-brand-accent/10 rounded-3xl shadow-md p-6 min-h-[600px] flex flex-col justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-text-main dark:text-text-main-dark mb-4">
                    Why Use InternHub?
                  </h2>
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="flex-shrink-0 p-2 bg-brand-accent/10 rounded-full">
                      <UserGroupIcon className="h-6 w-6 text-brand-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-text-main dark:text-text-main-dark">
                        Internship Search Made Easy
                      </h3>
                      <p className="text-text-muted dark:text-text-muted-dark mt-1">
                        No more endless scrolling through emails or scattered
                        links. Find all CCPD-approved internships in one place,
                        designed for NITW students.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="flex-shrink-0 p-2 bg-brand-accent/10 rounded-full">
                      <LightBulbIcon className="h-6 w-6 text-brand-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-text-main dark:text-text-main-dark">
                        Apply and Track Effortlessly
                      </h3>
                      <p className="text-text-muted dark:text-text-muted-dark mt-1">
                        Apply to multiple internships with a single profile and
                        easily track your application status—all in one
                        dashboard.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 bg-muted/5 dark:bg-muted-dark/5 p-4 rounded-xl mb-6">
                    <div className="flex-shrink-0 p-2 bg-brand-accent/10 rounded-full">
                      <BuildingOffice2Icon
                        className="h-6 w-6"
                        style={{ color: '#d72660' }}
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-text-main dark:text-text-main-dark">
                        Built by a Fellow Student
                      </h3>
                      <p className="text-text-muted dark:text-text-muted-dark mt-1">
                        InternHub isn't some generic portal—it was crafted during
                        the CCPD drive itself, tailored to solve the exact
                        problems we all face.
                      </p>
                    </div>
                  </div>
                </div>
                <p className="pt-6 border-t border-border-light dark:border-border-dark text-text-main dark:text-text-main-dark text-center text-base font-medium italic">
                  InternHub is your personal launchpad—organized, focused, and
                  made to help you land that dream internship without the
                  chaos.
                </p>
              </div>
            </div>

            {/* Internship Posting Form */}
            <div className="col-span-1 md:col-span-7">
              <div className="card p-6 sm:p-8 max-w-xl mx-auto">
                <h2 className="text-2xl font-semibold text-text-main dark:text-text-main-dark mb-6">
                  Submit Your Internship Listing
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off" noValidate>
                  {error && (
                    <div aria-live="polite" role="alert" className="mb-4">
                      <ErrorMessage title="Submission Error" message={error} />
                    </div>
                  )}
                  {success && (
                    <div
                      className="p-4 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 dark:border-green-400 text-green-700 dark:text-green-300 rounded-md mb-4"
                      aria-live="polite"
                      role="status"
                    >
                      <p className="font-semibold">Success!</p>
                      <p>{success}</p>
                    </div>
                  )}

                  {/* Internship Title */}
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-text-main dark:text-text-main-dark mb-1"
                    >
                      Internship Title<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      required
                      autoComplete="off"
                      aria-required="true"
                      aria-invalid={!formData.title?.trim()}
                      aria-describedby={!formData.title?.trim() ? 'title-error' : undefined}
                      className="input-field focus:ring-2 focus:ring-brand-accent focus:outline-none"
                      value={formData.title || ''}
                      onChange={handleChange}
                      placeholder="e.g., Software Engineering Intern"
                      disabled={loading}
                    />
                    {!formData.title?.trim() && error && (
                      <span id="title-error" className="text-red-500 text-xs">Title is required.</span>
                    )}
                  </div>

                  {/* Company Name */}
                  <div>
                    <label
                      htmlFor="companyName"
                      className="block text-sm font-medium text-text-main dark:text-text-main-dark mb-1"
                    >
                      Company Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      id="companyName"
                      required
                      autoComplete="off"
                      aria-required="true"
                      aria-invalid={!formData.companyName?.trim()}
                      aria-describedby={!formData.companyName?.trim() ? 'companyName-error' : undefined}
                      className="input-field focus:ring-2 focus:ring-brand-accent focus:outline-none"
                      value={formData.companyName || ''}
                      onChange={handleChange}
                      placeholder="Your Company Inc."
                      disabled={loading}
                    />
                    {!formData.companyName?.trim() && error && (
                      <span id="companyName-error" className="text-red-500 text-xs">Company name is required.</span>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-text-main dark:text-text-main-dark mb-1"
                    >
                      Description & Responsibilities<span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows="4"
                      required
                      autoComplete="off"
                      aria-required="true"
                      aria-invalid={!formData.description?.trim()}
                      aria-describedby={!formData.description?.trim() ? 'description-error' : undefined}
                      className="input-field focus:ring-2 focus:ring-brand-accent focus:outline-none"
                      value={formData.description || ''}
                      onChange={handleChange}
                      placeholder="Role details, responsibilities & skills required"
                      disabled={loading}
                    ></textarea>
                    {!formData.description?.trim() && error && (
                      <span id="description-error" className="text-red-500 text-xs">Description is required.</span>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-text-main dark:text-text-main-dark mb-1"
                    >
                      Location<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      id="location"
                      required
                      autoComplete="off"
                      aria-required="true"
                      aria-invalid={!formData.location?.trim()}
                      aria-describedby={!formData.location?.trim() ? 'location-error' : undefined}
                      className="input-field focus:ring-2 focus:ring-brand-accent focus:outline-none"
                      value={formData.location || ''}
                      onChange={handleChange}
                      placeholder="e.g., Hyderabad, Bangalore or Remote"
                      disabled={loading}
                    />
                    {!formData.location?.trim() && error && (
                      <span id="location-error" className="text-red-500 text-xs">Location is required.</span>
                    )}
                  </div>

                  {/* Internship Type */}
                  <div>
                    <label
                      htmlFor="type"
                      className="block text-sm font-medium text-text-main dark:text-text-main-dark mb-1"
                    >
                      Internship Type
                    </label>
                    <select
                      name="type"
                      id="type"
                      className="input-field focus:ring-2 focus:ring-brand-accent focus:outline-none"
                      value={formData.type}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="remote">Remote</option>
                    </select>
                  </div>

                  {/* Salary */}
                  <div>
                    <label
                      htmlFor="salary"
                      className="block text-sm font-medium text-text-main dark:text-text-main-dark mb-1"
                    >
                      Salary 
                    </label>
                    <input
                      type="text"
                      name="salary"
                      id="salary"
                      autoComplete="off"
                      className="input-field focus:ring-2 focus:ring-brand-accent focus:outline-none"
                      value={formData.salary}
                      onChange={handleChange}
                      placeholder="e.g., 15,000 INR/month"
                      disabled={loading}
                    />
                  </div>

                  {/* CGPA Cutoff */}
                  <div>
                    <label
                      htmlFor="cgpaCutoff"
                      className="block text-sm font-medium text-text-main dark:text-text-main-dark mb-1"
                    >
                      CGPA Cutoff
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      name="cgpaCutoff"
                      id="cgpaCutoff"
                      autoComplete="off"
                      className="input-field focus:ring-2 focus:ring-brand-accent focus:outline-none"
                      value={formData.cgpaCutoff}
                      onChange={handleChange}
                      placeholder="e.g., 7.5"
                      disabled={loading}
                    />
                  </div>

                  {/* Deadline */}
                  <div>
                    <label
                      htmlFor="deadline"
                      className="block text-sm font-medium text-text-main dark:text-text-main-dark mb-1"
                    >
                      Application Deadline<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="deadline"
                      id="deadline"
                      required
                      aria-required="true"
                      aria-invalid={!formData.deadline?.trim()}
                      aria-describedby={!formData.deadline?.trim() ? 'deadline-error' : undefined}
                      className="input-field focus:ring-2 focus:ring-brand-accent focus:outline-none"
                      value={formData.deadline || ''}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {!formData.deadline?.trim() && error && (
                      <span id="deadline-error" className="text-red-500 text-xs">Deadline is required.</span>
                    )}
                  </div>

                  {/* Domain */}
                  <div>
                    <label
                      htmlFor="domain"
                      className="block text-sm font-medium text-text-main dark:text-text-main-dark mb-1"
                    >
                      Domain(s) (comma separated)
                    </label>
                    <input
                      type="text"
                      name="domain"
                      id="domain"
                      autoComplete="off"
                      className="input-field focus:ring-2 focus:ring-brand-accent focus:outline-none"
                      value={formData.domain}
                      onChange={handleChange}
                      placeholder="e.g., Software Development, Data Science"
                      disabled={loading}
                    />
                  </div>

                  {/* Skills */}
                  <div>
                    <label
                      htmlFor="skills"
                      className="block text-sm font-medium text-text-main dark:text-text-main-dark mb-1"
                    >
                      Skills (comma separated)
                    </label>
                    <input
                      type="text"
                      name="skills"
                      id="skills"
                      autoComplete="off"
                      className="input-field focus:ring-2 focus:ring-brand-accent focus:outline-none"
                      value={formData.skills}
                      onChange={handleChange}
                      placeholder="e.g., React, Python, Communication"
                      disabled={loading}
                    />
                  </div>

                  {/* Branch Selection */}
                  <div>
                    <label
                      htmlFor="branch"
                      className="block text-sm font-medium text-text-main dark:text-text-main-dark mb-1"
                    >
                      Branches
                    </label>
                    <div className="relative" ref={branchDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setShowBranchDropdown((prev) => !prev)}
                        className="input-field w-full text-left focus:ring-2 focus:ring-brand-accent focus:outline-none"
                        aria-haspopup="listbox"
                        aria-expanded={showBranchDropdown}
                        aria-label="Select branches"
                        disabled={loading}
                      >
                        {formData.branch.length > 0
                          ? formData.branch.join(', ')
                          : 'Select branches'}
                      </button>
                      {showBranchDropdown && (
                        <ul
                          role="listbox"
                          tabIndex={-1}
                          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                        >
                          {BRANCHES.map((branch) => (
                            <li
                              key={branch}
                              role="option"
                              aria-selected={formData.branch.includes(branch)}
                              onClick={() => handleBranchSelect(branch)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleBranchSelect(branch);
                                }
                              }}
                              tabIndex={0}
                              className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${
                                formData.branch.includes(branch)
                                  ? 'text-brand-accent font-semibold'
                                  : 'text-text-main dark:text-text-main-dark'
                              } hover:bg-brand-accent/20`}
                            >
                              {branch}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {/* Selected branches with remove buttons */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.branch.map((branch) => (
                        <span
                          key={branch}
                          className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-brand-accent/20 text-brand-accent"
                        >
                          {branch}
                          <button
                            type="button"
                            onClick={() => handleBranchRemove(branch)}
                            className="ml-1 text-brand-accent hover:text-brand-accent-dark focus:outline-none"
                            aria-label={`Remove ${branch}`}
                            disabled={loading}
                          >
                            <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Internship Period */}
                  <div>
                    <label
                      htmlFor="internshipPeriod"
                      className="block text-sm font-medium text-text-main dark:text-text-main-dark mb-1"
                    >
                      Internship Period
                    </label>
                    <input
                      type="text"
                      name="internshipPeriod"
                      id="internshipPeriod"
                      autoComplete="off"
                      className="input-field focus:ring-2 focus:ring-brand-accent focus:outline-none"
                      value={formData.internshipPeriod}
                      onChange={handleChange}
                      placeholder="e.g., 3 months, June - August"
                      disabled={loading}
                    />
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary w-full"
                      aria-busy={loading}
                    >
                      {loading ? <LoadingSpinner /> : 'Post Internship'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
