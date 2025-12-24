import SearchForm from './SearchForm';

const HeroSection = () => {
  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-center bg-gradient-hero overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center mb-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Over 100,000+ trips booked
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-slide-up">
            Book Your Next
            <span className="block text-gradient">Bus Journey</span>
            Across Nigeria
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
            Compare prices from multiple bus companies, choose your seats, and book tickets online in minutes. Safe, reliable, and affordable.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-10 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="text-center">
              <p className="font-display text-3xl font-bold text-foreground">15+</p>
              <p className="text-sm text-muted-foreground">Bus Companies</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl font-bold text-foreground">200+</p>
              <p className="text-sm text-muted-foreground">Routes</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl font-bold text-foreground">36</p>
              <p className="text-sm text-muted-foreground">States Covered</p>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className="max-w-5xl mx-auto animate-slide-up" style={{ animationDelay: '300ms' }}>
          <SearchForm />
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
