import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { FileText, Users, CreditCard, AlertTriangle, Scale, Shield, Clock, Calendar } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Terms of Service
              </h1>
              <p className="text-lg text-muted-foreground">
                Please read these terms carefully before using our bus booking platform.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                <Calendar className="inline h-4 w-4 mr-1" />
                Last updated: January 24, 2025
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="max-w-4xl mx-auto space-y-12">
              
              {/* Introduction */}
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to NaijaBus. These Terms of Service ("Terms") govern your use of our website, mobile application, and bus booking services. By accessing or using our platform, you agree to be bound by these Terms.
                </p>
              </div>

              {/* Section 1 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-display font-semibold">1. Account Registration</h2>
                </div>
                <div className="pl-13 space-y-2 text-muted-foreground">
                  <ul className="list-disc pl-6 space-y-2">
                    <li>You must be at least 18 years old to create an account</li>
                    <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                    <li>You must provide accurate and complete information during registration</li>
                    <li>You are responsible for all activities that occur under your account</li>
                    <li>Notify us immediately of any unauthorized use of your account</li>
                    <li>We reserve the right to suspend or terminate accounts that violate these Terms</li>
                  </ul>
                </div>
              </div>

              {/* Section 2 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-display font-semibold">2. Booking and Payment</h2>
                </div>
                <div className="pl-13 space-y-4 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Booking Process</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>All bookings are subject to availability</li>
                      <li>Seat reservations are held for 15 minutes pending payment completion</li>
                      <li>Each seat can only be assigned to one passenger per trip</li>
                      <li>A booking is confirmed only after successful payment</li>
                      <li>You will receive an e-ticket with a unique booking code upon confirmation</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Payment Terms</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>All prices are displayed in Nigerian Naira (₦)</li>
                      <li>Payment must be made through our approved payment channels</li>
                      <li>We accept debit cards, bank transfers, and mobile payments</li>
                      <li>Prices may vary based on demand, route, and bus type</li>
                      <li>Service fees may apply and will be clearly displayed before payment</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 3 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-display font-semibold">3. Cancellation and Refund Policy</h2>
                </div>
                <div className="pl-13 space-y-4 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Cancellation by Passenger</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>24+ hours before departure:</strong> Full refund minus processing fee (5%)</li>
                      <li><strong>12-24 hours before departure:</strong> 50% refund</li>
                      <li><strong>Less than 12 hours:</strong> No refund</li>
                      <li>Refunds are processed within 7-14 business days</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Cancellation by Bus Company</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Full refund will be provided for trips cancelled by the bus company</li>
                      <li>Alternative trip options may be offered where available</li>
                      <li>NaijaBus is not liable for indirect damages caused by cancellations</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 4 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-display font-semibold">4. Passenger Responsibilities</h2>
                </div>
                <div className="pl-13 space-y-2 text-muted-foreground">
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Arrive at the departure terminal at least 30 minutes before departure</li>
                    <li>Present valid identification matching the booking details</li>
                    <li>Show your e-ticket (digital or printed) for boarding</li>
                    <li>Follow all safety instructions and regulations of the bus company</li>
                    <li>Ensure luggage complies with weight and size restrictions</li>
                    <li>Prohibited items include flammable materials, weapons, and illegal substances</li>
                    <li>Behave respectfully towards staff and fellow passengers</li>
                  </ul>
                </div>
              </div>

              {/* Section 5 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <Scale className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-display font-semibold">5. Limitation of Liability</h2>
                </div>
                <div className="pl-13 space-y-2 text-muted-foreground">
                  <p>NaijaBus acts as an intermediary platform connecting passengers with bus companies. We are not liable for:</p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>Delays, cancellations, or schedule changes by bus companies</li>
                    <li>Quality of service provided by bus companies</li>
                    <li>Loss, theft, or damage to personal belongings during travel</li>
                    <li>Personal injury during transportation (covered by bus company insurance)</li>
                    <li>Force majeure events (natural disasters, civil unrest, etc.)</li>
                  </ul>
                  <p className="mt-4">Our maximum liability is limited to the amount paid for the booking.</p>
                </div>
              </div>

              {/* Section 6 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">6. Bus Company Obligations</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>Bus companies using our platform agree to:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Maintain valid operating licenses and insurance</li>
                    <li>Ensure vehicles meet safety standards</li>
                    <li>Honor confirmed bookings made through our platform</li>
                    <li>Provide accurate trip information and pricing</li>
                    <li>Communicate schedule changes promptly</li>
                  </ul>
                </div>
              </div>

              {/* Section 7 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">7. Intellectual Property</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>
                    All content on the NaijaBus platform, including logos, text, graphics, and software, is the property of NaijaBus and protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our written consent.
                  </p>
                </div>
              </div>

              {/* Section 8 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">8. Prohibited Activities</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>You agree not to:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Use the platform for any unlawful purpose</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Transmit viruses or malicious code</li>
                    <li>Interfere with the platform's operation</li>
                    <li>Scrape or collect data without permission</li>
                    <li>Create fake bookings or fraudulent accounts</li>
                    <li>Resell tickets at inflated prices</li>
                  </ul>
                </div>
              </div>

              {/* Section 9 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-display font-semibold">9. Dispute Resolution</h2>
                </div>
                <div className="pl-13 space-y-2 text-muted-foreground">
                  <p>
                    Any disputes arising from these Terms shall be resolved through:
                  </p>
                  <ol className="list-decimal pl-6 space-y-1">
                    <li><strong>Negotiation:</strong> Direct communication to resolve issues amicably</li>
                    <li><strong>Mediation:</strong> Neutral third-party mediation if negotiation fails</li>
                    <li><strong>Arbitration:</strong> Binding arbitration under Nigerian law</li>
                  </ol>
                  <p className="mt-4">These Terms are governed by the laws of the Federal Republic of Nigeria.</p>
                </div>
              </div>

              {/* Section 10 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">10. Changes to Terms</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>
                    We reserve the right to modify these Terms at any time. Significant changes will be communicated via email or platform notification. Your continued use of our services after changes constitutes acceptance of the updated Terms.
                  </p>
                </div>
              </div>

              {/* Section 11 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">11. Severability</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>
                    If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
                  </p>
                </div>
              </div>

              {/* Contact Section */}
              <div className="bg-muted/50 rounded-2xl p-8 space-y-4">
                <h2 className="text-2xl font-display font-semibold">Contact Information</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>For questions about these Terms of Service, please contact us:</p>
                  <ul className="space-y-1 mt-4">
                    <li><strong>Email:</strong> legal@naijabus.com</li>
                    <li><strong>Phone:</strong> +234 800 123 4567</li>
                    <li><strong>Address:</strong> 123 Victoria Island, Lagos, Nigeria</li>
                  </ul>
                </div>
              </div>

              {/* Agreement Notice */}
              <div className="border border-primary/20 rounded-2xl p-6 bg-primary/5">
                <p className="text-center text-muted-foreground">
                  By using NaijaBus, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default TermsOfService;
