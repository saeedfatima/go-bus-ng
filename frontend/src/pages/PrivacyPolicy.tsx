import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Shield, Eye, Lock, Database, UserCheck, Bell, Mail, Calendar } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Privacy Policy
              </h1>
              <p className="text-lg text-muted-foreground">
                Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
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
                  NaijaBus ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our bus booking platform and services.
                </p>
              </div>

              {/* Section 1 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <Database className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-display font-semibold">1. Information We Collect</h2>
                </div>
                <div className="pl-13 space-y-4 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Personal Information</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Full name and contact details (email address, phone number)</li>
                      <li>National Identification Number (NIN) for passenger verification</li>
                      <li>Payment information (processed securely through third-party providers)</li>
                      <li>Travel history and booking preferences</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Automatically Collected Information</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Device information (browser type, operating system)</li>
                      <li>IP address and location data</li>
                      <li>Usage patterns and preferences</li>
                      <li>Cookies and similar tracking technologies</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-display font-semibold">2. How We Use Your Information</h2>
                </div>
                <div className="pl-13 space-y-2 text-muted-foreground">
                  <p>We use the collected information for the following purposes:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Processing and managing your bus ticket bookings</li>
                    <li>Sending booking confirmations, e-tickets, and travel updates</li>
                    <li>Providing customer support and responding to inquiries</li>
                    <li>Improving our services and user experience</li>
                    <li>Preventing fraud and ensuring platform security</li>
                    <li>Complying with legal obligations and regulations</li>
                    <li>Sending promotional offers (with your consent)</li>
                  </ul>
                </div>
              </div>

              {/* Section 3 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <UserCheck className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-display font-semibold">3. Information Sharing</h2>
                </div>
                <div className="pl-13 space-y-2 text-muted-foreground">
                  <p>We may share your information with:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Bus Companies:</strong> To fulfill your booking and provide transportation services</li>
                    <li><strong>Payment Processors:</strong> To securely process your payments</li>
                    <li><strong>Service Providers:</strong> Third parties who assist in operating our platform</li>
                    <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
                  </ul>
                  <p className="mt-4">We do not sell your personal information to third parties for marketing purposes.</p>
                </div>
              </div>

              {/* Section 4 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-display font-semibold">4. Data Security</h2>
                </div>
                <div className="pl-13 space-y-2 text-muted-foreground">
                  <p>We implement robust security measures to protect your data:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>SSL/TLS encryption for all data transmissions</li>
                    <li>Secure storage with access controls and encryption</li>
                    <li>Regular security audits and vulnerability assessments</li>
                    <li>Employee training on data protection practices</li>
                    <li>Incident response procedures for potential breaches</li>
                  </ul>
                </div>
              </div>

              {/* Section 5 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-display font-semibold">5. Your Rights</h2>
                </div>
                <div className="pl-13 space-y-2 text-muted-foreground">
                  <p>You have the following rights regarding your personal data:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Access:</strong> Request a copy of your personal data</li>
                    <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                    <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                    <li><strong>Portability:</strong> Receive your data in a portable format</li>
                    <li><strong>Objection:</strong> Object to certain processing activities</li>
                    <li><strong>Withdrawal:</strong> Withdraw consent for marketing communications</li>
                  </ul>
                  <p className="mt-4">To exercise these rights, please contact us using the details below.</p>
                </div>
              </div>

              {/* Section 6 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">6. Cookies Policy</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>We use cookies and similar technologies to:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Remember your preferences and login status</li>
                    <li>Analyze site traffic and usage patterns</li>
                    <li>Personalize content and recommendations</li>
                    <li>Improve our services and user experience</li>
                  </ul>
                  <p className="mt-4">You can manage cookie preferences through your browser settings.</p>
                </div>
              </div>

              {/* Section 7 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">7. Data Retention</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>We retain your personal information for as long as necessary to:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Provide our services and maintain your account</li>
                    <li>Comply with legal and regulatory requirements</li>
                    <li>Resolve disputes and enforce agreements</li>
                  </ul>
                  <p className="mt-4">Booking records are retained for a minimum of 7 years for legal compliance.</p>
                </div>
              </div>

              {/* Section 8 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">8. Children's Privacy</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>
                    Our services are not directed to children under 13. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
                  </p>
                </div>
              </div>

              {/* Section 9 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">9. Changes to This Policy</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>
                    We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on our platform or sending you an email. Your continued use of our services after changes constitutes acceptance of the updated policy.
                  </p>
                </div>
              </div>

              {/* Contact Section */}
              <div className="bg-muted/50 rounded-2xl p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-display font-semibold">Contact Us</h2>
                </div>
                <div className="space-y-2 text-muted-foreground">
                  <p>If you have questions about this Privacy Policy or our data practices, please contact us:</p>
                  <ul className="space-y-1 mt-4">
                    <li><strong>Email:</strong> privacy@naijabus.com</li>
                    <li><strong>Phone:</strong> +234 800 123 4567</li>
                    <li><strong>Address:</strong> 123 Victoria Island, Lagos, Nigeria</li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
