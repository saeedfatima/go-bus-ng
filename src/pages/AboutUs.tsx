import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Bus, 
  Users, 
  Shield, 
  Clock, 
  Heart, 
  Target,
  Award,
  MapPin
} from 'lucide-react';

const AboutUs = () => {
  const values = [
    {
      icon: Shield,
      title: 'Safety First',
      description: 'Every journey is backed by rigorous safety standards and verified operators.',
    },
    {
      icon: Clock,
      title: 'Reliability',
      description: 'On-time departures and arrivals you can count on, every single trip.',
    },
    {
      icon: Heart,
      title: 'Customer Care',
      description: 'Dedicated support team ready to assist you at every step of your journey.',
    },
    {
      icon: Target,
      title: 'Innovation',
      description: 'Continuously improving our platform to deliver the best booking experience.',
    },
  ];

  const team = [
    {
      name: 'Adebayo Johnson',
      role: 'Founder & CEO',
      description: 'A transportation industry veteran with 15+ years of experience in Nigerian logistics.',
    },
    {
      name: 'Chioma Okonkwo',
      role: 'Chief Operations Officer',
      description: 'Former operations director at a leading transport company, ensuring seamless service delivery.',
    },
    {
      name: 'Emeka Nwachukwu',
      role: 'Chief Technology Officer',
      description: 'Tech innovator passionate about building solutions that transform African mobility.',
    },
    {
      name: 'Fatima Abdullahi',
      role: 'Head of Customer Experience',
      description: 'Dedicated to creating exceptional experiences for every GoBus traveler.',
    },
  ];

  const milestones = [
    { year: '2020', event: 'GoBus Nigeria founded in Lagos with a vision to transform intercity travel.' },
    { year: '2021', event: 'Partnered with 10 major bus companies, covering 50+ routes across Nigeria.' },
    { year: '2022', event: 'Launched mobile app and reached 100,000 successful bookings.' },
    { year: '2023', event: 'Expanded to cover all 36 states with 200+ partner companies.' },
    { year: '2024', event: 'Introduced multi-passenger booking and real-time seat selection.' },
    { year: '2025', event: 'Serving over 1 million happy travelers across Nigeria.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
                <Bus className="h-4 w-4" />
                About GoBus Nigeria
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
                Connecting Nigeria,{' '}
                <span className="text-primary">One Journey at a Time</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                We're on a mission to make intercity travel in Nigeria safe, convenient, 
                and accessible for everyone. From Lagos to Kano, Abuja to Port Harcourt, 
                we're transforming how Nigerians move.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="font-display text-3xl font-bold mb-4">Our Mission</h2>
                  <p className="text-muted-foreground mb-4">
                    To revolutionize intercity transportation in Nigeria by providing a seamless, 
                    technology-driven platform that connects travelers with safe, reliable, and 
                    affordable bus services.
                  </p>
                  <p className="text-muted-foreground">
                    We believe every Nigerian deserves access to comfortable, dignified travel 
                    experiences, regardless of their destination or budget.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-8 text-center">
                  <Award className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="font-display text-2xl font-bold mb-2">Our Vision</h3>
                  <p className="text-muted-foreground">
                    To become Africa's most trusted and innovative transportation booking platform, 
                    setting the standard for excellence in travel technology.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Company History */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-display text-3xl font-bold mb-4">Our Journey</h2>
                <p className="text-muted-foreground">
                  From a small startup to Nigeria's leading bus booking platform
                </p>
              </div>
              
              <div className="relative">
                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-0.5" />
                
                <div className="space-y-8">
                  {milestones.map((milestone, index) => (
                    <div 
                      key={milestone.year}
                      className={`relative flex items-center gap-4 md:gap-8 ${
                        index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                      }`}
                    >
                      <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'} hidden md:block`}>
                        <Card className="inline-block">
                          <CardContent className="p-4">
                            <p className="text-muted-foreground">{milestone.event}</p>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold shrink-0">
                        {milestone.year.slice(-2)}
                      </div>
                      
                      <div className="flex-1 md:hidden">
                        <Card>
                          <CardContent className="p-4">
                            <span className="text-primary font-semibold">{milestone.year}</span>
                            <p className="text-muted-foreground mt-1">{milestone.event}</p>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className={`flex-1 hidden md:block ${index % 2 === 0 ? '' : 'text-right'}`}>
                        <span className="text-2xl font-bold text-primary">{milestone.year}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold mb-4">Our Core Values</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                These principles guide everything we do at GoBus Nigeria
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {values.map((value) => (
                <Card key={value.title} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-xl mb-4">
                      <value.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-display text-lg font-semibold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold mb-4">Meet Our Team</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The passionate individuals behind GoBus Nigeria's success
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {team.map((member) => (
                <Card key={member.name} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-10 w-10 text-primary/60" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-center">{member.name}</h3>
                    <p className="text-primary text-sm text-center mb-2">{member.role}</p>
                    <p className="text-sm text-muted-foreground text-center">{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">1M+</div>
                <p className="text-primary-foreground/80">Happy Travelers</p>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">200+</div>
                <p className="text-primary-foreground/80">Partner Companies</p>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
                <p className="text-primary-foreground/80">Routes Covered</p>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">36</div>
                <p className="text-primary-foreground/80">States Served</p>
              </div>
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="font-display text-3xl font-bold mb-4">Our Headquarters</h2>
              <p className="text-muted-foreground mb-2">
                15 Admiralty Way, Lekki Phase 1
              </p>
              <p className="text-muted-foreground mb-2">
                Lagos, Nigeria
              </p>
              <p className="text-muted-foreground">
                Email: hello@gobus.ng | Phone: +234 800 GO BUSES
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default AboutUs;
