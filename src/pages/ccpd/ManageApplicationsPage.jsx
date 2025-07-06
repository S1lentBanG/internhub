import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import { useNavigate } from 'react-router-dom';

const APPLICATION_STATUSES = [
  'Applied',
  'Under Review',
  'Shortlisted',
  'Interviewing',
  'Offered',
  'Not Selected',
  'Withdrawn',
];

export default function ManageApplicationsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [internships, setInternships] = useState([]);
  const [selectedInternshipId, setSelectedInternshipId] = useState('');
  const [applications, setApplications] = useState([]);
  
  const [loadingInternships, setLoadingInternships] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(false);
  
  const [errorInternships, setErrorInternships] = useState(null);
  const [errorApplications, setErrorApplications] = useState(null);
  const [updateStatusError, setUpdateStatusError] = useState(null);
  const [updateStatusSuccess, setUpdateStatusSuccess] = useState('');

  // State for bulk updates
  const [selectedApplicationIds, setSelectedApplicationIds] = useState(new Set());
  const [bulkSelectedStatus, setBulkSelectedStatus] = useState('');
  const [bulkUpdateLoading, setBulkUpdateLoading] = useState(false);
  const [bulkUpdateError, setBulkUpdateError] = useState(null);
  const [bulkUpdateSuccess, setBulkUpdateSuccess] = useState('');

  // Redirect if not CCPD/Admin
  useEffect(() => {
    if (currentUser && !['ccpd', 'admin'].includes(currentUser.role)) {
      navigate('/'); 
    }
  }, [currentUser, navigate]);

  // Fetch internships for the dropdown
  useEffect(() => {
    const fetchInternshipsForSelection = async () => {
      setLoadingInternships(true);
      setErrorInternships(null);
      try {
        // TODO: For CCPD role, ideally filter by internships postedBy them.
        // For Admin, show all. For now, fetching all for simplicity.
        const response = await axiosInstance.get('/internships?limit=500'); // Get a good number for selection
        setInternships(response.data.internships || []);
      } catch (err) {
        setErrorInternships(err.response?.data?.message || 'Failed to load internships for selection.');
      }
      setLoadingInternships(false);
    };
    if (currentUser && ['ccpd', 'admin'].includes(currentUser.role)){
        fetchInternshipsForSelection();
    }
  }, [currentUser]);

  // Fetch applications when an internship is selected
  useEffect(() => {
    // Reset selections and bulk status when internship changes
    setSelectedApplicationIds(new Set());
    setBulkSelectedStatus('');
    setBulkUpdateError(null);
    setBulkUpdateSuccess('');
    setUpdateStatusError(null); // also clear single update messages
    setUpdateStatusSuccess('');

    if (!selectedInternshipId) {
      setApplications([]);
      return;
    }

    const fetchApplicationsForInternship = async () => {
      setLoadingApplications(true);
      setErrorApplications(null);
      try {
        const response = await axiosInstance.get(`/applications/internship/${selectedInternshipId}`);
        setApplications(response.data || []);
      } catch (err) {
        setErrorApplications(err.response?.data?.message || 'Failed to load applications for this internship.');
      }
      setLoadingApplications(false);
    };
    fetchApplicationsForInternship();
  }, [selectedInternshipId]);

  const handleInternshipSelectChange = (e) => {
    setSelectedInternshipId(e.target.value);
  };

  // Single status update handler
  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdateStatusError(null);
    setUpdateStatusSuccess('');
    setBulkUpdateError(null); // Clear bulk messages
    setBulkUpdateSuccess('');
    try {
      const response = await axiosInstance.patch(`/applications/${applicationId}/status`, { status: newStatus });
      setApplications(prevApps => 
        prevApps.map(app => app._id === applicationId ? { ...app, status: response.data.status } : app)
      );
      setUpdateStatusSuccess(`Status updated for app ID ${applicationId.slice(-6)} to ${newStatus}.`);
    } catch (err) {
      setUpdateStatusError(err.response?.data?.message || `Failed to update status for app ID ${applicationId.slice(-6)}.`);
    }
  };

  // --- Bulk Update Handlers ---
  const handleSelectAllChange = (e) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      setSelectedApplicationIds(new Set(applications.map(app => app._id)));
    } else {
      setSelectedApplicationIds(new Set());
    }
  };

  const handleApplicationCheckboxChange = (applicationId, isChecked) => {
    setSelectedApplicationIds(prevSelectedIds => {
      const newSelectedIds = new Set(prevSelectedIds);
      if (isChecked) {
        newSelectedIds.add(applicationId);
      } else {
        newSelectedIds.delete(applicationId);
      }
      return newSelectedIds;
    });
  };

  const handleBulkStatusChange = (e) => {
    setBulkSelectedStatus(e.target.value);
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkSelectedStatus || selectedApplicationIds.size === 0) {
      setBulkUpdateError('Please select a status and at least one application.');
      return;
    }
    setBulkUpdateLoading(true);
    setBulkUpdateError(null);
    setBulkUpdateSuccess('');
    setUpdateStatusError(null); // Clear single update messages
    setUpdateStatusSuccess('');

    const promises = Array.from(selectedApplicationIds).map(appId => 
      axiosInstance.patch(`/applications/${appId}/status`, { status: bulkSelectedStatus })
    );

    const results = await Promise.allSettled(promises);

    let successfulUpdates = 0;
    let failedUpdates = 0;
    const updatedApplications = [...applications]; // Clone to update

    results.forEach((result, index) => {
      const appId = Array.from(selectedApplicationIds)[index];
      if (result.status === 'fulfilled') {
        successfulUpdates++;
        const appIndex = updatedApplications.findIndex(app => app._id === appId);
        if (appIndex !== -1) {
          updatedApplications[appIndex] = { ...updatedApplications[appIndex], status: result.value.data.status };
        }
      } else {
        failedUpdates++;
        console.error(`Failed to update ${appId}:`, result.reason);
      }
    });

    setApplications(updatedApplications);

    if (successfulUpdates > 0) {
      setBulkUpdateSuccess(`${successfulUpdates} application(s) updated to ${bulkSelectedStatus}.`);
    }
    if (failedUpdates > 0) {
      setBulkUpdateError(`${failedUpdates} application(s) failed to update. Check console for details.`);
    }
    
    setSelectedApplicationIds(new Set()); // Clear selection
    setBulkSelectedStatus(''); // Reset bulk status selector
    setBulkUpdateLoading(false);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied': return 'bg-blue-200 text-blue-800 dark:bg-blue-700/30 dark:text-blue-300';
      case 'Under Review': return 'bg-yellow-200 text-yellow-800 dark:bg-yellow-700/30 dark:text-yellow-300';
      case 'Shortlisted': return 'bg-purple-200 text-purple-800 dark:bg-purple-700/30 dark:text-purple-300';
      case 'Interviewing': return 'bg-indigo-200 text-indigo-800 dark:bg-indigo-700/30 dark:text-indigo-300';
      case 'Offered': return 'bg-green-200 text-green-800 dark:bg-green-700/30 dark:text-green-300';
      case 'Not Selected': return 'bg-red-200 text-red-800 dark:bg-red-700/30 dark:text-red-300';
      case 'Withdrawn': return 'bg-gray-200 text-gray-800 dark:bg-gray-600/30 dark:text-gray-400';
      default: return 'bg-gray-300 text-gray-700 dark:bg-gray-500/30 dark:text-gray-300';
    }
  };

  // Determine if all current applications are selected (for thead checkbox)
  const areAllApplicationsSelected = applications.length > 0 && selectedApplicationIds.size === applications.length;

  return (
    <div className="min-h-screen bg-brand-surface dark:bg-brand-dark text-text-primary dark:text-text-primary-dark p-4 sm:p-8 animate-fade-in-up">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-primary dark:text-brand-primary-dark">Manage Applications</h1>
        <p className="text-md text-text-secondary dark:text-text-secondary-dark mt-1">
          Select an internship to view and update applicant statuses.
        </p>
      </header>

      {/* Internship Selector */}
      <div className="mb-6">
        <label htmlFor="internship-select" className="block text-sm font-medium mb-1">Select Internship:</label>
        {loadingInternships ? (
          <LoadingSpinner message="Loading internships..." />
        ) : errorInternships ? (
          <ErrorMessage title="Error loading internships" message={errorInternships} />
        ) : (
          <select 
            id="internship-select" 
            value={selectedInternshipId} 
            onChange={handleInternshipSelectChange}
            className="input-field w-full max-w-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
          >
            <option value="">-- Select an Internship --</option>
            {internships.map(internship => (
              <option key={internship._id} value={internship._id}>
                {internship.title} ({internship.companyName})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Single Update Status Messages */}
      {updateStatusSuccess && 
        <div className="my-4 p-3 text-sm text-green-700 bg-green-100 border border-green-400 rounded-md">
          {updateStatusSuccess}
        </div>
      }
      {updateStatusError && 
        <ErrorMessage title="Status Update Error" message={updateStatusError} className="my-4" />
      }
      
      {/* Bulk Update Status Messages */}
      {bulkUpdateSuccess && 
        <div className="my-4 p-3 text-sm text-green-700 bg-green-100 border border-green-400 rounded-md">
          {bulkUpdateSuccess}
        </div>
      }
      {bulkUpdateError && 
        <ErrorMessage title="Bulk Status Update Error" message={bulkUpdateError} className="my-4" />
      }

      {/* Bulk Action UI - Appears when items are selected */}
      {selectedApplicationIds.size > 0 && selectedInternshipId && (
        <div className="my-6 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Bulk Update Selected ({selectedApplicationIds.size})</h3>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <select 
              value={bulkSelectedStatus}
              onChange={handleBulkStatusChange}
              className="input-field !py-2 !px-3 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-brand-primary focus:border-brand-primary w-full sm:w-auto"
            >
              <option value="">-- Select Status --</option>
              {APPLICATION_STATUSES.map(statusVal => (
                <option key={statusVal} value={statusVal}>{statusVal}</option>
              ))}
            </select>
            <button 
              onClick={handleBulkStatusUpdate}
              disabled={!bulkSelectedStatus || bulkUpdateLoading}
              className="btn btn-primary w-full sm:w-auto disabled:opacity-50"
            >
              {bulkUpdateLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              Apply to Selected
            </button>
          </div>
        </div>
      )}

      {/* Applications Table/List */}
      {selectedInternshipId && loadingApplications && (
        <div className="mt-6 flex justify-center">
          <LoadingSpinner message="Loading applications..." />
        </div>
      )}
      {selectedInternshipId && errorApplications && (
        <ErrorMessage title="Error loading applications" message={errorApplications} className="mt-6" />
      )}
      {selectedInternshipId && !loadingApplications && !errorApplications && (
        applications.length === 0 ? (
          <p className="mt-6 text-center text-text-secondary dark:text-text-secondary-dark">No applications found for this internship.</p>
        ) : (
          <div className="mt-6 overflow-x-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-12">
                    <input 
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-brand-primary accent-brand-primary rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-brand-primary/50 transition duration-150 ease-in-out cursor-pointer"
                      checked={areAllApplicationsSelected}
                      onChange={handleSelectAllChange}
                      aria-label="Select all applications"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Applicant Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Branch</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Applied At</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Current Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Change Status (Single)</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {applications.map(app => (
                  <tr key={app._id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 ${selectedApplicationIds.has(app._id) ? 'bg-brand-primary/10 dark:bg-brand-primary/20' : ''}`}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-brand-primary accent-brand-primary rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-brand-primary/50 transition duration-150 ease-in-out cursor-pointer"
                        checked={selectedApplicationIds.has(app._id)}
                        onChange={(e) => handleApplicationCheckboxChange(app._id, e.target.checked)}
                        aria-label={`Select application from ${app.student?.name || 'N/A'}`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{app.student?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{app.student?.email || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{app.student?.branch || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(app.appliedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select 
                        value={app.status}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        className="input-field !text-xs !py-1 !px-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-brand-primary focus:border-brand-primary"
                        disabled={bulkUpdateLoading} // Disable individual update during bulk update
                      >
                        {APPLICATION_STATUSES.map(statusVal => (
                          <option key={statusVal} value={statusVal}>{statusVal}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
} 