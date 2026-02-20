import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp,
  Shield, 
  AlertTriangle, 
  Zap,
  DollarSign,
  Target,
  BarChart3,
  Lock,
  Building2,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { TutorialHeader } from "@/components/course/TutorialHeader";
import { StepNavigation } from "@/components/course/StepNavigation";

const AdvancedDefiProtocolsTutorial = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user } = useAuth();

  const totalSteps = 8;

  const steps = [
    {
      id: 1,
      title: "Advanced DeFi Landscape",
      icon: Building2,
      duration: "4 min",
      content: {
        overview: "Explore advanced DeFi protocols beyond basic swapping and liquidity provision.",
        protocolCategories: [
          {
            category: "Lending & Borrowing",
            description: "Sophisticated money markets with dynamic interest rates",
            protocols: ["Aave", "Compound", "Euler", "Iron Bank"],
            complexity: "Medium",
            yields: "3 to 15% APY",
            risks: ["Liquidation risk", "Interest rate volatility", "Protocol risk"]
          },
          {
            category: "Leveraged Yield Farming",
            description: "Amplify returns using borrowed capital",
            protocols: ["Alpha Homora", "Gearbox", "Yearn V3", "Notional"],
            complexity: "High",
            yields: "10 to 50% APY",
            risks: ["Liquidation risk", "Impermanent loss amplification", "Complex strategies"]
          },
          {
            category: "Options & Derivatives",
            description: "Trade derivatives and structured products",
            protocols: ["Opyn", "Hegic", "Dopex", "Ribbon Finance"],
            complexity: "Very High",
            yields: "Variable",
            risks: ["Total loss potential", "Complex mechanics", "Low liquidity"]
          },
          {
            category: "Synthetic Assets",
            description: "Gain exposure to assets without holding them",
            protocols: ["Synthetix", "Mirror Protocol", "UMA", "Tokemak"],
            complexity: "High",
            yields: "5 to 25% APY",
            risks: ["Depeg risk", "Oracle manipulation", "Collateral requirements"]
          }
        ],
        riskSpectrum: {
          conservative: {
            protocols: ["Aave", "Compound"],
            description: "Blue-chip lending with established track records",
            allocation: "50 to 70% of DeFi portfolio"
          },
          moderate: {
            protocols: ["Yearn", "Convex", "Curve"],
            description: "Established yield strategies with moderate complexity",
            allocation: "20 to 40% of DeFi portfolio"
          },
          aggressive: {
            protocols: ["Alpha Homora", "Ribbon", "Hegic"],
            description: "High-yield strategies with significant risks",
            allocation: "5 to 15% of DeFi portfolio"
          },
          experimental: {
            protocols: ["New protocols", "Novel strategies"],
            description: "Cutting-edge DeFi with unproven track records",
            allocation: "1 to 5% of DeFi portfolio"
          }
        }
      }
    },
    {
      id: 2,
      title: "Lending & Borrowing Mastery",
      icon: DollarSign,
      duration: "6 min",
      content: {
        overview: "Master advanced lending and borrowing strategies across leading protocols.",
        coreProtocols: [
          {
            protocol: "Aave",
            features: ["Flash loans", "Rate switching", "Collateral management", "Liquidation protection"],
            advantages: ["Most liquid", "Feature-rich", "Multi-chain", "Strong governance"],
            bestFor: "Large positions, advanced features",
            riskLevel: "Low-Medium"
          },
          {
            protocol: "Compound",
            features: ["Autonomous interest rates", "Governance tokens", "Simple interface"],
            advantages: ["Battle-tested", "Decentralized", "Clean UX", "Institutional adoption"],
            bestFor: "Set-and-forget lending",
            riskLevel: "Low"
          },
          {
            protocol: "Euler",
            features: ["Permissionless listing", "Protected collateral", "MEV resistance"],
            advantages: ["Any ERC20 token", "Advanced risk management", "Fair liquidations"],
            bestFor: "Long-tail assets, sophisticated users",
            riskLevel: "Medium"
          }
        ],
        advancedStrategies: [
          {
            strategy: "Recursive Lending",
            description: "Borrow against deposited collateral to increase exposure",
            example: "Deposit ETH → Borrow USDC → Buy more ETH → Repeat",
            riskLevel: "High",
            maxLeverage: "3 to 5x",
            considerations: ["Liquidation price", "Gas costs", "Interest rate changes"]
          },
          {
            strategy: "Rate Arbitrage",
            description: "Profit from interest rate differences across protocols",
            example: "Borrow on Compound at 3% → Lend on Aave at 5%",
            riskLevel: "Medium",
            profitability: "1 to 3% APY",
            considerations: ["Rate volatility", "Gas costs", "Opportunity cost"]
          },
          {
            strategy: "Flash Loan Strategies",
            description: "Use uncollateralized loans for arbitrage and liquidations",
            example: "Flash loan → Liquidate undercollateralized position → Profit",
            riskLevel: "Medium-High",
            requirements: ["Technical knowledge", "Smart contract skills", "MEV protection"]
          },
          {
            strategy: "Collateral Optimization",
            description: "Maximize capital efficiency through strategic collateral choices",
            example: "Use high-LTV assets like ETH, avoid volatile collateral",
            riskLevel: "Low-Medium",
            benefits: ["Higher leverage", "Lower liquidation risk", "Better rates"]
          }
        ],
        riskManagement: [
          {
            risk: "Liquidation Risk",
            mitigation: ["Maintain high health factor", "Set price alerts", "Use stable collateral"],
            monitoring: "Check health factor daily, especially during volatility"
          },
          {
            risk: "Interest Rate Risk",
            mitigation: ["Use stable rate when available", "Monitor rate trends", "Have exit strategy"],
            monitoring: "Track utilization rates and governance proposals"
          },
          {
            risk: "Protocol Risk",
            mitigation: ["Diversify across protocols", "Use established platforms", "Monitor audits"],
            monitoring: "Follow protocol updates and security reports"
          }
        ]
      }
    },
    {
      id: 3,
      title: "Leveraged Yield Farming",
      icon: Zap,
      duration: "7 min",
      content: {
        overview: "Learn to amplify DeFi yields through leveraged strategies while managing risks.",
        leverageMechanics: {
          howItWorks: "Borrow additional capital to increase position size and potential returns",
          example: "$1000 + $2000 borrowed = $3000 position (3x leverage)",
          amplification: "Both gains and losses are multiplied by leverage ratio",
          costs: "Interest on borrowed funds reduces net yield"
        },
        popularProtocols: [
          {
            protocol: "Alpha Homora",
            specialty: "Leveraged liquidity provision",
            maxLeverage: "2.5x",
            supportedPools: ["Uniswap V2", "SushiSwap", "Curve"],
            features: ["Automated position management", "Liquidation protection", "Yield optimization"],
            riskLevel: "High"
          },
          {
            protocol: "Gearbox",
            specialty: "Leveraged farming with Credit Account",
            maxLeverage: "4x",
            supportedPools: ["Curve", "Uniswap V3", "Yearn"],
            features: ["Multi-protocol strategies", "Margin trading", "Risk management"],
            riskLevel: "High"
          },
          {
            protocol: "Yearn V3",
            specialty: "Automated leveraged strategies",
            maxLeverage: "3x",
            supportedPools: ["Multi-protocol"],
            features: ["Auto-compounding", "Gas optimization", "Risk adjustment"],
            riskLevel: "Medium-High"
          }
        ],
        strategyTypes: [
          {
            strategy: "Leveraged LP Farming",
            description: "Provide liquidity with borrowed funds",
            process: [
              "Deposit collateral",
              "Borrow additional tokens",
              "Provide liquidity to DEX",
              "Earn trading fees + farming rewards",
              "Pay interest on borrowed amount"
            ],
            profitFormula: "(LP rewards + fees) × leverage - borrowing costs",
            optimalConditions: "High farming rewards, low borrowing rates, stable pair"
          },
          {
            strategy: "Leveraged Staking",
            description: "Stake tokens with leverage for higher rewards",
            process: [
              "Deposit collateral (e.g., ETH)",
              "Borrow more of same token",
              "Stake total amount",
              "Earn staking rewards on larger position"
            ],
            profitFormula: "Staking rewards × leverage - borrowing costs",
            optimalConditions: "Staking rewards > borrowing costs + safety margin"
          },
          {
            strategy: "Delta-Neutral Farming",
            description: "Farm rewards while hedging price exposure",
            process: [
              "Provide liquidity to LP",
              "Short equivalent amount on derivatives",
              "Earn farming rewards",
              "Minimize price risk"
            ],
            profitFormula: "Farming rewards, hedging costs, and impermanent loss",
            optimalConditions: "High farming rewards, efficient hedging markets"
          }
        ],
        riskManagement: [
          {
            risk: "Liquidation Risk",
            causes: ["Price drops", "Increased borrow rates", "Decreased rewards"],
            prevention: ["Conservative leverage", "Stop-loss levels", "Health monitoring"],
            response: ["Reduce position", "Add collateral", "Close position"]
          },
          {
            risk: "Impermanent Loss Amplification",
            causes: ["Price divergence amplified by leverage"],
            prevention: ["Choose stable pairs", "Monitor IL constantly", "Use delta-neutral strategies"],
            response: ["Exit position early", "Hedge with derivatives", "Accept losses"]
          },
          {
            risk: "Strategy Risk",
            causes: ["Reward token dumps", "Protocol issues", "Liquidity problems"],
            prevention: ["Diversify strategies", "Monitor protocols", "Have exit plans"],
            response: ["Emergency exit", "Switch protocols", "Reduce leverage"]
          }
        ]
      }
    },
    {
      id: 4,
      title: "Options & Derivatives",
      icon: BarChart3,
      duration: "6 min",
      content: {
        overview: "Navigate the complex world of DeFi options and derivative instruments.",
        optionsBasics: {
          definition: "Contracts giving the right (not obligation) to buy/sell assets at specific prices",
          callOption: "Right to buy at strike price: bullish strategy",
          putOption: "Right to sell at strike price: bearish/protective strategy",
          premium: "Cost to purchase the option",
          expiration: "Date when option expires worthless if not exercised"
        },
        majorProtocols: [
          {
            protocol: "Opyn",
            type: "European options",
            features: ["Cash-settled", "Squeeth (squared ETH)", "Automated strategies"],
            assets: ["ETH", "WBTC", "DPI"],
            complexity: "High",
            liquidity: "Medium"
          },
          {
            protocol: "Hegic",
            type: "American options",
            features: ["Exercise anytime", "Automated market maker", "HEGIC staking"],
            assets: ["ETH", "WBTC"],
            complexity: "Medium",
            liquidity: "Medium"
          },
          {
            protocol: "Dopex",
            type: "Decentralized options exchange",
            features: ["Synthetic options", "Option pools", "Rebate tokens"],
            assets: ["DPX", "ETH", "GMX"],
            complexity: "High",
            liquidity: "Low-Medium"
          },
          {
            protocol: "Ribbon Finance",
            type: "Automated options strategies",
            features: ["Covered calls", "Put selling", "Structured products"],
            assets: ["ETH", "WBTC", "AVAX", "SOL"],
            complexity: "Medium",
            liquidity: "High"
          }
        ],
        strategiesGuide: [
          {
            strategy: "Covered Calls (Ribbon Theta Vaults)",
            description: "Earn premium by selling call options on holdings",
            when: "Neutral to slightly bullish market outlook",
            howItWorks: "Deposit ETH → Vault sells weekly calls → Earn premium",
            maxGain: "Premium received + any appreciation up to strike",
            maxLoss: "Opportunity cost if price rises above strike",
            suitability: "Conservative investors wanting steady income"
          },
          {
            strategy: "Protective Puts",
            description: "Buy puts to protect against downside",
            when: "Holding assets but expect potential downside",
            howItWorks: "Hold ETH + Buy ETH puts → Protected if price falls",
            maxGain: "Unlimited upside: premium paid",
            maxLoss: "Limited to strike price - premium",
            suitability: "Risk-averse holders during uncertain times"
          },
          {
            strategy: "Squeeth (Opyn)",
            description: "Get leveraged ETH exposure without liquidation risk",
            when: "Bullish on ETH with high conviction",
            howItWorks: "Buy squeeth tokens to get 2x ETH exposure without margin calls",
            maxGain: "Unlimited (squared ETH returns)",
            maxLoss: "100% of premium (no liquidation)",
            suitability: "Sophisticated traders comfortable with volatility"
          }
        ],
        riskConsiderations: [
          {
            risk: "Total Loss of Premium",
            explanation: "Options can expire worthless",
            mitigation: "Only risk what you can afford to lose, diversify expiration dates"
          },
          {
            risk: "Opportunity Cost",
            explanation: "Covered calls cap upside potential",
            mitigation: "Choose appropriate strike prices, monitor market conditions"
          },
          {
            risk: "Liquidity Risk",
            explanation: "Difficult to exit positions early",
            mitigation: "Stick to liquid protocols, understand time decay"
          },
          {
            risk: "Complexity Risk",
            explanation: "Misunderstanding strategy mechanics",
            mitigation: "Start small, paper trade first, understand Greeks"
          }
        ]
      }
    },
    {
      id: 5,
      title: "Synthetic Assets",
      icon: RefreshCw,
      duration: "5 min",
      content: {
        overview: "Understand synthetic assets that provide exposure to real-world assets through DeFi.",
        syntheticsExplained: {
          definition: "Tokenized derivatives tracking the price of underlying assets",
          backing: "Collateralized by crypto assets (usually over-collateralized)",
          priceTracking: "Oracle systems maintain peg to underlying asset",
          advantages: ["24/7 trading", "No custody needed", "Programmable", "Global access"]
        },
        majorProtocols: [
          {
            protocol: "Synthetix",
            assets: ["sETH", "sBTC", "sUSD", "sTSLA", "sGOLD"],
            collateral: "SNX tokens (staking)",
            collateralRatio: "500%",
            features: ["Debt sharing", "Staking rewards", "Fee sharing"],
            complexity: "High"
          },
          {
            protocol: "Mirror Protocol",
            assets: ["mTSLA", "mAAPL", "mGOOGL", "mAMZN"],
            collateral: "UST, mAssets",
            collateralRatio: "150%",
            features: ["Stock exposure", "Farming rewards", "Governance"],
            complexity: "Medium"
          },
          {
            protocol: "UMA",
            assets: ["Custom synthetics", "uSTONKS", "uGAS"],
            collateral: "Various ERC-20",
            collateralRatio: "Variable",
            features: ["Create custom synthetics", "Optimistic oracle", "Dispute resolution"],
            complexity: "Very High"
          }
        ],
        useCases: [
          {
            useCase: "Stock Market Exposure",
            protocols: ["Mirror", "Synthetix"],
            benefits: ["24/7 trading", "No broker needed", "Fractional shares"],
            risks: ["Depeg risk", "Regulatory uncertainty", "Oracle failures"],
            example: "Buy mTSLA to gain Tesla exposure without traditional broker"
          },
          {
            useCase: "Commodity Exposure",
            protocols: ["Synthetix"],
            benefits: ["Gold/silver exposure", "No storage costs", "High liquidity"],
            risks: ["Tracking errors", "Collateral liquidation", "Regulatory risk"],
            example: "Hold sGOLD for gold exposure in DeFi portfolio"
          },
          {
            useCase: "Currency Hedging",
            protocols: ["Synthetix", "UMA"],
            benefits: ["Forex exposure", "Hedge home currency", "Global diversification"],
            risks: ["High volatility", "Funding costs", "Complexity"],
            example: "Use sEUR to hedge against USD weakness"
          },
          {
            useCase: "Custom Indices",
            protocols: ["UMA", "Synthetix"],
            benefits: ["Create unique exposures", "Programmable finance", "Innovation"],
            risks: ["Technical complexity", "Low liquidity", "Oracle design"],
            example: "Create synthetic basket of DeFi tokens"
          }
        ],
        riskFramework: [
          {
            risk: "Depeg Risk",
            description: "Synthetic asset price deviates from underlying",
            causes: ["Oracle failures", "Liquidity issues", "Market stress"],
            mitigation: ["Monitor peg closely", "Use liquid synthetics", "Have exit strategy"]
          },
          {
            risk: "Collateral Risk",
            description: "Underlying collateral loses value",
            causes: ["Crypto volatility", "Liquidation cascades", "Protocol issues"],
            mitigation: ["Understand collateral ratios", "Monitor protocol health", "Diversify"]
          },
          {
            risk: "Regulatory Risk",
            description: "Legal challenges to synthetic assets",
            causes: ["Securities regulations", "Government intervention", "Compliance issues"],
            mitigation: ["Stay informed", "Geographic diversification", "Use established protocols"]
          }
        ]
      }
    },
    {
      id: 6,
      title: "Protocol Integration Strategies",
      icon: Target,
      duration: "5 min",
      content: {
        overview: "Learn to combine multiple protocols for maximum efficiency and yield.",
        integrationApproaches: [
          {
            approach: "Yield Stacking",
            description: "Layer multiple yield sources on same capital",
            example: "Deposit USDC → Aave → Borrow USDC → Curve → Farm CRV",
            complexity: "Medium",
            benefits: ["Higher total yield", "Multiple reward tokens", "Diversified income"],
            risks: ["Increased smart contract risk", "Complex liquidation scenarios", "Gas costs"]
          },
          {
            approach: "Cross-Protocol Arbitrage",
            description: "Profit from price differences across protocols",
            example: "Buy token on Uniswap → Sell on SushiSwap → Pocket difference",
            complexity: "High",
            benefits: ["Market-neutral profits", "Quick execution", "Scalable"],
            risks: ["MEV competition", "Gas cost erosion", "Timing risk"]
          },
          {
            approach: "Automated Strategies",
            description: "Use aggregators and vaults for optimized yields",
            example: "Yearn vault automatically moves funds to highest yield",
            complexity: "Low",
            benefits: ["Professional management", "Gas optimization", "Automatic rebalancing"],
            risks: ["Strategy risk", "Fee drag", "Limited control"]
          }
        ],
        advancedCombinations: [
          {
            strategy: "The Basis Trade",
            protocols: ["Compound", "Perpetual DEX"],
            process: [
              "Lend stablecoins on Compound",
              "Short crypto perpetuals with funding",
              "Earn lending rate + funding rate",
              "Market-neutral position"
            ],
            targetYield: "8 to 20% APY",
            riskLevel: "Medium"
          },
          {
            strategy: "Curve Convex Optimization",
            protocols: ["Curve", "Convex", "Aura"],
            process: [
              "Deposit LP tokens to Curve",
              "Stake on Convex for boosted rewards",
              "Lock CVX for maximum boost",
              "Harvest and compound regularly"
            ],
            targetYield: "10 to 30% APY",
            riskLevel: "Medium"
          },
          {
            strategy: "Leveraged Stablecoin Farming",
            protocols: ["Aave", "Curve", "Convex"],
            process: [
              "Deposit USDC to Aave",
              "Borrow USDC (recursive lending)",
              "Provide liquidity to stable pools",
              "Farm rewards with leverage"
            ],
            targetYield: "15 to 40% APY",
            riskLevel: "High"
          }
        ],
        gasOptimization: [
          {
            technique: "Transaction Batching",
            description: "Combine multiple operations in single transaction",
            savings: "50 to 80% gas reduction",
            tools: ["1inch", "Zapper", "DeFiSaver"]
          },
          {
            technique: "Layer 2 Strategies",
            description: "Use cheaper chains for frequent operations",
            savings: "90 to 99% gas reduction",
            considerations: ["Bridge costs", "Liquidity differences", "Protocol availability"]
          },
          {
            technique: "Timing Optimization",
            description: "Execute during low gas periods",
            savings: "30 to 70% gas reduction",
            tools: ["GasNow", "ETH Gas Station", "Gas price alerts"]
          }
        ]
      }
    },
    {
      id: 7,
      title: "Risk Management Framework",
      icon: Shield,
      duration: "6 min",
      content: {
        overview: "Develop a comprehensive risk management approach for advanced DeFi strategies.",
        riskCategories: [
          {
            category: "Smart Contract Risk",
            description: "Bugs or exploits in protocol code",
            examples: ["Flash loan attacks", "Reentrancy bugs", "Oracle manipulation"],
            mitigation: ["Use audited protocols", "Diversify across protocols", "Monitor security updates"],
            allocation: "Limit exposure to newer protocols to 10 to 20% of portfolio"
          },
          {
            category: "Liquidation Risk",
            description: "Forced sale of collateral when ratios are breached",
            examples: ["Price drops", "Interest rate spikes", "Oracle failures"],
            mitigation: ["Conservative ratios", "Price alerts", "Emergency funds"],
            allocation: "Never use more than 70% of available borrowing capacity"
          },
          {
            category: "Governance Risk",
            description: "Protocol changes affecting your positions",
            examples: ["Parameter changes", "Fee increases", "Protocol upgrades"],
            mitigation: ["Participate in governance", "Monitor proposals", "Have exit strategies"],
            allocation: "Stay informed on protocols representing >25% of portfolio"
          },
          {
            category: "Regulatory Risk",
            description: "Legal changes affecting DeFi protocols",
            examples: ["Securities classification", "Tax changes", "Protocol bans"],
            mitigation: ["Geographic diversification", "Compliance monitoring", "Legal structure"],
            allocation: "Consider regulatory-compliant protocols for larger allocations"
          }
        ],
        positionSizing: [
          {
            principle: "1% Rule",
            description: "Never risk more than 1% of portfolio on single position",
            application: "For high-risk strategies like leveraged farming",
            example: "$100k portfolio → Max $1k in risky single position"
          },
          {
            principle: "5% Protocol Rule",
            description: "Limit exposure to any single protocol",
            application: "Diversify across multiple protocols",
            example: "Max 5% in any one lending protocol"
          },
          {
            principle: "Kelly Criterion",
            description: "Optimal bet sizing based on win rate and payoff",
            application: "For strategies with measurable probabilities",
            formula: "f = (bp - q) / b where f=fraction, b=odds, p=win rate, q=loss rate"
          }
        ],
        monitoringSystem: [
          {
            metric: "Health Factor",
            frequency: "Daily",
            threshold: "< 1.5 requires immediate attention",
            tools: ["DefiSaver", "Instadapp", "Zerion"],
            automation: "Set up alerts and auto-liquidation protection"
          },
          {
            metric: "APY Sustainability",
            frequency: "Weekly",
            threshold: "APY drops >50% from average",
            tools: ["DefiPulse", "DefiLlama", "Coingecko"],
            automation: "Use yield farming aggregators with auto-migration"
          },
          {
            metric: "Protocol TVL",
            frequency: "Weekly",
            threshold: "TVL drops >30% rapidly",
            tools: ["DefiLlama", "DeFiPulse"],
            automation: "Set up TVL alerts for major holdings"
          },
          {
            metric: "Token Unlock Schedule",
            frequency: "Monthly",
            threshold: "Major unlocks approaching",
            tools: ["Token Terminal", "Protocol docs"],
            automation: "Calendar reminders for major unlock events"
          }
        ],
        emergencyProcedures: [
          {
            scenario: "Market Crash",
            triggers: ["Crypto down >20% in 24h", "Multiple liquidations"],
            response: [
              "Reduce leverage immediately",
              "Add collateral to maintain health ratios",
              "Close risky positions",
              "Move to stablecoins if needed"
            ],
            preparation: "Keep 10 to 20% in stablecoins for emergencies"
          },
          {
            scenario: "Protocol Exploit",
            triggers: ["Security alerts", "Unusual protocol behavior", "Community warnings"],
            response: [
              "Exit affected positions immediately",
              "Revoke token approvals",
              "Monitor for further developments",
              "Document for potential claims"
            ],
            preparation: "Follow security researchers and protocol communications"
          },
          {
            scenario: "Regulatory Action",
            triggers: ["Government announcements", "Exchange delistings"],
            response: [
              "Assess legal exposure",
              "Consider geographic relocation of assets",
              "Consult legal counsel if needed",
              "Switch to compliant alternatives"
            ],
            preparation: "Understand local regulations and compliance requirements"
          }
        ]
      }
    },
    {
      id: 8,
      title: "Advanced Portfolio Construction",
      icon: TrendingUp,
      duration: "7 min",
      content: {
        overview: "Build sophisticated DeFi portfolios that balance risk, return, and complexity.",
        portfolioFramework: {
          conservative: {
            allocation: "70% Blue-chip protocols",
            protocols: ["Aave", "Compound", "Curve", "Uniswap"],
            strategies: ["Simple lending", "Stable LP", "Low-risk farming"],
            targetAPY: "5 to 12%",
            riskLevel: "Low"
          },
          balanced: {
            allocation: "50% Blue-chip, 30% Established, 20% Growth",
            protocols: ["Aave", "Yearn", "Convex", "GMX", "Arbitrum ecosystem"],
            strategies: ["Diversified lending", "Yield optimization", "L2 farming"],
            targetAPY: "8 to 20%",
            riskLevel: "Medium"
          },
          aggressive: {
            allocation: "30% Blue-chip, 40% Established, 20% Growth, 10% Experimental",
            protocols: ["Full spectrum", "New protocols", "Leveraged strategies"],
            strategies: ["Leveraged farming", "Options", "New protocol farming"],
            targetAPY: "15 to 50%",
            riskLevel: "High"
          }
        },
        diversificationPrinciples: [
          {
            dimension: "Protocol Diversification",
            rationale: "Reduce smart contract risk",
            implementation: ["Max 20% in any protocol", "Use 5 to 10 different protocols"],
            monitoring: "Track protocol concentration monthly"
          },
          {
            dimension: "Strategy Diversification",
            rationale: "Reduce strategy-specific risks",
            implementation: ["Mix lending, LP, farming, derivatives", "Uncorrelated strategies"],
            monitoring: "Analyze strategy correlation quarterly"
          },
          {
            dimension: "Chain Diversification",
            rationale: "Reduce blockchain-specific risks",
            implementation: ["Use multiple L1s and L2s", "Consider bridge risks"],
            monitoring: "Track chain concentration and bridge exposures"
          },
          {
            dimension: "Temporal Diversification",
            rationale: "Reduce timing risk",
            implementation: ["Stagger entry/exit", "DCA into positions", "Rebalance regularly"],
            monitoring: "Review entry timing and market cycles"
          }
        ],
        rebalancingStrategy: [
          {
            trigger: "Time-Based",
            frequency: "Monthly",
            rationale: "Maintain target allocations",
            implementation: "Rebalance if allocation drift >10% from target"
          },
          {
            trigger: "Threshold-Based",
            frequency: "As needed",
            rationale: "Respond to significant moves",
            implementation: "Rebalance if any position >15% from target"
          },
          {
            trigger: "Opportunity-Based",
            frequency: "Market dependent",
            rationale: "Capture market dislocations",
            implementation: "Increase allocation to undervalued opportunities"
          },
          {
            trigger: "Risk-Based",
            frequency: "As needed",
            rationale: "Manage risk exposures",
            implementation: "Reduce leverage during high volatility"
          }
        ],
        performanceTracking: [
          {
            metric: "Total Return",
            calculation: "(Ending Value - Starting Value + Income) / Starting Value",
            frequency: "Daily tracking, monthly analysis",
            benchmark: "DeFi index or custom benchmark"
          },
          {
            metric: "Risk-Adjusted Return",
            calculation: "Sharpe ratio, Sortino ratio, and Maximum drawdown",
            frequency: "Monthly calculation",
            benchmark: "Compare to risk-free rate and market"
          },
          {
            metric: "Gas Efficiency",
            calculation: "Returns after gas costs / Returns before gas",
            frequency: "Monthly tracking",
            optimization: "Batch transactions, use L2s"
          },
          {
            metric: "Strategy Attribution",
            calculation: "Performance by strategy/protocol",
            frequency: "Monthly analysis",
            insights: "Identify best/worst performing strategies"
          }
        ],
        taxOptimization: [
          {
            strategy: "Harvest Losses",
            description: "Realize losses to offset gains",
            timing: "Before year-end",
            considerations: "Wash sale rules, opportunity cost"
          },
          {
            strategy: "Defer Gains",
            description: "Delay realizing gains when possible",
            timing: "Strategic timing based on tax situation",
            considerations: "Risk of further losses, liquidity needs"
          },
          {
            strategy: "Use Tax-Advantaged Accounts",
            description: "DeFi in retirement accounts where legal",
            timing: "Ongoing",
            considerations: "Regulatory compliance, custodial requirements"
          }
        ]
      }
    }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);

  const handleNext = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to progress through the tutorial",
        variant: "destructive"
      });
      return;
    }
    if (currentStep < totalSteps) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(currentStep + 1);
    } else {
      setCompletedSteps(prev => [...prev, currentStep]);
      
      // Save completion to localStorage
      const completed = JSON.parse(localStorage.getItem('completedTutorials') || '[]');
      if (!completed.includes('advanced-defi-protocols')) {
        completed.push('advanced-defi-protocols');
        localStorage.setItem('completedTutorials', JSON.stringify(completed));
      }
      
      toast({
        title: "Tutorial Complete! 🎉",
        description: "You've mastered advanced DeFi protocols. Ready to explore more?",
      });
      
      setTimeout(() => {
        window.location.href = '/tutorials?tab=advanced';
      }, 1500);
    }
  };

  const handlePrevious = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to navigate the tutorial",
        variant: "destructive"
      });
      return;
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepChange = (stepId: number) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to navigate the tutorial",
        variant: "destructive"
      });
      return;
    }
    setCurrentStep(stepId);
  };

  const handleStepComplete = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to track your progress",
        variant: "destructive"
      });
      return;
    }
    setCompletedSteps(prev => [...prev, currentStep]);
    toast({
      title: "Step completed!",
      description: `You've completed step ${currentStep}: ${currentStepData?.title}`,
    });
  };

  const isStepCompleted = (stepId: number) => completedSteps.includes(stepId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Authentication Notice */}
        {!user && (
          <Alert className="mb-6 border-primary/50 bg-primary/5">
            <Lock className="h-4 w-4" />
            <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span>Sign in to track your progress and interact with tutorial steps</span>
              <Button size="sm" onClick={() => navigate('/auth')} className="shrink-0">
                Sign In
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <TutorialHeader
          title="Advanced DeFi Protocols"
          icon={Building2}
          difficulty="Advanced"
          duration="40 min"
          currentStep={currentStep}
          totalSteps={totalSteps}
          completedSteps={completedSteps}
        />

        {/* Current Step Content */}
        {currentStepData && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <currentStepData.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{currentStepData.title}</CardTitle>
                    <CardDescription>
                      Estimated time: {currentStepData.duration}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={isStepCompleted(currentStep) ? "default" : "secondary"}>
                  {isStepCompleted(currentStep) ? "Completed" : "In Progress"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 tutorial-content-area">
              <p className="text-muted-foreground leading-relaxed">{currentStepData.content.overview}</p>

              {/* Step 1: Advanced DeFi Landscape */}
              {currentStep === 1 && currentStepData.content.protocolCategories && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Protocol Categories</h3>
                    <div className="grid gap-4">
                      {currentStepData.content.protocolCategories.map((cat: any, idx: number) => (
                        <Card key={idx} className="p-3 md:p-4">
                          <h4 className="font-semibold text-primary mb-2 text-sm md:text-base">{cat.category}</h4>
                          <p className="text-xs md:text-sm text-muted-foreground mb-3">{cat.description}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm">
                            <div className="break-words"><span className="font-medium">Protocols:</span> {cat.protocols.join(', ')}</div>
                            <div><span className="font-medium">Yields:</span> {cat.yields}</div>
                            <div className="flex items-center gap-1 flex-wrap"><span className="font-medium">Complexity:</span> <Badge variant="outline" className="text-xs">{cat.complexity}</Badge></div>
                            <div className="break-words"><span className="font-medium">Risks:</span> {cat.risks.join(', ')}</div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Risk Spectrum Allocation:</strong> Conservative (50 to 70%), Moderate (20 to 40%), Aggressive (5 to 15%), Experimental (1 to 5%)
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Step 2: Lending & Borrowing */}
              {currentStep === 2 && currentStepData.content.coreProtocols && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Core Protocols</h3>
                    <div className="grid gap-4">
                      {currentStepData.content.coreProtocols.map((protocol: any, idx: number) => (
                        <Card key={idx} className="p-3 md:p-4">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                            <h4 className="font-semibold text-primary text-sm md:text-base">{protocol.protocol}</h4>
                            <Badge className="w-fit text-xs">{protocol.riskLevel}</Badge>
                          </div>
                          <p className="text-xs md:text-sm mb-2"><strong>Best for:</strong> {protocol.bestFor}</p>
                          <p className="text-xs md:text-sm mb-2 break-words"><strong>Features:</strong> {protocol.features.join(', ')}</p>
                          <p className="text-xs text-muted-foreground break-words">{protocol.advantages.join(' • ')}</p>
                        </Card>
                      ))}
                    </div>
                  </div>
                  {currentStepData.content.advancedStrategies && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Advanced Strategies</h3>
                      <div className="space-y-3">
                        {currentStepData.content.advancedStrategies.map((strategy: any, idx: number) => (
                          <Card key={idx} className="p-3 md:p-4">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                              <h4 className="font-semibold text-sm md:text-base">{strategy.strategy}</h4>
                              <Badge variant="outline" className="w-fit text-xs">{strategy.riskLevel}</Badge>
                            </div>
                            <p className="text-xs md:text-sm mb-2">{strategy.description}</p>
                            <p className="text-xs md:text-sm text-primary mb-1 break-words"><strong>Example:</strong> {strategy.example}</p>
                            {strategy.considerations && (
                              <p className="text-xs text-muted-foreground break-words">⚠️ {strategy.considerations.join(' • ')}</p>
                            )}
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Leveraged Yield Farming */}
              {currentStep === 3 && currentStepData.content.popularProtocols && (
                <div className="space-y-6">
                  <Alert className="bg-awareness/10 border-awareness">
                    <Zap className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Leverage amplifies both gains and losses.</strong> {currentStepData.content.leverageMechanics?.howItWorks}
                    </AlertDescription>
                  </Alert>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Popular Protocols</h3>
                    <div className="grid gap-4">
                      {currentStepData.content.popularProtocols.map((protocol: any, idx: number) => (
                        <Card key={idx} className="p-3 md:p-4">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                            <h4 className="font-semibold text-primary text-sm md:text-base">{protocol.protocol}</h4>
                            <Badge className="w-fit text-xs">{protocol.riskLevel}</Badge>
                          </div>
                          <p className="text-xs md:text-sm mb-2">{protocol.specialty} (Max {protocol.maxLeverage})</p>
                          <p className="text-xs text-muted-foreground mb-2 break-words">Pools: {protocol.supportedPools.join(', ')}</p>
                          <p className="text-xs break-words">{protocol.features.join(' • ')}</p>
                        </Card>
                      ))}
                    </div>
                  </div>
                  {currentStepData.content.strategyTypes && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Strategy Types</h3>
                      <div className="space-y-3">
                        {currentStepData.content.strategyTypes.map((strategy: any, idx: number) => (
                          <Card key={idx} className="p-4">
                            <h4 className="font-semibold mb-2">{strategy.strategy}</h4>
                            <p className="text-sm mb-2">{strategy.description}</p>
                            <div className="text-xs space-y-1">
                              <p><strong>Optimal conditions:</strong> {strategy.optimalConditions}</p>
                              <p className="text-primary"><strong>Formula:</strong> {strategy.profitFormula}</p>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Options & Derivatives */}
              {currentStep === 4 && currentStepData.content.majorProtocols && (
                <div className="space-y-6">
                  {currentStepData.content.optionsBasics && (
                    <Card className="p-4 bg-muted/50">
                      <h3 className="font-semibold mb-2">Options Basics</h3>
                      <div className="text-sm space-y-1">
                        <p>{currentStepData.content.optionsBasics.definition}</p>
                        <p><strong>Call:</strong> {currentStepData.content.optionsBasics.callOption}</p>
                        <p><strong>Put:</strong> {currentStepData.content.optionsBasics.putOption}</p>
                      </div>
                    </Card>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Major Protocols</h3>
                    <div className="grid gap-3">
                      {currentStepData.content.majorProtocols.map((protocol: any, idx: number) => (
                        <Card key={idx} className="p-3 md:p-4">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                            <h4 className="font-semibold text-primary text-sm md:text-base">{protocol.protocol}</h4>
                            <Badge className="w-fit text-xs">{protocol.liquidity} Liquidity</Badge>
                          </div>
                          <p className="text-xs md:text-sm mb-1">{protocol.type}</p>
                          <p className="text-xs text-muted-foreground break-words">Assets: {protocol.assets.join(', ')}</p>
                        </Card>
                      ))}
                    </div>
                  </div>
                  {currentStepData.content.strategiesGuide && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Strategies Guide</h3>
                      <div className="space-y-3">
                        {currentStepData.content.strategiesGuide.map((strategy: any, idx: number) => (
                          <Card key={idx} className="p-3 md:p-4">
                            <h4 className="font-semibold mb-2 text-sm md:text-base">{strategy.strategy}</h4>
                            <p className="text-xs md:text-sm mb-2">{strategy.description}</p>
                            <div className="text-xs space-y-1 text-muted-foreground">
                              <p className="break-words"><strong>When:</strong> {strategy.when}</p>
                              <p className="break-words"><strong>How:</strong> {strategy.howItWorks}</p>
                              <p className="text-awareness break-words"><strong>Best for:</strong> {strategy.suitability}</p>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 5: Synthetic Assets */}
              {currentStep === 5 && currentStepData.content.majorProtocols && (
                <div className="space-y-6">
                  {currentStepData.content.syntheticsExplained && (
                    <Card className="p-3 md:p-4 bg-muted/50">
                      <h3 className="font-semibold mb-2 text-sm md:text-base">What are Synthetics?</h3>
                      <p className="text-xs md:text-sm mb-2">{currentStepData.content.syntheticsExplained.definition}</p>
                      <p className="text-xs text-muted-foreground break-words">Advantages: {currentStepData.content.syntheticsExplained.advantages.join(' • ')}</p>
                    </Card>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Major Protocols</h3>
                    <div className="grid gap-3">
                      {currentStepData.content.majorProtocols.map((protocol: any, idx: number) => (
                        <Card key={idx} className="p-3 md:p-4">
                          <h4 className="font-semibold text-primary mb-2 text-sm md:text-base">{protocol.protocol}</h4>
                          <div className="text-xs md:text-sm space-y-1">
                            <p className="break-words"><strong>Assets:</strong> {protocol.assets.join(', ')}</p>
                            <p className="break-words"><strong>Collateral:</strong> {protocol.collateral} ({protocol.collateralRatio})</p>
                            <p className="text-xs text-muted-foreground break-words">{protocol.features.join(' • ')}</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                  {currentStepData.content.useCases && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Use Cases</h3>
                      <div className="space-y-3">
                        {currentStepData.content.useCases.map((useCase: any, idx: number) => (
                          <Card key={idx} className="p-3 md:p-4">
                            <h4 className="font-semibold mb-2 text-sm md:text-base">{useCase.useCase}</h4>
                            <p className="text-xs md:text-sm mb-2 break-words"><strong>Example:</strong> {useCase.example}</p>
                            <div className="text-xs space-y-1">
                              <p className="text-awareness break-words">Benefits: {useCase.benefits.join(', ')}</p>
                              <p className="text-destructive break-words">Risks: {useCase.risks.join(', ')}</p>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 6: Protocol Integration */}
              {currentStep === 6 && currentStepData.content.integrationApproaches && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Integration Approaches</h3>
                    <div className="space-y-3">
                      {currentStepData.content.integrationApproaches.map((approach: any, idx: number) => (
                        <Card key={idx} className="p-3 md:p-4">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                            <h4 className="font-semibold text-sm md:text-base">{approach.approach}</h4>
                            <Badge className="w-fit text-xs">{approach.complexity}</Badge>
                          </div>
                          <p className="text-xs md:text-sm mb-2">{approach.description}</p>
                          <p className="text-xs text-primary mb-1 break-words"><strong>Example:</strong> {approach.example}</p>
                          <p className="text-xs text-muted-foreground break-words">Benefits: {approach.benefits.join(' • ')}</p>
                        </Card>
                      ))}
                    </div>
                  </div>
                  {currentStepData.content.advancedCombinations && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Advanced Combinations</h3>
                      <div className="space-y-3">
                        {currentStepData.content.advancedCombinations.map((strategy: any, idx: number) => (
                          <Card key={idx} className="p-3 md:p-4">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                              <h4 className="font-semibold text-sm md:text-base">{strategy.strategy}</h4>
                              <Badge variant="outline" className="w-fit text-xs">{strategy.riskLevel}</Badge>
                            </div>
                            <p className="text-xs md:text-sm mb-2 break-words">Protocols: {strategy.protocols.join(', ')}</p>
                            <p className="text-xs md:text-sm text-awareness mb-1"><strong>Target Yield:</strong> {strategy.targetYield}</p>
                            <ul className="text-xs space-y-1 list-disc list-inside text-muted-foreground">
                              {strategy.process.map((step: string, i: number) => (
                                <li key={i} className="break-words">{step}</li>
                              ))}
                            </ul>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 7: Risk Management */}
              {currentStep === 7 && currentStepData.content.riskCategories && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Risk Categories</h3>
                    <div className="space-y-3">
                      {currentStepData.content.riskCategories.map((risk: any, idx: number) => (
                        <Card key={idx} className="p-3 md:p-4">
                          <h4 className="font-semibold text-destructive mb-2 text-sm md:text-base">{risk.category}</h4>
                          <p className="text-xs md:text-sm mb-2">{risk.description}</p>
                          <div className="text-xs space-y-1">
                            <p className="break-words"><strong>Examples:</strong> {risk.examples.join(', ')}</p>
                            <p className="text-awareness break-words"><strong>Mitigation:</strong> {risk.mitigation.join(' • ')}</p>
                            <p><strong>Allocation:</strong> {risk.allocation}</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                  {currentStepData.content.monitoringSystem && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Monitoring System</h3>
                      <div className="grid gap-3">
                        {currentStepData.content.monitoringSystem.map((item: any, idx: number) => (
                          <Card key={idx} className="p-3 md:p-4">
                            <h4 className="font-semibold mb-1 text-sm md:text-base">{item.metric}</h4>
                            <div className="text-xs space-y-1 text-muted-foreground">
                              <p><strong>Frequency:</strong> {item.frequency}</p>
                              <p><strong>Threshold:</strong> {item.threshold}</p>
                              <p className="break-words"><strong>Tools:</strong> {item.tools.join(', ')}</p>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 8: Portfolio Construction */}
              {currentStep === 8 && currentStepData.content.portfolioFramework && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Portfolio Framework</h3>
                    <div className="space-y-3">
                      {Object.entries(currentStepData.content.portfolioFramework).map(([key, value]: [string, any]) => (
                        <Card key={key} className="p-3 md:p-4">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                            <h4 className="font-semibold capitalize text-sm md:text-base">{key}</h4>
                            <Badge className="w-fit text-xs">{value.riskLevel}</Badge>
                          </div>
                          <div className="text-xs md:text-sm space-y-1">
                            <p><strong>Allocation:</strong> {value.allocation}</p>
                            <p><strong>Target APY:</strong> {value.targetAPY}</p>
                            <p className="text-xs text-muted-foreground break-words">Strategies: {value.strategies.join(', ')}</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                  {currentStepData.content.diversificationPrinciples && (
                    <Alert>
                      <Target className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Diversification Principles:</strong> Protocol, Strategy, Chain, and Temporal diversification are essential for risk management.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

            </CardContent>
          </Card>
        )}

        <StepNavigation
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepChange={handleStepChange}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onMarkComplete={handleStepComplete}
          isAuthenticated={!!user}
        />
      </div>
    </div>
  );
};

export default AdvancedDefiProtocolsTutorial;