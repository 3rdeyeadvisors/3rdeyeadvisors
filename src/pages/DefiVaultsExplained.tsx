/**
 * Blog Post: DeFi Vaults Explained
 * Published: December 2025
 * Educational content on DeFi vaults, transparency, and rules-based investing
 */

import SEO from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Clock, Vault, Shield, Eye, Scale, AlertTriangle, CheckCircle, Lock, Zap, Volume2 } from "lucide-react";
import { BRAND_AUTHOR } from "@/lib/constants";
import AudioPlayer from '@/components/audio/AudioPlayer';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

const DefiVaultsExplained = () => {
  const { isOpen: audioOpen, audioText, audioTitle, openAudio, closeAudio } = useAudioPlayer();
  const blogPost = {
    title: "DeFi Vaults Explained: Transparent, Rules-Based Investing for the Modern Era",
    excerpt: "Discover how DeFi vaults work, why they offer unprecedented transparency compared to traditional finance, and how smart contract automation creates trustless, rules-based investment strategies that anyone can verify.",
    author: BRAND_AUTHOR,
    publishedDate: "2025-12-24",
    category: "DeFi Education",
    tags: ["DeFi Vaults", "Smart Contracts", "Transparency", "Yield Strategies", "Rules-Based Investing"],
  };

  return (
    <>
      <SEO
        title="DeFi Vaults Explained: How Yield Automation Works | 3rdeyeadvisors"
        description="A plain English breakdown of how DeFi vaults automate yield farming, compound returns, and manage risk on your behalf."
        url="https://www.the3rdeyeadvisors.com/blog/defi-vaults-explained"
      />

      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Article Header */}
          <Card className="p-8 mb-8 bg-gradient-consciousness border-primary/20">
            <div className="flex flex-wrap gap-3 mb-6">
              <Badge variant="default" className="bg-primary text-primary-foreground">
                <Vault className="w-3 h-3 mr-1" />
                {blogPost.category}
              </Badge>
              {blogPost.tags.slice(0, 4).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl font-consciousness font-bold text-foreground mb-6">
              {blogPost.title}
            </h1>

            <button
              onClick={() => openAudio(`${blogPost.title}. ${blogPost.excerpt}`, blogPost.title)}
              className="flex items-center gap-2 font-body text-sm text-white/50 hover:text-violet-400 transition-colors bg-white/5 hover:bg-white/8 border border-white/10 hover:border-violet-500/30 rounded-xl px-4 py-2 mt-4"
            >
              <Volume2 className="w-4 h-4" />
              Listen to this article
            </button>

            <p className="text-lg text-white/50 font-consciousness mb-6 leading-relaxed">
              {blogPost.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-white/50">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{BRAND_AUTHOR}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(blogPost.publishedDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>12 min read</span>
              </div>
            </div>
          </Card>

          {/* Article Content */}
          <Card className="p-8">
            <article className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-consciousness prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-li:text-foreground">
              {/* Introduction */}
              <div className="mb-12">
                <p className="text-foreground/90 text-lg leading-relaxed mb-6">
                  <strong className="text-foreground">What if you could see exactly how your money was being invested, every single second?</strong> What if the rules governing your investments were written in code that anyone could audit, rather than buried in legal documents that only lawyers understand? What if there were no hidden fees, no black box algorithms, and no possibility of your fund manager gambling with your money behind closed doors?
                </p>
                <p className="text-foreground/90 text-lg leading-relaxed">
                  This is not a hypothetical scenario. This is the reality of DeFi vaults. In this guide, we will explain exactly what DeFi vaults are, how they work, and why they represent a fundamental shift in how ordinary people can access sophisticated investment strategies with complete transparency.
                </p>
              </div>

              {/* Section 1: What Is a DeFi Vault */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Vault className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground m-0">What Is a DeFi Vault?</h2>
                </div>

                <p className="text-foreground/90 leading-relaxed mb-4">
                  <strong className="text-foreground">A DeFi vault is a smart contract that automatically executes a predefined investment strategy.</strong> Think of it as an automated investment vehicle where the "manager" is code, not a person. You deposit your cryptocurrency, and the vault's smart contract automatically deploys your capital according to its programmed strategy.
                </p>

                <p className="text-foreground/90 leading-relaxed mb-4">
                  Unlike traditional investment funds, everything about a DeFi vault is transparent:
                </p>

                <div className="bg-white/5 rounded-lg p-6 mb-6">
                  <ul className="space-y-3 text-foreground/90">
                    <li><strong className="text-foreground">The Strategy:</strong> The exact rules are written in open-source code that anyone can read</li>
                    <li><strong className="text-foreground">The Holdings:</strong> Every asset the vault holds is visible on the blockchain in real-time</li>
                    <li><strong className="text-foreground">The Performance:</strong> Historical returns are recorded immutably on-chain</li>
                    <li><strong className="text-foreground">The Fees:</strong> Fee structures are coded into the contract with no hidden charges</li>
                  </ul>
                </div>

                <div className="border-l-4 border-primary/50 pl-6 mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-3">How Vaults Work: A Simple Example</h3>
                  <p className="text-foreground/90 leading-relaxed mb-4">
                    Imagine a vault designed to earn yield on stablecoins:
                  </p>
                  <ol className="space-y-2 text-foreground/90">
                    <li><strong className="text-foreground">1.</strong> You deposit USDC into the vault smart contract</li>
                    <li><strong className="text-foreground">2.</strong> The vault automatically allocates your USDC to yield-generating protocols like Aave or Compound</li>
                    <li><strong className="text-foreground">3.</strong> Interest accrues to the vault and is reflected in your share value</li>
                    <li><strong className="text-foreground">4.</strong> When you withdraw, you receive your original deposit plus your proportional share of earned yield</li>
                  </ol>
                </div>

                <p className="text-foreground/90 leading-relaxed">
                  The critical difference from traditional finance: at every step, you can verify exactly what is happening with your money by examining the blockchain.
                </p>
              </div>

              {/* Section 2: Why Transparency Matters */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground m-0">Why Transparency Matters: The Traditional Finance Problem</h2>
                </div>

                <p className="text-foreground/90 leading-relaxed mb-6">
                  <strong className="text-foreground">Traditional investment funds operate as black boxes.</strong> When you invest in a hedge fund, mutual fund, or even a basic savings account, you are trusting that the institution will do what they claim. But how do you know?
                </p>

                <div className="space-y-8 mb-8">
                  <div className="border-l-4 border-amber-500/50 pl-6">
                    <h3 className="text-xl font-semibold text-foreground mb-3">Hidden Holdings</h3>
                    <p className="text-foreground/90 leading-relaxed">
                      Most funds only disclose their positions quarterly, and often with significant delays. Your fund manager could be taking enormous risks right now, and you would not know until the next report.
                    </p>
                  </div>

                  <div className="border-l-4 border-amber-500/50 pl-6">
                    <h3 className="text-xl font-semibold text-foreground mb-3">Buried Fees</h3>
                    <p className="text-foreground/90 leading-relaxed">
                      Traditional funds layer fees on top of fees. Management fees, performance fees, trading costs, administrative expenses, and "soft dollar" arrangements can eat into returns in ways that are nearly impossible to track.
                    </p>
                  </div>

                  <div className="border-l-4 border-amber-500/50 pl-6">
                    <h3 className="text-xl font-semibold text-foreground mb-3">Discretionary Decision-Making</h3>
                    <p className="text-foreground/90 leading-relaxed">
                      Fund managers can change strategies, take concentrated positions, or make leveraged bets based on personal judgment. You are trusting a human to follow the rules, with no way to verify they actually are.
                    </p>
                  </div>

                  <div className="border-l-4 border-amber-500/50 pl-6">
                    <h3 className="text-xl font-semibold text-foreground mb-3">Counterparty Risk</h3>
                    <p className="text-foreground/90 leading-relaxed">
                      When you invest with a traditional institution, your assets are held by that institution. History is filled with examples of financial institutions that seemed trustworthy until they were not: from Bernie Madoff to the 2022 crypto CeFi collapses.
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4">The 2022 CeFi Collapse: A Case Study</h3>
                  <ul className="space-y-3 text-foreground/90">
                    <li><strong className="text-foreground">Celsius Network:</strong> Halted withdrawals and filed bankruptcy, revealing a $4.7 billion hole that customers never saw coming</li>
                    <li><strong className="text-foreground">FTX:</strong> Collapsed overnight with over $8 billion in customer funds missing</li>
                    <li><strong className="text-foreground">BlockFi:</strong> Failed following FTX contagion</li>
                  </ul>
                  <p className="text-foreground/90 leading-relaxed mt-4">
                    In each case, customers had no visibility into what was happening with their deposits. They trusted, and that trust was betrayed. DeFi vaults solve this by eliminating the need for trust entirely.
                  </p>
                </div>
              </div>

              {/* Section 3: How DeFi Vaults Create Transparency */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Eye className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground m-0">How DeFi Vaults Create Transparency</h2>
                </div>

                <p className="text-foreground/90 leading-relaxed mb-6">
                  <strong className="text-foreground">DeFi vaults replace trust with verification.</strong> Every aspect of vault operation is transparent and auditable by design.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white/5 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-foreground mb-3">On-Chain Visibility</h3>
                    <p className="text-foreground/80 text-sm leading-relaxed">
                      At any moment, you can see exactly what assets the vault holds. Not a quarterly report, not a delayed disclosure, but the actual current state of the portfolio.
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Transaction History</h3>
                    <p className="text-foreground/80 text-sm leading-relaxed">
                      Every trade, every yield harvest, every fee payment is recorded on the blockchain forever. You can trace exactly what happened with your money at any point.
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Open-Source Code</h3>
                    <p className="text-foreground/80 text-sm leading-relaxed">
                      The vault's strategy is literally written in code that anyone can read. If the vault claims to invest only in blue-chip protocols, you can verify this by examining the smart contract.
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Self-Custody</h3>
                    <p className="text-foreground/80 text-sm leading-relaxed">
                      Your assets are held by the smart contract, not by a company. The contract enforces the rules, and only you can withdraw your share.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 4: Rules-Based Investing */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Scale className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground m-0">Rules-Based Investing: The Power of Smart Contracts</h2>
                </div>

                <p className="text-foreground/90 leading-relaxed mb-6">
                  <strong className="text-foreground">The most revolutionary aspect of DeFi vaults is rules-based investing.</strong> Instead of trusting a human to follow an investment mandate, the mandate is encoded directly into the smart contract.
                </p>

                <div className="space-y-6 mb-8">
                  <div className="border-l-4 border-primary/50 pl-6">
                    <h3 className="text-xl font-semibold text-foreground mb-3">Defined Risk Parameters</h3>
                    <p className="text-foreground/90 leading-relaxed">
                      A vault can be programmed to only invest in protocols with a minimum TVL (Total Value Locked), specific audit requirements, or predetermined asset types. These rules cannot be broken.
                    </p>
                  </div>

                  <div className="border-l-4 border-primary/50 pl-6">
                    <h3 className="text-xl font-semibold text-foreground mb-3">Automatic Rebalancing</h3>
                    <p className="text-foreground/90 leading-relaxed">
                      If the vault is designed to maintain specific allocation targets, smart contracts can automatically rebalance when thresholds are crossed. No waiting for a manager to notice and act.
                    </p>
                  </div>

                  <div className="border-l-4 border-primary/50 pl-6">
                    <h3 className="text-xl font-semibold text-foreground mb-3">Programmatic Compounding</h3>
                    <p className="text-foreground/90 leading-relaxed">
                      Yield can be automatically harvested and reinvested according to defined schedules, maximizing compound returns without manual intervention.
                    </p>
                  </div>

                  <div className="border-l-4 border-primary/50 pl-6">
                    <h3 className="text-xl font-semibold text-foreground mb-3">Predetermined Fees</h3>
                    <p className="text-foreground/90 leading-relaxed">
                      Fee structures are coded into the contract. A vault cannot suddenly decide to increase fees or add hidden charges. What you see in the code is what you pay.
                    </p>
                  </div>
                </div>

                {/* Comparison Table */}
                <div className="bg-white/5 rounded-lg p-6 mb-6 overflow-x-auto">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Traditional Fund vs. DeFi Vault</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/8">
                        <th className="text-left py-3 text-foreground font-semibold">Aspect</th>
                        <th className="text-left py-3 text-foreground font-semibold">Traditional Fund</th>
                        <th className="text-left py-3 text-foreground font-semibold">DeFi Vault</th>
                      </tr>
                    </thead>
                    <tbody className="text-foreground/80">
                      <tr className="border-b border-white/8">
                        <td className="py-3">Strategy Execution</td>
                        <td className="py-3">Manager discretion</td>
                        <td className="py-3">Smart contract code</td>
                      </tr>
                      <tr className="border-b border-white/8">
                        <td className="py-3">Rule Enforcement</td>
                        <td className="py-3">Trust-based</td>
                        <td className="py-3">Code-enforced</td>
                      </tr>
                      <tr className="border-b border-white/8">
                        <td className="py-3">Strategy Changes</td>
                        <td className="py-3">Manager can change anytime</td>
                        <td className="py-3">Requires governance</td>
                      </tr>
                      <tr className="border-b border-white/8">
                        <td className="py-3">Verification</td>
                        <td className="py-3">Periodic reports</td>
                        <td className="py-3">Real-time on-chain</td>
                      </tr>
                      <tr>
                        <td className="py-3">Fee Transparency</td>
                        <td className="py-3">Complex, layered</td>
                        <td className="py-3">Coded in contract</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 5: Types of DeFi Vaults */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground m-0">Types of DeFi Vaults</h2>
                </div>

                <p className="text-foreground/90 leading-relaxed mb-6">
                  <strong className="text-foreground">The DeFi ecosystem has developed numerous vault types</strong> to serve different investment objectives and risk profiles.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white/5 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Yield Aggregator Vaults</h3>
                    <p className="text-foreground/80 text-sm leading-relaxed">
                      Automatically move capital between yield-generating protocols to maximize returns. Examples include Yearn Finance vaults.
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Lending Vaults</h3>
                    <p className="text-foreground/80 text-sm leading-relaxed">
                      Participate in decentralized lending markets, earning interest on deposited assets through protocols like Aave and Compound.
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Liquidity Provider Vaults</h3>
                    <p className="text-foreground/80 text-sm leading-relaxed">
                      Provide liquidity to DEXs and earn trading fees, with strategies to minimize impermanent loss.
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Delta-Neutral Vaults</h3>
                    <p className="text-foreground/80 text-sm leading-relaxed">
                      Generate yield while minimizing price exposure through hedging strategies that maintain market-neutral positions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 6: Understanding the Risks */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-destructive/20 rounded-lg">
                    <Shield className="w-6 h-6 text-destructive" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground m-0">Understanding the Risks</h2>
                </div>

                <p className="text-foreground/90 leading-relaxed mb-6">
                  <strong className="text-foreground">DeFi vaults offer significant advantages, but they are not without risks.</strong> Transparency does not eliminate risk; it simply allows you to see and evaluate it.
                </p>

                <div className="space-y-6 mb-8">
                  <div className="border-l-4 border-destructive/50 pl-6">
                    <h3 className="text-xl font-semibold text-foreground mb-3">Smart Contract Risk</h3>
                    <p className="text-foreground/90 leading-relaxed">
                      The code is the law in DeFi, which means bugs in the code can lead to loss of funds. Even audited contracts have been exploited.
                    </p>
                  </div>

                  <div className="border-l-4 border-destructive/50 pl-6">
                    <h3 className="text-xl font-semibold text-foreground mb-3">Protocol Risk</h3>
                    <p className="text-foreground/90 leading-relaxed">
                      Vaults often interact with other DeFi protocols. If an underlying protocol is exploited or fails, the vault's deposits could be affected.
                    </p>
                  </div>

                  <div className="border-l-4 border-destructive/50 pl-6">
                    <h3 className="text-xl font-semibold text-foreground mb-3">Economic Risk</h3>
                    <p className="text-foreground/90 leading-relaxed">
                      Market conditions, liquidity crises, or extreme volatility can impact vault performance even when the vault executes its strategy correctly.
                    </p>
                  </div>

                  <div className="border-l-4 border-destructive/50 pl-6">
                    <h3 className="text-xl font-semibold text-foreground mb-3">Governance Risk</h3>
                    <p className="text-foreground/90 leading-relaxed">
                      Some vaults are upgradeable or controlled by governance tokens. Malicious governance proposals could potentially modify vault behavior.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 7: How to Evaluate */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground m-0">How to Evaluate a DeFi Vault</h2>
                </div>

                <p className="text-foreground/90 leading-relaxed mb-6">
                  <strong className="text-foreground">Before depositing into any vault, conduct thorough due diligence.</strong> Here are the key factors to evaluate:
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Security</h3>
                    <ul className="space-y-2 text-foreground/80 text-sm">
                      <li>• Has the smart contract been audited?</li>
                      <li>• How long has the vault been operating?</li>
                      <li>• Is there a bug bounty program?</li>
                    </ul>
                  </div>

                  <div className="bg-white/5 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Strategy</h3>
                    <ul className="space-y-2 text-foreground/80 text-sm">
                      <li>• Can you understand how it generates returns?</li>
                      <li>• What protocols does it interact with?</li>
                      <li>• Are the yields sustainable?</li>
                    </ul>
                  </div>

                  <div className="bg-white/5 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Transparency</h3>
                    <ul className="space-y-2 text-foreground/80 text-sm">
                      <li>• Is the code open-source and verified?</li>
                      <li>• Can you verify holdings in real-time?</li>
                      <li>• Is the fee structure clearly documented?</li>
                    </ul>
                  </div>

                  <div className="bg-white/5 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Governance</h3>
                    <ul className="space-y-2 text-foreground/80 text-sm">
                      <li>• Who built and maintains the vault?</li>
                      <li>• Are there timelock delays on changes?</li>
                      <li>• What is the token distribution?</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Conclusion */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground m-0">Conclusion: Trust Code, Not Promises</h2>
                </div>

                <p className="text-foreground/90 leading-relaxed mb-6">
                  <strong className="text-foreground">The core philosophy of DeFi vaults is simple: trust code, not promises.</strong> Traditional finance asks you to trust that institutions will behave honestly. DeFi vaults replace that trust with mathematical certainty encoded in smart contracts.
                </p>

                <p className="text-foreground/90 leading-relaxed mb-6">
                  This shift matters. In a world where financial institutions have repeatedly betrayed customer trust, the ability to verify everything independently is not just convenient: it is essential. DeFi vaults are not just a new investment product. They are a new paradigm for how investment management should work.
                </p>

                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 border border-primary/20">
                  <h3 className="text-xl font-bold text-foreground mb-3">The Path Forward</h3>
                  <p className="text-foreground/90 leading-relaxed">
                    Understanding DeFi vaults is the first step toward participating in this new paradigm. Whether you choose to invest or simply to learn, the knowledge of how transparent, rules-based investing works will serve you well as the financial system continues to evolve.
                  </p>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="border-t border-white/8 pt-8">
                <p className="text-sm text-white/50 italic leading-relaxed">
                  This content is provided for educational purposes only. It does not constitute financial advice. All investments involve risk, including potential loss of principal. Always conduct your own research and consult with qualified professionals before making investment decisions. Past performance is not indicative of future results.
                </p>
              </div>
            </article>
          </Card>
        </div>
      </div>
      {audioOpen && (
        <AudioPlayer
          text={audioText}
          title={audioTitle}
          onClose={closeAudio}
        />
      )}
    </>
  );
};

export default DefiVaultsExplained;
