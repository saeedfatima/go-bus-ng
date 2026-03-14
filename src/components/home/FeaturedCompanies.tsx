import { companies } from '@/data/mockData';
import { Star, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeaturedCompanies = () => {
  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Trusted Partners
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Travel with Nigeria's Best
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We partner with verified transport companies to ensure your safety and comfort on every journey.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {companies.map((company, index) => (
            <div
              key={company.id}
              className="group bg-card rounded-xl p-6 border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="text-4xl mb-3">{company.logo}</div>
                <div className="flex items-center gap-1 mb-2">
                  <h3 className="font-display font-semibold text-foreground">
                    {company.name}
                  </h3>
                  {company.isVerified && (
                    <CheckCircle className="h-4 w-4 text-primary fill-primary/20" />
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <Star className="h-4 w-4 text-warning fill-warning" />
                  <span>{company.rating}</span>
                  <span>•</span>
                  <span>{company.totalTrips.toLocaleString()} trips</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            to="/companies"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            View all companies
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCompanies;
