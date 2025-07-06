import React from 'react';
import { Link } from 'react-router-dom';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-10rem)] py-12 px-4 sm:px-6 lg:px-8">
      <ExclamationCircleIcon className="h-20 w-20 text-brand-accent mb-6 animate-subtle-pulse" />
      <h1 className="text-5xl sm:text-6xl font-bold text-text-main dark:text-text-main-dark mb-4">
        404
      </h1>
      <h2 className="text-2xl sm:text-3xl font-semibold text-text-main dark:text-text-main-dark mb-6">
        Oops! Page Not Found.
      </h2>
      <p className="text-lg text-text-muted dark:text-text-muted-dark mb-10 max-w-md">
        The page you're looking for doesn't exist or has been moved. Let's get you back on track.
      </p>
      <Link
        to="/"
        className="btn btn-primary text-base px-8 py-3"
      >
        Go Back to Homepage
      </Link>
    </div>
  );
}
