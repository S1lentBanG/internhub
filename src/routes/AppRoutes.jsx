// src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage'; 
import NotFoundPage from '../pages/NotFound'; // Renamed to match usage
import PostInternshipPage from '../pages/PostInternshipPage';
import InternshipsPage from '../pages/InternshipsPage';
import InternshipDetailsPage from '../pages/InternshipDetailsPage';
import Dashboard from '../pages/Dashboard';
import EditProfilePage from '../pages/EditProfilePage';
import EditInternshipPage from '../pages/ccpd/EditInternshipPage';
import ManageApplicationsPage from '../pages/ccpd/ManageApplicationsPage';
import AnalyticsPage from '../pages/ccpd/AnalyticsPage';

import MyPostedInternshipsPage from '../pages/MyPostedInternshipsPage';
import ProtectedRoute from '../components/ProtectedRoute';

// Temporary placeholder component until real components are created
const PlaceholderPage = ({ pageName }) => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-12 px-4">
    <h1 className="text-3xl font-bold mb-4">Under Construction</h1>
    <p className="text-lg mb-6">The {pageName} is currently being developed.</p>
    <p>Please check back later.</p>
  </div>
);

// Placeholder components until real ones are created
const ApplicationPage = () => <PlaceholderPage pageName="Application Page" />;

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/internships" element={<InternshipsPage />} />
      <Route path="/internships/:id" element={<InternshipDetailsPage />} />
      
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route 
        path="/profile/edit" 
        element={ 
          <ProtectedRoute allowedRoles={['student', 'ccpd', 'admin']}>
            <EditProfilePage />
          </ProtectedRoute>
        }
      />
      
      <Route 
        path="/post-internship" 
        element={ 
          <ProtectedRoute allowedRoles={['ccpd', 'admin']}>
            <PostInternshipPage />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/apply/:internshipId" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <ApplicationPage />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/ccpd/manage-internships" 
        element={ 
          <ProtectedRoute allowedRoles={['ccpd', 'admin']}>
            <MyPostedInternshipsPage />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/ccpd/edit-internship/:id" 
        element={ 
          <ProtectedRoute allowedRoles={['ccpd', 'admin']}>
            <EditInternshipPage />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/ccpd/manage-applications" 
        element={ 
          <ProtectedRoute allowedRoles={['ccpd', 'admin']}>
            <ManageApplicationsPage />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/ccpd/analytics" 
        element={ 
          <ProtectedRoute allowedRoles={['ccpd', 'admin']}>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}