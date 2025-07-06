import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import DomainFilter from './DomainFilter';
import LocationFilter from './LocationFilter';
import CompanyFilter from './CompanyFilter';
import CgpaFilter from './CgpaFilter';

export default function FilterBar({
  filters,
  setFilters,
  domainOptions = [],
  locationOptions = [],
  companyOptions = [],
  cgpaOptions = []
}) {
  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      domain: '',
      location: '',
      company: '',
      cgpaCutoff: ''
    });
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="mb-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-sm font-medium text-text-secondary">Filter by:</span>
          
          <div className="flex-grow-0">
            <DomainFilter 
              value={filters.domain} 
              onChange={(value) => setFilters(prev => ({ ...prev, domain: value }))} 
              options={domainOptions}
            />
          </div>
          
          <div className="flex-grow-0">
            <LocationFilter 
              value={filters.location} 
              onChange={(value) => setFilters(prev => ({ ...prev, location: value }))} 
              options={locationOptions}
            />
          </div>
          
          <div className="flex-grow-0">
            <CompanyFilter 
              value={filters.company} 
              onChange={(value) => setFilters(prev => ({ ...prev, company: value }))} 
              options={companyOptions}
            />
          </div>
          
          <div className="flex-grow-0">
            <CgpaFilter
              value={filters.cgpaCutoff}
              onChange={(value) => setFilters(prev => ({ ...prev, cgpaCutoff: value }))}
              options={cgpaOptions}
            />
          </div>
          
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-brand-accent hover:text-brand-accent-hover underline ml-auto"
            >
              Clear all filters
            </button>
          )}
        </div>
        
        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs text-text-secondary">Active filters:</span>
            
            {filters.domain && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-accent/20 text-brand-accent">
                Domain: {filters.domain}
                <button 
                  onClick={() => setFilters(f => ({ ...f, domain: '' }))}
                  className="ml-1.5 bg-brand-accent/30 rounded-full p-0.5 hover:bg-brand-accent/50"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {filters.location && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-accent/20 text-brand-accent">
                Location: {filters.location}
                <button 
                  onClick={() => setFilters(f => ({ ...f, location: '' }))}
                  className="ml-1.5 bg-brand-accent/30 rounded-full p-0.5 hover:bg-brand-accent/50"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {filters.company && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-accent/20 text-brand-accent">
                Company: {filters.company}
                <button 
                  onClick={() => setFilters(f => ({ ...f, company: '' }))}
                  className="ml-1.5 bg-brand-accent/30 rounded-full p-0.5 hover:bg-brand-accent/50"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {filters.cgpaCutoff && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-accent/20 text-brand-accent">
                CGPA: {filters.cgpaCutoff}+
                <button 
                  onClick={() => setFilters(f => ({ ...f, cgpaCutoff: '' }))}
                  className="ml-1.5 bg-brand-accent/30 rounded-full p-0.5 hover:bg-brand-accent/50"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}