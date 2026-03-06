import { Card } from "@/components/ui/card";

import SEO from "@/components/SEO";

const TermsOfService = () => {
  return (
    <>
      <SEO
        title="Terms of Service | Sentinel DeFi"
        description="Terms of service for the Sentinel DeFi DeFi education platform."
        url="https://www.sentineldefi.online/terms"
      />
    <div className="min-h-screen py-20 bg-transparent">
      <div className="container mx-auto px-4 max-w-4xl mobile-typography-center">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-consciousness font-bold text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-white/50 font-body">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card className="p-8 bg-white/3 border border-white/8">
          <div className="prose prose-lg max-w-none space-y-8 text-white font-body mobile-typography-center">
            
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Sentinel DeFi, you accept and agree to be bound by these
                Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Educational Services</h2>
              <p className="mb-4">
                Sentinel DeFi provides educational content about decentralized finance (DeFi),
                cryptocurrency, and financial technologies. Our services include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Online courses and tutorials</li>
                <li>Educational videos and written content</li>
                <li>Interactive tools and calculators</li>
                <li>Community discussion forums</li>
                <li>Progress tracking and certificates</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Not Financial Advice</h2>
              <div className="bg-awareness/10 border border-awareness/20 p-6 rounded-lg">
                <p className="font-semibold mb-2">IMPORTANT DISCLAIMER:</p>
                <p>
                  All content provided by Sentinel DeFi is for educational purposes only and
                  does not constitute financial, investment, or trading advice. We do not recommend 
                  any specific investments or trading strategies. Always conduct your own research 
                  and consult with qualified financial advisors before making investment decisions.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. User Responsibilities</h2>
              <p className="mb-4">As a user of our platform, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate and truthful information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use our services only for lawful purposes</li>
                <li>Respect intellectual property rights</li>
                <li>Not share or redistribute course content without permission</li>
                <li>Engage respectfully in community discussions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Account Terms</h2>
              <p className="mb-4">
                To access certain features, you must create an account. You are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Keeping your account information current and accurate</li>
                <li>Maintaining the confidentiality of your password</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Payment Terms</h2>
              <p className="mb-4">For paid services:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All payments are processed securely through Stripe</li>
                <li>Prices are subject to change with notice</li>
                <li>Refunds are provided according to our refund policy</li>
                <li>You are responsible for any applicable taxes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Intellectual Property</h2>
              <p>
                All content, including courses, videos, text, graphics, and software, is owned by 
                Sentinel DeFi or our licensors and is protected by copyright and other intellectual
                property laws. You may not reproduce, distribute, or create derivative works without 
                our written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Prohibited Uses</h2>
              <p className="mb-4">You may not use our services to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violate any laws or regulations</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Share false or misleading information</li>
                <li>Attempt to hack or compromise our systems</li>
                <li>Upload viruses or malicious code</li>
                <li>Spam or send unsolicited communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Cryptocurrency & NFT Terms</h2>
              <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-lg mb-4">
                <p className="font-semibold mb-2">EXTERNAL WALLET & BLOCKCHAIN TRANSACTIONS:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>All cryptocurrency and NFT transactions are processed through your external wallet (MetaMask, Coinbase Wallet, etc.), not through this application's payment system.</li>
                  <li>You are solely responsible for managing your private keys and wallet security.</li>
                  <li>Blockchain transactions are irreversible: there are no refunds for crypto transactions.</li>
                  <li>NFT ownership grants access rights to specified services but does not constitute ownership of underlying intellectual property.</li>
                </ul>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-lg">
                <p className="font-semibold mb-2">ENZYME VAULT: THIRD-PARTY SERVICE:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The Enzyme Vault is operated by Enzyme Finance, an independent third-party DeFi protocol.</li>
                  <li>Sentinel DeFi does not custody your funds: deposits and withdrawals occur on Enzyme's external platform.</li>
                  <li>Smart contract risks exist with any DeFi protocol; always verify you're on the official Enzyme Finance website.</li>
                  <li>Past vault performance does not guarantee future results.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Risk Acknowledgment</h2>
              <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-lg">
                <p className="font-semibold mb-2">RISK WARNING:</p>
                <p>
                  Cryptocurrency and DeFi investments carry significant risks, including the potential 
                  for total loss of capital. Markets are highly volatile and unpredictable. Never invest 
                  more than you can afford to lose. Past performance does not guarantee future results.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, Sentinel DeFi shall not be liable for any
                indirect, incidental, special, or consequential damages resulting from your use of 
                our services, including but not limited to investment losses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">11. Termination</h2>
              <p>
                We reserve the right to terminate or suspend accounts that violate these terms. 
                You may also terminate your account at any time by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">12. Changes to Terms</h2>
              <p>
                We may update these terms from time to time. Continued use of our services after 
                changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">13. Contact Information</h2>
              <p>
                If you have questions about these Terms of Service, please contact us at:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> info@the3rdeyeadvisors.com
              </p>
            </section>

            <div className="border-t border-white/8 pt-6 mt-8">
              <p className="text-sm text-white/50">
                These terms are designed to protect both our users and our educational mission 
                while clearly establishing the boundaries of our relationship and responsibilities.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
    </>
  );
};

export default TermsOfService;