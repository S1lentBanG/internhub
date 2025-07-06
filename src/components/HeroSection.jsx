import React from 'react';

export const HeroSection = () => {
  return (
    <section className="bg-brand-surface py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-text-primary mb-12">
          Empowering NITW Students' Careers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-brand-primary rounded-full p-4 inline-block mb-4">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">CCPD Integration</h3>
            <p className="text-text-secondary">
              Seamlessly access CCPD-approved internships and stay updated with the latest campus recruitment drives.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-brand-secondary rounded-full p-4 inline-block mb-4">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">Industry Exposure</h3>
            <p className="text-text-secondary">
              Connect with NITW alumni and gain insights into various industries through exclusive webinars and mentorship programs.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-brand-accent rounded-full p-4 inline-block mb-4">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">Career Planning</h3>
            <p className="text-text-secondary">
              Align internships with NITW's academic curriculum and get personalized recommendations based on your branch and interests.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};