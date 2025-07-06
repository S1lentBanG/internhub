import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export const ErrorMessage = ({ title = "An Error Occurred", message }) => {
  return (
    <div className="my-8 p-4 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700" role="alert">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-500 dark:text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-semibold text-red-700 dark:text-red-300">{title}</h3>
          {message && (
            <div className="mt-1 text-sm text-red-600 dark:text-red-400">
              <p>{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};