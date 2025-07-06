import { InternshipCard } from './InternshipCard';

export const InternshipGrid = ({ internships }) => {
  if (!internships || internships.length === 0) {
    return (
      <div className="text-center py-12 text-slate-600">
        <p className="text-xl">No internships available at the moment. Please check back later!</p>
      </div>
    );
  }

  return (
    <section className="py-16 bg-slate-100">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">
          Latest Internship Opportunities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {internships.map((internship) => (
            <InternshipCard key={internship.id} internship={internship} />
          ))}
        </div>
      </div>
    </section>
  );
};