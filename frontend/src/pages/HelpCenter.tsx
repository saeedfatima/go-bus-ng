import { Phone, Mail, MapPin, MessageCircle, Ticket, Shield, HelpCircle, Building2, CreditCard, Luggage } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const faqCategories = [
  {
    title: 'Booking & Tickets',
    icon: Ticket,
    items: [
      {
        question: 'How do I book a bus ticket?',
        answer: 'To book a ticket, simply search for your route on our homepage, select your preferred trip, choose your seats, fill in passenger details, and complete the payment. You will receive an e-ticket via email.'
      },
      {
        question: 'Can I cancel or modify my booking?',
        answer: 'Yes, you can cancel or modify your booking up to 24 hours before departure. Go to "My Bookings" in your account, select the booking, and choose to cancel or modify. Cancellation fees may apply depending on the transport company\'s policy.'
      },
      {
        question: 'How do I get my e-ticket?',
        answer: 'After successful payment, your e-ticket will be sent to your registered email address. You can also view and download it from the "My Bookings" section in your account.'
      },
      {
        question: 'Can I book for multiple passengers?',
        answer: 'Yes! During the booking process, you can select multiple seats and enter details for each passenger. All passengers will be included in the same booking.'
      }
    ]
  },
  {
    title: 'Payments & Refunds',
    icon: CreditCard,
    items: [
      {
        question: 'What payment methods are accepted?',
        answer: 'We accept bank transfers, debit/credit cards (Visa, Mastercard), and mobile payment options like Paystack. All payments are secure and encrypted.'
      },
      {
        question: 'How do refunds work?',
        answer: 'Refunds are processed within 5-7 business days after cancellation approval. The amount refunded depends on the cancellation policy and how far in advance you cancelled.'
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Absolutely. We use industry-standard encryption and secure payment gateways. We never store your full card details on our servers.'
      }
    ]
  },
  {
    title: 'Travel Information',
    icon: Luggage,
    items: [
      {
        question: 'What is the luggage allowance?',
        answer: 'Standard luggage allowance is typically one medium-sized bag (up to 23kg) plus one small carry-on. Policies may vary by transport company, so check your booking details.'
      },
      {
        question: 'How early should I arrive at the terminal?',
        answer: 'We recommend arriving at least 30 minutes before departure time to allow for check-in and boarding procedures.'
      },
      {
        question: 'What happens if my bus is delayed?',
        answer: 'In case of delays, the transport company will notify you via SMS or email. You can also check real-time updates in the "My Bookings" section.'
      },
      {
        question: 'Can I travel with pets?',
        answer: 'Pet policies vary by transport company. Most standard buses do not allow pets, but some companies may have special arrangements. Contact the specific company for details.'
      }
    ]
  },
  {
    title: 'Account & Profile',
    icon: Shield,
    items: [
      {
        question: 'How do I create an account?',
        answer: 'Click "Sign In" at the top of the page, then select "Sign Up". Enter your email, create a password, and verify your email address to complete registration.'
      },
      {
        question: 'How do I reset my password?',
        answer: 'On the login page, click "Forgot Password". Enter your email address and follow the instructions sent to your inbox to reset your password.'
      },
      {
        question: 'How can I update my profile information?',
        answer: 'Log into your account, go to "My Account" or profile settings, and update your information. Remember to save your changes.'
      }
    ]
  },
  {
    title: 'For Transport Companies',
    icon: Building2,
    items: [
      {
        question: 'How can my company join NaijaBus?',
        answer: 'Visit our "For Companies" page and complete the registration form. Our team will review your application and contact you within 3-5 business days.'
      },
      {
        question: 'What are the requirements for partner companies?',
        answer: 'Partner companies must have valid operating licenses, a fleet of well-maintained buses, and meet our safety and service quality standards.'
      },
      {
        question: 'How does the company dashboard work?',
        answer: 'Once approved, you\'ll get access to a dashboard where you can manage routes, buses, trips, and view bookings. Training and support are provided.'
      }
    ]
  }
];

const contactInfo = [
  {
    icon: Phone,
    title: 'Phone Support',
    value: '+234 800 123 4567',
    description: 'Mon-Fri, 8am-8pm WAT'
  },
  {
    icon: Mail,
    title: 'Email Support',
    value: 'support@naijabus.com',
    description: 'Response within 24 hours'
  },
  {
    icon: MessageCircle,
    title: 'Live Chat',
    value: 'Start a chat',
    description: 'Available 24/7'
  },
  {
    icon: MapPin,
    title: 'Head Office',
    value: 'Lagos, Nigeria',
    description: '123 Victoria Island'
  }
];

const HelpCenter = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              We're Here to Help
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Help Center
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Find answers to common questions, get support, and learn how to make 
              the most of your NaijaBus experience.
            </p>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-12 border-b border-border">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/my-bookings">
                <Card className="hover:border-primary/30 hover:shadow-md transition-all cursor-pointer h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <Ticket className="h-8 w-8 text-primary mb-3" />
                    <span className="font-medium">Track Booking</span>
                  </CardContent>
                </Card>
              </Link>
              <Link to="#contact">
                <Card className="hover:border-primary/30 hover:shadow-md transition-all cursor-pointer h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <MessageCircle className="h-8 w-8 text-primary mb-3" />
                    <span className="font-medium">Contact Support</span>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/companies">
                <Card className="hover:border-primary/30 hover:shadow-md transition-all cursor-pointer h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <Building2 className="h-8 w-8 text-primary mb-3" />
                    <span className="font-medium">Partner Companies</span>
                  </CardContent>
                </Card>
              </Link>
              <Link to="#faq">
                <Card className="hover:border-primary/30 hover:shadow-md transition-all cursor-pointer h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <HelpCircle className="h-8 w-8 text-primary mb-3" />
                    <span className="font-medium">FAQs</span>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Browse through our most commonly asked questions organized by category.
              </p>
            </div>

            <div className="grid gap-8 max-w-4xl mx-auto">
              {faqCategories.map((category) => (
                <Card key={category.title}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <category.icon className="h-5 w-5 text-primary" />
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.items.map((item, index) => (
                        <AccordionItem key={index} value={`${category.title}-${index}`}>
                          <AccordionTrigger className="text-left">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                Still Need Help?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Our support team is ready to assist you. Reach out through any of these channels.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {contactInfo.map((info) => (
                <Card key={info.title} className="text-center">
                  <CardContent className="p-6">
                    <info.icon className="h-10 w-10 text-primary mx-auto mb-4" />
                    <CardTitle className="text-lg mb-2">{info.title}</CardTitle>
                    <p className="font-medium text-foreground">{info.value}</p>
                    <CardDescription>{info.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container text-center">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Ready to Travel?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Book your next trip with confidence. We're here to help every step of the way.
            </p>
            <Link to="/">
              <Button size="lg" className="hero">
                Book a Trip Now
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HelpCenter;
