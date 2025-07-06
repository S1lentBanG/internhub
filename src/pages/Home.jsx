import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import InternshipCard from '../components/InternshipCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import HeroSectionHome from '../components/HeroSectionHome';
import { FilterBar } from '../filters';
import {
  BriefcaseIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import Tilt from 'react-parallax-tilt'; // Add this import at the top

export default function Home() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFeature, setActiveFeature] = useState(0);
  const [filters, setFilters] = useState({ domain: '', location: '', company: '', cgpaCutoff: '' });

  // State for dynamic filter options
  const [domainOptions, setDomainOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [cgpaOptions, setCgpaOptions] = useState([]); // Will be populated from API

  // Features data with modern styling
  const features = [
    {
      icon: <BriefcaseIcon className="h-full w-full" />,
      title: 'Premium Opportunities',
      description:
        'Access verified internships from top-tier companies across diverse industries.',
    },
    {
      icon: <BuildingOffice2Icon className="h-full w-full" />,
      title: 'Industry Leaders',
      description:
        'Connect with innovative startups and established industry giants.',
    },
    {
      icon: <UserGroupIcon className="h-full w-full" />,
      title: 'CCPD Integration',
      description:
        'Seamless connection with your college placement department for verified listings.',
    },
    {
      icon: <ShieldCheckIcon className="h-full w-full" />,
      title: 'Verified Listings',
      description:
        'Every opportunity is vetted and verified by our team for authenticity.',
    },
    {
      icon: <AcademicCapIcon className="h-full w-full" />,
      title: 'Career Growth',
      description:
        'Build your professional network and gain real-world experience.',
    },
  ];

  // Fetch filter options on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await axiosInstance.get('/filter-options');
        if (response.data) {
          setDomainOptions(response.data.domains || []);
          setLocationOptions(response.data.locations || []);
          setCompanyOptions(response.data.companyNames || []);
          setCgpaOptions(response.data.cgpaCutoffs || []);
        }
      } catch (error) {
        console.error("Failed to fetch filter options:", error);
        // Set empty arrays or default options in case of error
        setDomainOptions([]);
        setLocationOptions([]);
        setCompanyOptions([]);
        setCgpaOptions([7, 7.5, 8, 8.5, 9]); // Fallback CGPA options
      }
    };
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchInternships = async () => {
      setLoading(true);
      setError(null);
      console.log("Home.jsx fetching with filters:", filters);
      try {
        const params = [];
        if (filters.domain) params.push(`domain=${filters.domain}`);
        if (filters.location) params.push(`location=${filters.location}`);
        if (filters.company) params.push(`company=${filters.company}`);
        if (filters.cgpaCutoff) params.push(`cgpaCutoff=${filters.cgpaCutoff}`);
        
        params.push(`page=1`); 
        params.push(`limit=3`);

        const query = params.length ? `?${params.join('&')}` : '';
        console.log("Home.jsx API query:", query);
        const response = await axiosInstance.get(`/internships${query}`);
        
        if (isMounted) {
          if (response.data && Array.isArray(response.data.internships)) {
            setInternships(response.data.internships);
          } else {
            if (Array.isArray(response.data)) {
              setInternships(response.data.slice(0,3));
              console.warn("Home.jsx: API response structure might be outdated. Expected { internships: [], ... }");
            } else {
              setError('Invalid data format received from server for Latest Internships.');
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err?.response?.data?.message ||
            err?.message ||
            'Failed to load internships. Please try again later.'
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchInternships();

    // Auto-rotate through features
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  return (
    <div className="animate-fade-in">
      <HeroSectionHome />

      {/* Why Students Trust InternHub Section */}
      <section className="py-20 bg-gradient-to-b from-brand-surface to-brand-neutral-lightest dark:from-brand-dark dark:to-brand-primary-dark">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-accent mb-4">
        Why Students Trust InternHub
      </h2>
      <p className="text-lg text-text-secondary max-w-2xl mx-auto">
        We're revolutionizing how students discover and apply for internships
      </p>
    </div>

    {/* Interactive Feature Showcase */}
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16">
      {/* Feature Navigation */}
      <div className="lg:col-span-2 flex flex-col justify-center space-y-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl transition-all duration-300 cursor-pointer transform hover:translate-x-2
              ${
                activeFeature === index
                  ? 'bg-brand-surface dark:bg-brand-surface/20 shadow-lg border-l-4 border-brand-accent'
                  : 'hover:bg-brand-surface/50 dark:hover:bg-brand-surface/10'
              }`}
            onClick={() => setActiveFeature(index)}
          >
            <h3
              className={`text-xl font-semibold mb-2 transition-colors duration-300
              ${activeFeature === index ? 'text-brand-accent' : 'text-text-main'}`}
            >
              {feature.title}
            </h3>
            <p
              className={`text-sm transition-opacity duration-300
              ${activeFeature === index ? 'opacity-100' : 'opacity-70'}`}
            >
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Feature Visual */}
      <div className="lg:col-span-3 flex items-center justify-center">
        <div className="relative w-full max-w-md aspect-square">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-500 transform
                ${
                  activeFeature === index
                    ? 'opacity-100 scale-100 rotate-0'
                    : 'opacity-0 scale-90 rotate-6'
                }`}
            >
              <div className="w-full h-full flex items-center justify-center">
                <Tilt
                  tiltMaxAngleX={20}
                  tiltMaxAngleY={20}
                  perspective={900}
                  scale={1.07}
                  transitionSpeed={700}
                  glareEnable={true}
                  glareMaxOpacity={0.25}
                  className="w-40 h-40"
                  style={{ borderRadius: '1.5rem' }}
                >
                  <div className="w-full h-full relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-brand-accent/20 rounded-3xl transform rotate-6 scale-105 blur-sm"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary to-brand-accent rounded-3xl shadow-xl"></div>
                    <div className="absolute inset-2 bg-brand-surface dark:bg-brand-dark rounded-2xl flex items-center justify-center text-brand-accent">
                      {feature.icon}
                    </div>
                  </div>
                </Tilt>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Partner Logos - Modern Style */}
    <div className="mt-16">
      <p className="text-center text-text-secondary mb-8">
        Trusted by leading companies and organizations
      </p>
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
        {/* Replace with actual partner logos */}
        {['Microsoft', 'Google', 'Amazon', 'Meta', 'Apple'].map((partner, index) => (
          <div
            key={index}
            className="h-12 flex items-center justify-center grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
          >
            <div className="text-xl font-bold text-text-main">{partner}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>


      {/* Latest Internships Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-main mb-4">
              Latest Internships
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Discover and apply to the newest opportunities added to our platform
            </p>
          </div>
          <FilterBar 
            filters={filters} 
            setFilters={setFilters} 
            domainOptions={domainOptions}
            locationOptions={locationOptions}
            companyOptions={companyOptions}
            cgpaOptions={cgpaOptions}
          />
          {loading ? (
            <LoadingSpinner message="Loading latest internships..." />
          ) : error ? (
            <ErrorMessage title="Could Not Load Internships" message={error} />
          ) : internships.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
              {internships.map((internship) => (
                <InternshipCard key={internship.id || internship._id} internship={internship} />
              ))}
            </div>
          ) : (
            <div className="text-center text-text-secondary py-10">
              <p className="text-xl">No internships available at the moment.</p>
              <Link to="/internships" className="mt-4 btn btn-primary inline-block">
                Explore All Internships
              </Link>
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/internships" className="btn btn-primary px-8 py-3">
              View All Internships
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}