import React, { useState, useEffect } from 'react';
import { HeroSection } from './HeroSection';
import { InternshipGrid } from './InternshipGrid';
// InternshipCard is imported by InternshipGrid, so no direct import needed here unless used separately.
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

// Mock data for internships
// In a pure JS/JSX environment, you don't define types like `Internship[]`
// The structure is implied by the data.
const mockInternships = [
  { id: '1', title: 'Software Engineer Intern', company: 'Tech Solutions Inc.', location: 'San Francisco, CA', type: 'Full-time' },
  { id: '2', title: 'Marketing Intern', company: 'Creative Minds Agency', location: 'New York, NY', type: 'Part-time' },
  { id: '3', title: 'Data Science Intern', company: 'Analytics Corp.', location: 'Remote', type: 'Remote' },
  { id: '4', title: 'UX Design Intern', company: 'UserFirst Design', location: 'Austin, TX', type: 'Full-time' },
  { id: '5', title: 'Product Management Intern', company: 'Innovate Ltd.', location: 'Seattle, WA', type: 'Full-time' },
  { id: '6', title: 'Frontend Developer Intern', company: 'Web Wizards', location: 'Boston, MA', type: 'Part-time' },
];

export const LandingPage = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInternships = async () => {
      setLoading(true);
      setError(null);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (Math.random() < 0.15) {
          throw new Error('Failed to fetch internship data. Please try again later.');
        }
        
        setInternships(mockInternships);
      } catch (err) {
        // err is an Error object by default in modern JS if thrown with `new Error()`
        setError(err.message || 'An unknown error occurred.');
        setInternships([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <HeroSection />
      <main className="container mx-auto px-6 py-8">
        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} />}
        {!loading && !error && <InternshipGrid internships={internships} />}
      </main>
      <footer className="bg-slate-800 text-slate-300 py-8 text-center">
        <p>&copy; {new Date().getFullYear()} Internship Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};