import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Link } from 'react-router-dom';
import { EyeIcon, PencilIcon, TrashIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

export default function MyPostedInternshipsPage() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Can be adjusted

  // State for delete operations
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchMyInternships = async () => {
      setLoading(true);
      setError(null);
      try {
        // CCPD/Admin likely see all internships for management
        const params = new URLSearchParams();
        params.append('page', currentPage);
        params.append('limit', itemsPerPage);
        
        const response = await axiosInstance.get(`/internships?${params.toString()}`);
        
        if (isMounted) {
          if (response.data && Array.isArray(response.data.internships) && typeof response.data.totalPages === 'number') {
            setInternships(response.data.internships);
            console.log("Fetched internships for MyPostedInternshipsPage:", response.data.internships);
            setTotalPages(response.data.totalPages);
          } else {
            setError('Invalid data format received from server.');
            setInternships([]); // Ensure internships is an array
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err?.response?.data?.message ||
            err?.message ||
            'Failed to load internships. Please try again later.'
          );
          setInternships([]); // Ensure internships is an array on error
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMyInternships();

    return () => {
      isMounted = false;
    };
  }, [currentPage, itemsPerPage]);

  const handleDeleteInternship = async (internshipId) => {
    setDeleteError(null); // Clear previous errors
    setDeleteSuccessMessage(null); // Clear previous success messages

    if (!internshipId) {
      console.error("Attempted to delete with undefined ID for an internship.");
      setDeleteError("Cannot delete: Internship ID is missing. Please refresh and try again.");
      return;
    }

    if (window.confirm('Are you sure you want to delete this internship? This will also remove all associated applications.')) {
      setDeleteLoading(true);
      try {
        await axiosInstance.delete(`/internships/${internshipId}`);
        setInternships(prevInternships => prevInternships.filter(internship => internship._id !== internshipId));
        setDeleteSuccessMessage('Internship deleted successfully.');
        // Optionally: refetch or adjust totalPages if on last page and last item deleted, 
        // or if totalItems count is important for pagination accuracy after deletion.
        // For simplicity, we can let pagination adjust on next page load or add a manual refresh.
      } catch (err) {
        const errMsg = err.response?.data?.message || err.message || 'Failed to delete internship.';
        setDeleteError(errMsg);
        console.error("Delete error:", errMsg);
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-brand-surface dark:bg-brand-dark text-text-primary dark:text-text-primary-dark animate-fade-in-up">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-brand-primary dark:text-brand-primary-dark mb-3">
            Manage Posted Internships
          </h1>
          <p className="text-lg text-text-secondary dark:text-text-secondary-dark">
            View, edit, or delete internship listings.
          </p>
        </header>

        {/* Delete Operation Messages */}
        {deleteSuccessMessage && (
          <div className="mb-4 p-3 text-sm text-green-700 bg-green-100 border border-green-400 rounded-md">
            {deleteSuccessMessage}
          </div>
        )}
        {deleteError && (
          <ErrorMessage title="Delete Error" message={deleteError} className="mb-4" />
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" message="Loading internships..." />
          </div>
        ) : error ? (
          <ErrorMessage title="Error Loading Internships" message={error} />
        ) : internships.length === 0 ? (
          <div className="text-center py-20">
            <BriefcaseIcon className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="mt-2 text-xl font-semibold">No internships found.</h3>
            <p className="mt-1 text-md text-text-secondary dark:text-text-secondary-dark">
              There are currently no internships posted, or they couldn't be loaded.
            </p>
            <Link to="/post-internship" className="mt-6 btn btn-primary">
                Post New Internship
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-xl rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Company</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Deadline</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {internships.map((internship) => (
                    <tr key={internship._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{internship.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{internship.type || 'Full-time'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{internship.companyName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{internship.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {new Date(internship.deadline).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 flex items-center">
                        <Link to={`/internships/${internship._id}`} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" title="View Details">
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        <Link to={`/ccpd/edit-internship/${internship._id}`} className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300" title="Edit Internship">
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteInternship(internship._id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete Internship"
                          disabled={deleteLoading} // Disable button when deleteLoading
                        >
                          {deleteLoading ? <LoadingSpinner size="xs" /> : <TrashIcon className="h-5 w-5" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center space-x-3">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || loading}
                  className="btn btn-secondary disabled:opacity-60 px-4 py-2 rounded-lg text-sm"
                >
                  Previous
                </button>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || loading}
                  className="btn btn-secondary disabled:opacity-60 px-4 py-2 rounded-lg text-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Make sure to import BriefcaseIcon if it's not already at the top for the empty state
// import { BriefcaseIcon } from '@heroicons/react/24/outline'; 
// (It seems it's missing from the imports, adding it here conceptually) 