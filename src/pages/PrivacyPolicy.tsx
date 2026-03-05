import { Card } from "@/components/ui/card";

import SEO from "@/components/SEO";

const PrivacyPolicy = () => {
  return (
    <>
      <SEO
        title="Privacy Policy | Sentinel DeFi"
        description="Privacy policy for Sentinel DeFi DeFi education platform. How we collect, use, and protect your data."
        url="https://www.sentineldefi.com/privacy"
      />
    <div className="min-h-screen py-20 bg-transparent">
      <div className="container mx-auto px-4 max-w-4xl mobile-typography-center">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-consciousness font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-white/50 font-body">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card className="p-8 bg-white/3 border border-white/8">
          <div className="prose prose-lg max-w-none space-y-8 text-white font-body mobile-typography-center">
            
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
              <p className="mb-4">
                We collect information you provide directly to us, such as when you create an account, 
                make a purchase, or contact us. This may include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Email address and display name</li>
                <li>Payment information (processed securely through Stripe)</li>
                <li>Course progress and learning data</li>
                <li>Communication preferences</li>
                <li>Messages you send through our contact forms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and improve our educational services</li>
                <li>Process transactions and send related information</li>
                <li>Send you updates about courses and educational content</li>
                <li>Respond to your comments and questions</li>
                <li>Track your learning progress and provide personalized recommendations</li>
                <li>Protect against fraud and ensure platform security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Information Sharing</h2>
              <p className="mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties 
                except as described below:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Payment Processing:</strong> We use Stripe to process payments securely</li>
                <li><strong>Email Services:</strong> We use Resend for transactional emails</li>
                <li><strong>Analytics:</strong> We may use analytics services to improve our platform</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
              <p>
                We implement appropriate security measures to protect your personal information. 
                Your data is stored securely using Supabase's enterprise-grade infrastructure. 
                However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Your Rights</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt out of marketing communications</li>
                <li>Export your data in a portable format</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Cookies and Tracking</h2>
              <p>
                We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
                and provide personalized content. You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Children's Privacy</h2>
              <p>
                Our services are not intended for children under 13. We do not knowingly collect 
                personal information from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any 
                significant changes by posting the new policy on this page and updating the 
                "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> info@the3rdeyeadvisors.com
              </p>
            </section>

            <div className="border-t border-white/8 pt-6 mt-8">
              <p className="text-sm text-white/50">
                This privacy policy is designed to help you understand how we collect, use, 
                and safeguard your information while providing educational services focused 
                on financial consciousness and DeFi education.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
    </>
  );
};

export default PrivacyPolicy;