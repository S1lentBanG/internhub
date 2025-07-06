import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { BriefcaseIcon, BuildingOffice2Icon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useNavigate, useLocation } from 'react-router-dom';
import InternshipCard from '../components/InternshipCard';
import CgpaFilter from '../filters/CgpaFilter';
import DomainFilter from '../filters/DomainFilter';
import LocationFilter from '../filters/LocationFilter';
import CompanyFilter from '../filters/CompanyFilter';

export default function InternshipsPage() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ domain: '', location: '', company: '', cgpaCutoff: '', q: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default items per page

  // State for the local search input on this page
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  // State for dynamic filter options
  const [domainOptions, setDomainOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [cgpaOptions, setCgpaOptions] = useState([]);

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
        // Fallback options
        setDomainOptions([]); 
        setLocationOptions([]); 
        setCompanyOptions([]);
        setCgpaOptions([7, 7.5, 8, 8.5, 9]);
      }
    };
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const queryParams = new URLSearchParams(location.search);
    const searchQueryFromUrl = queryParams.get('q') || '';
    console.log("[InternshipsPage] useEffect triggered. URL q:", searchQueryFromUrl, "Current filters.q:", filters.q);

    setLocalSearchTerm(searchQueryFromUrl);

    let shouldFetch = true; // Flag to control fetching

    if (searchQueryFromUrl !== filters.q) {
      console.log("[InternshipsPage] URL q differs from filters.q. Updating filters.q to:", searchQueryFromUrl);
      setFilters(prevFilters => ({ ...prevFilters, q: searchQueryFromUrl }));
      setCurrentPage(1); 
      // When filters are updated, this effect will run again. 
      // The fetch in *that* subsequent run will use the new filters.
      // So, we might not want to fetch immediately in *this* run if filters are about to change.
      shouldFetch = false; 
    } else if (!searchQueryFromUrl && filters.q) {
      console.log("[InternshipsPage] URL q is empty, but filters.q is not. Clearing filters.q.");
      setFilters(prevFilters => ({ ...prevFilters, q: '' }));
      shouldFetch = false; 
    }

    const fetchInternships = async () => {
      setLoading(true);
      setError(null);
      // Log the filters *as they are when fetchInternships is actually called*
      console.log("[InternshipsPage] fetchInternships CALLED. Filters for API:", JSON.stringify(filters), "Page:", currentPage);
      try {
        const params = [];
        // Use the filters state directly as it should be up-to-date when this fetch is effectively run
        if (filters.domain) params.push(`domain=${filters.domain}`);
        if (filters.location) params.push(`location=${filters.location}`);
        if (filters.company) params.push(`company=${filters.company}`);
        if (filters.cgpaCutoff) params.push(`cgpaCutoff=${filters.cgpaCutoff}`);
        if (filters.q) params.push(`q=${filters.q}`);
        
        params.push(`page=${currentPage}`);
        params.push(`limit=${itemsPerPage}`);
        
        const queryString = params.length ? `?${params.join('&')}` : '';
        console.log("[InternshipsPage] API query string to be sent:", queryString);
        const response = await axiosInstance.get(`/internships${queryString}`);
        
        if (isMounted) {
          if (response.data && Array.isArray(response.data.internships) && typeof response.data.totalPages === 'number') {
            setInternships(response.data.internships);
            setTotalPages(response.data.totalPages);
          } else {
            // Fallback for old API structure, assuming it returns just an array
            if(Array.isArray(response.data)) {
              setInternships(response.data);
              setTotalPages(1); // Assume single page if old structure
              console.warn("API response structure is outdated. Expected { internships: [], totalPages: X }");
            } else {
              setError('Invalid data format received from server. Expected { internships: [], totalPages: X }');
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

    // Only fetch if filters weren't just updated in this same effect run
    if (shouldFetch) {
        console.log("[InternshipsPage] Proceeding with fetchInternships call.");
        fetchInternships();
    } else {
        console.log("[InternshipsPage] Skipping fetch in this run as filters were just updated.");
    }

    return () => {
      isMounted = false;
    };
  }, [filters, currentPage, itemsPerPage, location.search]); // filters.q is implicitly covered by 'filters'

  const handleLocalSearchChange = (e) => {
    setLocalSearchTerm(e.target.value);
  };

  const handleLocalSearchSubmit = (e) => {
    e.preventDefault();
    if (localSearchTerm.trim() !== filters.q) {
      setFilters(prev => ({ ...prev, q: localSearchTerm.trim() }));
      setCurrentPage(1);
      // Update URL to reflect the new search term
      navigate(`/internships?q=${encodeURIComponent(localSearchTerm.trim())}`, { replace: true });
    } else if (!localSearchTerm.trim() && filters.q) {
      // If search box is cleared and submitted, clear the filter and URL q param
      clearFilters(); // This already handles clearing filters.q and navigating
    }
  };

  // Generic handler for react-select based filters
  const handleSelectFilterChange = (filterName, selectedValue) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: selectedValue || '' // Handle clear
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleViewDetails = (internshipId) => {
    navigate(`/internships/${internshipId}`);
  };

  const clearFilters = () => {
    setFilters({ domain: '', location: '', company: '', cgpaCutoff: '', q: '' });
    setLocalSearchTerm(''); // Clear local search term as well
    setCurrentPage(1); 
    navigate('/internships', { replace: true }); 
  };

  // Sort internships: active first, then expired, then by original sort (e.g., createdAt from backend)
  const sortedInternships = [...internships].sort((a, b) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
    const deadlineA = new Date(a.deadline);
    const deadlineB = new Date(b.deadline);
  
    const aHasPassed = deadlineA < today;
    const bHasPassed = deadlineB < today;
  
    if (aHasPassed && !bHasPassed) {
      return 1; // a (passed) goes after b (active)
    }
    if (!aHasPassed && bHasPassed) {
      return -1; // a (active) goes before b (passed)
    }
    // If both passed or both not passed, rely on original backend sort (usually by createdAt desc for newness)
    // To explicitly sort by deadline if needed (e.g. nearest deadline first for active ones):
    // if (!aHasPassed && !bHasPassed) return deadlineA - deadlineB; // Active ones, nearest deadline first
    // if (aHasPassed && bHasPassed) return deadlineA - deadlineB; // Passed ones, nearest deadline first (less critical)
    return 0; 
  });

  return (
    <div className="animate-fade-in-up min-h-screen">
      {/* Hero Section */}
      <section
        aria-label="Internships hero section"
        className="relative flex items-stretch justify-stretch min-h-[300px] w-full overflow-hidden"
      >
        <div aria-hidden="true" className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-blue-700 opacity-30 blur-3xl" />
        <div aria-hidden="true" className="absolute bottom-0 right-10 w-64 h-64 rounded-full bg-black opacity-25 blur-2xl" />
        <div aria-hidden="true" className="absolute top-10 right-32 w-48 h-48 rounded-full bg-purple-600 opacity-20 blur-2xl" />

        <div className="relative bg-gradient-to-br from-blue-800 via-indigo-700 to-purple-600 bg-opacity-70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-[0_20px_50px_rgba(59,130,246,0.4)] w-full max-w-full px-12 py-14 text-center z-10 sm:mx-0">
          <span className="inline-flex justify-center mb-8">
            <BriefcaseIcon
              className="drop-shadow-lg"
              style={{ width: 64, height: 64, color: '#e0d3f5' }}
              aria-hidden="true"
            />
          </span>
          <h1 className="text-5xl font-extrabold mb-4 text-white drop-shadow-lg leading-tight">
            Available Internships
          </h1>
          <p className="text-xl text-white/90 mx-auto drop-shadow-lg px-4 sm:px-0 max-w-xl">
            Discover and apply for internships that match your skills and interests
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <div className="mb-8 p-4 bg-brand-surface/50 dark:bg-brand-dark/50 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Filter Internships</h2>
            
            {/* General Search Input */}
            <form onSubmit={handleLocalSearchSubmit} className="mb-6">
              <label htmlFor="internship-search" className="block text-sm font-medium mb-1">
                Search Internships
              </label>
              <div className="relative flex items-center">
                <MagnifyingGlassIcon className="absolute left-3 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input
                  type="search"
                  id="internship-search"
                  placeholder="Search by role, company, skill, location, or keywords..."
                  value={localSearchTerm}
                  onChange={handleLocalSearchChange}
                  className="input-field w-full !pl-10 !py-2.5 !bg-white dark:!bg-brand-dark focus:!ring-brand-primary focus:!border-brand-primary"
                />
                {/* Optional: Add a search button if you don't want to rely only on Enter */}
                {/* <button type="submit" className="btn btn-primary ml-2">Search</button> */}
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="domain" className="block text-sm font-medium mb-1">Domain</label>
                <DomainFilter 
                  value={filters.domain}
                  onChange={(value) => handleSelectFilterChange('domain', value)}
                  options={domainOptions}
                  variant="minimal"
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium mb-1">Location</label>
                <LocationFilter 
                  value={filters.location}
                  onChange={(value) => handleSelectFilterChange('location', value)}
                  options={locationOptions}
                  variant="minimal"
                />
              </div>
              <div>
                <label htmlFor="company" className="block text-sm font-medium mb-1">Company</label>
                <CompanyFilter 
                  value={filters.company}
                  onChange={(value) => handleSelectFilterChange('company', value)}
                  options={companyOptions}
                  variant="minimal"
                />
              </div>
              <div>
                <label htmlFor="cgpaCutoff" className="block text-sm font-medium mb-1">CGPA Cutoff</label>
                <CgpaFilter 
                  value={filters.cgpaCutoff}
                  onChange={(value) => handleSelectFilterChange('cgpaCutoff', value)}
                  options={cgpaOptions}
                  variant="minimal"
                />
              </div>
            </div>
            <div className="mt-4 text-right">
              <button 
                onClick={clearFilters} 
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Internships List */}
          <div className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <ErrorMessage title="Error Loading Internships" message={error} />
            ) : sortedInternships.length === 0 ? (
              <div className="text-center py-12">
                <BuildingOffice2Icon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">No internships found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your filters or check back later for new opportunities.
                </p>
              </div>
            ) : (
              sortedInternships.map((internship) => {
                return (
                  <InternshipCard key={internship._id || internship.id} internship={internship} />
                );
              })
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
                className="btn btn-secondary px-4 py-2 rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || loading}
                className="btn btn-secondary px-4 py-2 rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
