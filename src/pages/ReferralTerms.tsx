import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { PRICING, COMMISSION_RATES } from "@/lib/constants";

const ReferralTerms = () => {
  const lastUpdated = "January 2, 2026";

  return (
    <>
      <SEO
        title="Referral Program Terms & Conditions | 3rdeyeadvisors"
        description="Terms and conditions for the 3rdeyeadvisors referral program. Learn about commission rates, payment terms, and program rules."
        keywords="referral terms, affiliate program terms, commission terms"
      />

      <div className="min-h-screen bg-background py-16 md:py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
            Referral Program Terms & Conditions
          </h1>
          <p className="text-white/50 text-center mb-8">
            Last Updated: {lastUpdated}
          </p>

          <Card>
            <CardContent className="prose prose-invert max-w-none p-6 md:p-8 space-y-8">
              {/* Program Overview */}
              <section>
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl">1. Program Overview</CardTitle>
                </CardHeader>
                <p className="text-white/80 leading-relaxed">
                  The 3rdeyeadvisors Referral Program ("Program") allows registered users ("Referrers") to earn 
                  commissions by referring new subscribers to our platform. By participating in this Program, 
                  you agree to be bound by these terms and conditions.
                </p>
                <p className="text-white/80 leading-relaxed mt-4">
                  <strong>Eligibility:</strong> You must be a registered user of 3rdeyeadvisors with a verified 
                  email address to participate in the Program. You must be at least 18 years old or the age of 
                  majority in your jurisdiction.
                </p>
              </section>

              {/* Commission Structure */}
              <section>
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl">2. Commission Structure</CardTitle>
                </CardHeader>
                <p className="text-white/80 leading-relaxed">
                  Commission rates are based on YOUR subscription status at the time of the referred user's 
                  subscription purchase:
                </p>
                <ul className="list-disc pl-6 text-white/80 space-y-2 mt-4">
                  <li>
                    <strong>Non-Subscribers & Monthly Subscribers:</strong> {Math.round(COMMISSION_RATES.monthly * 100)}% of the 
                    subscription amount (${(PRICING.monthly.amount * COMMISSION_RATES.monthly).toFixed(2)} per monthly referral, 
                    ${(PRICING.annual.amount * COMMISSION_RATES.monthly).toFixed(2)} per annual referral)
                  </li>
                  <li>
                    <strong>Annual Subscribers (Premium Rate):</strong> {Math.round(COMMISSION_RATES.annual * 100)}% of the 
                    subscription amount (${(PRICING.monthly.amount * COMMISSION_RATES.annual).toFixed(2)} per monthly referral, 
                    ${(PRICING.annual.amount * COMMISSION_RATES.annual).toFixed(2)} per annual referral)
                  </li>
                  <li>
                    <strong>Founding 33 Members (Highest Rate):</strong> {Math.round(COMMISSION_RATES.founding_33 * 100)}% of the 
                    subscription amount (${(PRICING.monthly.amount * COMMISSION_RATES.founding_33).toFixed(2)} per monthly referral, 
                    ${(PRICING.annual.amount * COMMISSION_RATES.founding_33).toFixed(2)} per annual referral)
                  </li>
                </ul>
                <p className="text-white/80 leading-relaxed mt-4">
                  Commissions are calculated on the net subscription amount after payment processor fees are deducted. 
                  The commission rate that applies is based on your subscription status at the moment the referred 
                  user's payment is processed.
                </p>
                <p className="text-white/80 leading-relaxed mt-4">
                  Commissions are calculated on the net subscription amount after payment processor fees are deducted. 
                  The commission rate that applies is based on your subscription status at the moment the referred 
                  user's payment is processed.
                </p>
              </section>

              {/* Payment Terms */}
              <section>
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl">3. Payment Terms</CardTitle>
                </CardHeader>
                <ul className="list-disc pl-6 text-white/80 space-y-3">
                  <li>
                    <strong>Payment Schedule:</strong> Approved commissions are paid out within 7 to 10 business days
                    of being marked as approved by our team.
                  </li>
                  <li>
                    <strong>Minimum Payout:</strong> There is no minimum payout threshold. However, we reserve 
                    the right to combine smaller amounts into a single payment for efficiency.
                  </li>
                  <li>
                    <strong>Payment Methods:</strong> We offer payment via cryptocurrency (USDC on supported networks) 
                    or Zelle. You must provide valid payment details in your account settings.
                  </li>
                  <li>
                    <strong>Chargeback Protection:</strong> New commissions may be held briefly to allow time for 
                    potential refunds or chargebacks before being marked as approved.
                  </li>
                  <li>
                    <strong>Currency:</strong> All commissions are calculated and paid in USD or USD-equivalent 
                    cryptocurrency.
                  </li>
                </ul>
              </section>

              {/* Program Rules */}
              <section>
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl">4. Program Rules</CardTitle>
                </CardHeader>
                <p className="text-white/80 leading-relaxed mb-4">
                  The following activities are strictly prohibited and will result in immediate disqualification 
                  and forfeiture of all pending commissions:
                </p>
                <ul className="list-disc pl-6 text-white/80 space-y-2">
                  <li><strong>Self-Referrals:</strong> You may not refer yourself or create multiple accounts to claim referral bonuses.</li>
                  <li><strong>Fraudulent Accounts:</strong> Referring fake, bot, or fraudulent accounts is prohibited.</li>
                  <li><strong>Spam:</strong> Unsolicited emails, messages, or any form of spam marketing is not allowed.</li>
                  <li><strong>Misleading Claims:</strong> Making false or misleading statements about our services, earnings potential, or Program benefits.</li>
                  <li><strong>Paid Traffic:</strong> Using paid advertising that directly competes with our brand terms or violates our brand guidelines.</li>
                  <li><strong>Cookie Stuffing:</strong> Any attempt to manipulate referral tracking through technical means.</li>
                </ul>
                <p className="text-white/80 leading-relaxed mt-4">
                  <strong>Acceptable Promotion:</strong> You may share your referral link on social media, 
                  personal blogs, YouTube, newsletters (to your own subscribers), and through word-of-mouth 
                  with friends and family.
                </p>
              </section>

              {/* Modifications & Termination */}
              <section>
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl">5. Modifications & Termination</CardTitle>
                </CardHeader>
                <ul className="list-disc pl-6 text-white/80 space-y-3">
                  <li>
                    <strong>Program Changes:</strong> We reserve the right to modify commission rates, payment 
                    terms, or any aspect of the Program at any time. We will provide at least 14 days notice 
                    for material changes via email or platform announcement.
                  </li>
                  <li>
                    <strong>Termination:</strong> We may terminate your participation in the Program at any 
                    time for any reason, including violation of these terms. You may also opt out at any time.
                  </li>
                  <li>
                    <strong>Pending Commissions:</strong> If your participation is terminated due to violation 
                    of Program rules, all pending commissions will be forfeited. If termination is not due to 
                    a violation, we will pay out any earned commissions within 7 to 10 business days.
                  </li>
                  <li>
                    <strong>Program Discontinuation:</strong> We reserve the right to discontinue the Program 
                    entirely with 30 days notice. All earned commissions up to that point will be paid.
                  </li>
                </ul>
              </section>

              {/* Tax Responsibility */}
              <section>
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl">6. Tax Responsibility</CardTitle>
                </CardHeader>
                <p className="text-white/80 leading-relaxed">
                  You are solely responsible for reporting and paying any taxes on earnings from the Program. 
                  We do not withhold taxes on commission payments. If required by law, we may request tax 
                  documentation (such as a W-9 for US persons) before processing payments. Commission earnings 
                  may be reported to tax authorities as required by applicable law.
                </p>
              </section>

              {/* Liability & Disclaimers */}
              <section>
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl">7. Liability & Disclaimers</CardTitle>
                </CardHeader>
                <ul className="list-disc pl-6 text-white/80 space-y-2">
                  <li><strong>No Guaranteed Earnings:</strong> Participation in the Program does not guarantee any specific level of earnings. Results depend on your promotional efforts and the quality of referrals.</li>
                  <li><strong>Payment Delays:</strong> We are not liable for payment delays caused by third-party payment processors, cryptocurrency network congestion, or circumstances beyond our control.</li>
                  <li><strong>Refunds & Chargebacks:</strong> Commissions associated with refunded or charged-back subscriptions will be deducted from future payments.</li>
                  <li><strong>Limitation of Liability:</strong> Our total liability for any claims related to the Program is limited to the actual commission amounts owed to you.</li>
                </ul>
              </section>

              {/* Dispute Resolution */}
              <section>
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl">8. Dispute Resolution</CardTitle>
                </CardHeader>
                <p className="text-white/80 leading-relaxed">
                  If you have a dispute regarding the Program, commissions, or these terms, please contact us 
                  at <a href="mailto:info@the3rdeyeadvisors.com" className="text-primary hover:underline">
                  info@the3rdeyeadvisors.com</a>. We will work in good faith to resolve disputes within 30 
                  days. Any disputes that cannot be resolved will be subject to binding arbitration in accordance 
                  with our <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>.
                </p>
              </section>

              {/* Acceptance */}
              <section>
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl">9. Acceptance</CardTitle>
                </CardHeader>
                <p className="text-white/80 leading-relaxed">
                  By participating in the Referral Program, you acknowledge that you have read, understood, 
                  and agree to be bound by these terms and conditions. You also agree to our general{" "}
                  <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and{" "}
                  <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                </p>
              </section>

              {/* Contact */}
              <section className="border-t border-white/8 pt-6">
                <p className="text-white/80">
                  For questions about the Referral Program, please contact us at{" "}
                  <a href="mailto:info@the3rdeyeadvisors.com" className="text-primary hover:underline">
                    info@the3rdeyeadvisors.com
                  </a>
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ReferralTerms;
