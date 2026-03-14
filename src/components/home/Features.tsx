import { Shield, CreditCard, Clock, Headphones, MapPin, Ticket } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Safe & Secure',
    description: 'All our partner companies are verified and follow strict safety standards.',
  },
  {
    icon: CreditCard,
    title: 'Easy Payments',
    description: 'Pay securely with Paystack, Flutterwave, bank transfer, or USSD.',
  },
  {
    icon: Clock,
    title: 'Real-time Updates',
    description: 'Get instant notifications about your trip status and schedule changes.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Our customer service team is always ready to assist you.',
  },
  {
    icon: MapPin,
    title: 'Track Your Bus',
    description: 'Live tracking to know exactly when your bus arrives.',
  },
  {
    icon: Ticket,
    title: 'E-Ticket',
    description: 'Download your ticket instantly. No printing needed!',
  },
];

const Features = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-hero">
      <div className="container">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Why Choose Us
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Travel Made Simple
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We've designed every aspect of your journey to be as smooth and convenient as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
