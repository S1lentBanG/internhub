import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { UserCircleIcon, LockClosedIcon, PhotoIcon } from '@heroicons/react/24/outline';

export default function EditProfilePage() {
  const { currentUser, setCurrentUser } = useAuth();
  const [name, setName] = useState(currentUser?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(currentUser?.profilePic || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      // Construct full URL for profile picture if it's a relative path
      if (currentUser.profilePic && !currentUser.profilePic.startsWith('http')) {
        setProfilePicPreview(`http://localhost:5000${currentUser.profilePic}`);
      } else {
        setProfilePicPreview(currentUser.profilePic || '');
      }
    }
  }, [currentUser]);

  const handleNameChange = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim() === currentUser?.name) {
      //setError('Please enter a new name, or a name different from the current one.');
      // Allow submitting the same name if the user just wants to click save without changes, or handle as no-op
      if (name.trim() === currentUser?.name) {
        setSuccessMessage('Name is already up to date.');
        return;
      }
      if(!name.trim()){
        setError('Name cannot be empty.');
        return;
      }
    }
    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const response = await axiosInstance.put('/users/update-profile', { name: name.trim() });
      if (response.data && response.data.user) {
        setCurrentUser(prevUser => ({
          ...prevUser,
          name: response.data.user.name,
        }));
        setSuccessMessage(response.data.message || 'Name updated successfully!');
      } else {
        setError('Failed to update name. Invalid response from server.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update name.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (!currentPassword) {
      setError('Please enter your current password.');
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.put('/users/update-password', { 
        currentPassword,
        newPassword 
      });
      
      setSuccessMessage(response.data.message || 'Password updated successfully!');
      // Clear password fields after successful update
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePicUpload = async (e) => {
    e.preventDefault();
    // TODO: Implement profile picture upload logic
    setSuccessMessage('Profile picture update not yet implemented.');
  };

  if (!currentUser) {
    return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner /></div>;
  }

  const cardBaseClass = "bg-brand-surface/80 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-xl border border-border-color";

  return (
    <div className="min-h-screen bg-brand-dark text-text-primary py-8 sm:py-12 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-8 text-center">
          Edit Your Profile
        </h1>

        {error && <ErrorMessage title="Update Error" message={error} className="mb-6" />}
        {successMessage && <div className="mb-6 p-4 text-sm text-green-700 bg-green-100 border border-green-400 rounded-md">{successMessage}</div>}

        {/* Update Name - Placeholder for now */}
        <form onSubmit={handleNameChange} className={`${cardBaseClass} mb-8`}>
          <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center">
            <UserCircleIcon className="h-6 w-6 mr-2 text-brand-accent" /> Personal Information
          </h2>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field w-full"
              placeholder="Your Name"
            />
          </div>
           <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">Email (Cannot be changed)</label>
            <input
              type="email"
              id="email"
              value={currentUser.email}
              disabled
              className="input-field w-full bg-brand-dark/50 cursor-not-allowed"
            />
          </div>
          <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={loading || name === currentUser?.name}>
            {loading ? <LoadingSpinner size="sm" /> : 'Save Name Changes'}
          </button>
        </form>

        {/* Change Password */}
        <form onSubmit={handlePasswordChange} className={`${cardBaseClass} mb-8`}>
          <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center">
            <LockClosedIcon className="h-6 w-6 mr-2 text-brand-accent" /> Change Password
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-text-secondary mb-1">Current Password</label>
              <input type="password" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-field w-full" required />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-text-secondary mb-1">New Password</label>
              <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field w-full" required />
            </div>
            <div>
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-text-secondary mb-1">Confirm New Password</label>
              <input type="password" id="confirmNewPassword" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="input-field w-full" required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-full sm:w-auto mt-6" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" /> : 'Update Password'}
          </button>
        </form>

        {/* Update Profile Picture */}
        <form onSubmit={handleProfilePicUpload} className={`${cardBaseClass}`}>
          <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center">
            <PhotoIcon className="h-6 w-6 mr-2 text-brand-accent" /> Profile Picture
          </h2>
          <div className="flex flex-col items-center sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-brand-dark flex items-center justify-center border-2 border-border-color">
              {profilePicPreview ? (
                <img src={profilePicPreview} alt="Profile Preview" className="w-full h-full object-cover" />
              ) : (
                <UserCircleIcon className="w-24 h-24 text-text-secondary" />
              )}
            </div>
            <div className="flex-grow">
              <label htmlFor="profilePic" className="block text-sm font-medium text-text-secondary mb-2">Choose a new profile picture</label>
              <input 
                type="file" 
                id="profilePic" 
                accept="image/png, image/jpeg, image/gif" 
                onChange={handleProfilePicChange} 
                className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary cursor-pointer"
              />
              <p className="mt-1 text-xs text-text-tertiary">PNG, JPG, GIF up to 2MB.</p>
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-full sm:w-auto mt-6" disabled={loading || !profilePicFile}>
            {loading ? <LoadingSpinner size="sm" /> : 'Upload Picture'}
          </button>
        </form>

      </div>
    </div>
  );
} 