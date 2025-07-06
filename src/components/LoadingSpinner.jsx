export const LoadingSpinner = ({ size = 'md', message = "Loading, please wait..." }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  return (
    <div className="flex flex-col justify-center items-center py-12 space-y-4 text-center">
      <div className={`relative ${sizeClasses[size]}`}>
        <div className="absolute inset-0 border-4 border-brand-neutral-light dark:border-brand-primary-light rounded-full"></div>
        <div className={`absolute inset-0 border-t-4 border-brand-accent rounded-full animate-spin`}></div>
      </div>
      {message && <p className="text-sm text-text-muted dark:text-text-muted-dark animate-subtle-pulse">{message}</p>}
    </div>
  );
};