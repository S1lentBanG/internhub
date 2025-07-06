import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BuildingOffice2Icon,
  MapPinIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  BriefcaseIcon,
  ClockIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

// Helper to format date
const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid Date';
  }
};

export default function InternshipCard({ internship }) {
  const navigate = useNavigate();

  if (!internship || typeof internship !== 'object') {
    console.error("InternshipCard received invalid data:", internship);
    return <div className="card p-6 text-text-secondary">Invalid internship data.</div>;
  }

  // Support both _id and id
  const safeId = String(internship._id || internship.id || '');

  const {
    companyName = "N/A Company",
    title = "Internship Title",
    location = "N/A",
    salary = "Not Disclosed",
    cgpaCutoff,
    deadline,
    domain = [],
    skills = [],
    branch = [],
    type = "N/A",
    internshipPeriod = "",
    description = "",
  } = internship;

  // Deadline logic
  const deadlineDate = deadline ? new Date(deadline) : null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const hasDeadlinePassed = deadlineDate ? deadlineDate < today : false;

  // Modern gradient logic
  const gradients = [
    { from: 'from-brand-accent', to: 'to-brand-primary', glow: 'rgba(138, 79, 255, 0.18)' },
    { from: 'from-brand-primary', to: 'to-brand-accent', glow: 'rgba(79, 239, 255, 0.18)' },
    { from: 'from-brand-surface', to: 'to-brand-accent', glow: 'rgba(255, 79, 138, 0.18)' },
  ];
  const gradientIndex = (parseInt(safeId.slice(-1), 16) || 0) % gradients.length;
  const currentGradient = gradients[gradientIndex];

  const handleApplyNow = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to apply.');
        return;
      }
      const response = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          internshipId: safeId,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Application submitted successfully!');
      } else {
        alert(data.message || 'Failed to apply.');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
      console.error(error);
    }
  };

  const handleViewDetails = () => {
    if (!hasDeadlinePassed) {
      console.log('Navigating to ID:', safeId);
      navigate(`/internships/${safeId}`);
    }
  };

  return (
    <div
      className={`
        relative flex flex-col h-full p-6 rounded-3xl
        bg-white/70 dark:bg-brand-dark/70
        shadow-2xl border border-white/10
        backdrop-blur-xl
        transition-transform duration-300
        hover:-translate-y-2 hover:shadow-[0_8px_40px_0_rgba(138,79,255,0.18)]
        group
        ${hasDeadlinePassed ? 'opacity-70' : ''}
      `}
      style={{
        boxShadow: `0 8px 40px 0 ${currentGradient.glow}`,
      }}
    >
      {/* Card Header */}
      <div className="mb-4 z-10 relative">
        <div className="flex justify-between items-start">
          <h3 className="relative text-lg font-extrabold text-text-main dark:text-text-main-dark drop-shadow-sm">
            <span className="relative z-10">{title}</span>
          </h3>
        </div>
        <p className="relative text-sm text-purple-600 font-semibold mt-1 flex items-center">
  <BuildingOffice2Icon className="h-4 w-4 mr-1.5 flex-shrink-0 text-slate-500" />
  <span className="relative z-10">{companyName}</span>
</p>



      </div>

      {/* Card Body - Internship Details */}
      <div className="space-y-2 text-sm text-text-secondary mb-5 flex-grow z-10 relative">
        <p className="flex items-center">
          <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0 text-brand-primary/80" />
          {location}
        </p>
        <p className="flex items-center">
          <CurrencyDollarIcon className="h-4 w-4 mr-2 flex-shrink-0 text-brand-primary/80" />
          <span className="font-medium">Salary:</span> <span className="ml-1">{salary}</span>
        </p>
        {typeof cgpaCutoff === 'number' && !isNaN(cgpaCutoff) && (
          <p className="flex items-center">
            <AcademicCapIcon className="h-4 w-4 mr-2 flex-shrink-0 text-brand-primary/80" />
            <span className="font-medium">CGPA Cutoff:</span> <span className="ml-1">{cgpaCutoff.toFixed(1)}+</span>
          </p>
        )}
        <p className="flex items-center">
          <CalendarDaysIcon className="h-4 w-4 mr-2 flex-shrink-0 text-brand-primary/80" />
          <span className="font-medium">Apply by:</span> 
          <span className={`ml-1 ${hasDeadlinePassed ? 'text-red-500 font-semibold' : 'text-text-secondary'}`}>
            {deadlineDate ? (hasDeadlinePassed ? 'Passed' : formatDate(deadline)) : 'N/A'}
          </span>
        </p>
        {type && (
          <p className="flex items-center">
            <BriefcaseIcon className="h-4 w-4 mr-2 flex-shrink-0 text-brand-primary/80" />
            <span className="font-medium">Type:</span> <span className="ml-1">{type}</span>
          </p>
        )}
        {internshipPeriod && (
          <p className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-2 flex-shrink-0 text-brand-primary/80" />
            <span className="font-medium">Period:</span> <span className="ml-1">{internshipPeriod}</span>
          </p>
        )}
        {Array.isArray(branch) && branch.length > 0 && (
          <p className="flex items-center flex-wrap gap-1">
            <UserGroupIcon className="h-4 w-4 mr-2 flex-shrink-0 text-brand-accent" />
            <span className="font-medium">Branches:</span>
            {branch.map((b, i) => (
              <span
                key={i}
                className="ml-1 px-2 py-0.5 rounded-full bg-brand-accent/20 text-brand-accent text-xs font-semibold shadow-sm border border-brand-accent/30"
              >
                {b}
              </span>
            ))}
          </p>
        )}
        {Array.isArray(skills) && skills.length > 0 && (
          <p className="flex items-center flex-wrap gap-1">
            <AcademicCapIcon className="h-4 w-4 mr-2 flex-shrink-0 text-brand-primary" />
            <span className="font-medium">Skills:</span>
            {skills.map((skill, i) => (
              <span
                key={i}
                className="ml-1 px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-semibold shadow-sm border border-brand-primary/20"
              >
                {skill}
              </span>
            ))}
          </p>
        )}
      </div>

      {/* Domains/Tags */}
      {Array.isArray(domain) && domain.length > 0 && (
        <div className="mb-5 z-10 relative">
          <div className="flex flex-wrap gap-2">
            {domain.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2.5 py-1 text-xs font-medium rounded-full bg-brand-dark/80 text-white border border-brand-dark/30 shadow"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Card Footer - View Details Button */}
      <div className="mt-auto pt-4 border-t border-border-color z-10 relative">
        <button
          onClick={handleViewDetails}
          disabled={hasDeadlinePassed}
          title={hasDeadlinePassed ? "DEADLINE HAS PASSED" : "View internship details"}
          className={`
            w-full py-2 rounded-xl font-semibold text-base
            text-white shadow-lg transition-all duration-200
            hover:scale-105 active:scale-100
            focus:outline-none focus:ring-2 focus:ring-brand-accent/60
            ${hasDeadlinePassed 
              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed hover:bg-gray-400 dark:hover:bg-gray-600' 
              : 'bg-gradient-to-r from-purple-700 to-brand-primary hover:shadow-[0_4px_24px_0_rgba(138,79,255,0.25)]'
            }
          `}
        >
          {hasDeadlinePassed ? 'Deadline Passed' : 'View Details'}
        </button>
      </div>

      {/* 3D Glow Effect */}
      <div
        className="pointer-events-none absolute -inset-2 rounded-3xl blur-2xl opacity-60 z-0"
        style={{
          background: `linear-gradient(120deg, ${currentGradient.glow}, transparent 70%)`,
        }}
      />
    </div>
  );
}