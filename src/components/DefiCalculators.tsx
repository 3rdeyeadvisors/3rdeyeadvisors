import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, AlertTriangle, DollarSign, Percent, Clock } from "lucide-react";

const DefiCalculators = () => {
  const [yieldData, setYieldData] = useState({
    principal: "",
    apy: "",
    duration: "365"
  });

  const [liquidityData, setLiquidityData] = useState({
    token1Amount: "",
    token1Price: "",
    token2Amount: "",
    token2Price: "",
    fees: "0.3"
  });

  const [riskData, setRiskData] = useState({
    portfolioValue: "",
    riskTolerance: "medium",
    diversification: "3"
  });

  const calculateYield = () => {
    const principal = parseFloat(yieldData.principal);
    const apy = parseFloat(yieldData.apy) / 100;
    const days = parseInt(yieldData.duration);
    
    if (!principal || !apy || !days) return null;
    
    const dailyRate = apy / 365;
    const compoundReturn = principal * Math.pow(1 + dailyRate, days);
    const profit = compoundReturn - principal;
    
    return {
      finalAmount: compoundReturn,
      totalProfit: profit,
      dailyEarnings: profit / days
    };
  };

  const calculateLiquidityValue = () => {
    const token1Amount = parseFloat(liquidityData.token1Amount);
    const token1Price = parseFloat(liquidityData.token1Price);
    const token2Amount = parseFloat(liquidityData.token2Amount);
    const token2Price = parseFloat(liquidityData.token2Price);
    
    if (!token1Amount || !token1Price || !token2Amount || !token2Price) return null;
    
    const token1Value = token1Amount * token1Price;
    const token2Value = token2Amount * token2Price;
    const totalValue = token1Value + token2Value;
    
    return {
      token1Value,
      token2Value,
      totalValue,
      balance: Math.abs(token1Value - token2Value) / totalValue * 100
    };
  };

  const assessRisk = () => {
    const portfolioValue = parseFloat(riskData.portfolioValue);
    const diversification = parseInt(riskData.diversification);
    
    if (!portfolioValue || !diversification) return null;
    
    let riskScore = 0;
    
    // Portfolio size risk
    if (portfolioValue < 1000) riskScore += 3;
    else if (portfolioValue < 10000) riskScore += 2;
    else riskScore += 1;
    
    // Diversification risk
    if (diversification < 3) riskScore += 3;
    else if (diversification < 6) riskScore += 2;
    else riskScore += 1;
    
    // Risk tolerance
    if (riskData.riskTolerance === "high") riskScore += 1;
    else if (riskData.riskTolerance === "medium") riskScore += 2;
    else riskScore += 3;
    
    const riskLevel = riskScore <= 3 ? "Low" : riskScore <= 6 ? "Medium" : "High";
    const riskColor = riskLevel === "Low" ? "bg-awareness/20 text-awareness" : 
                     riskLevel === "Medium" ? "bg-accent/20 text-accent" : 
                     "bg-destructive/20 text-destructive";
    
    return { riskLevel, riskColor, riskScore };
  };

  const yieldResults = calculateYield();
  const liquidityResults = calculateLiquidityValue();
  const riskResults = assessRisk();

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Calculator className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-consciousness font-bold text-foreground">
            DeFi Calculators
          </h2>
        </div>
        <p className="text-white/50 font-consciousness max-w-2xl mx-auto">
          Essential tools to help you make informed decisions in the DeFi space. 
          Calculate yields, assess risks, and optimize your strategies.
        </p>
      </div>

      <Tabs defaultValue="yield" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/5">
          <TabsTrigger value="yield" className="font-consciousness">
            <TrendingUp className="w-4 h-4 mr-2" />
            Yield Calculator
          </TabsTrigger>
          <TabsTrigger value="liquidity" className="font-consciousness">
            <DollarSign className="w-4 h-4 mr-2" />
            Liquidity Pool
          </TabsTrigger>
          <TabsTrigger value="risk" className="font-consciousness">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Risk Assessment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="yield">
          <Card className="p-6 bg-card/60 border-white/8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-xl font-consciousness font-semibold text-foreground mb-4">
                  Yield Farming Calculator
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="principal" className="font-consciousness">
                      Initial Investment ($)
                    </Label>
                    <Input
                      id="principal"
                      type="number"
                      placeholder="10000"
                      value={yieldData.principal}
                      onChange={(e) => setYieldData({...yieldData, principal: e.target.value})}
                      className="font-consciousness text-base"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="apy" className="font-consciousness">
                      APY (%)
                    </Label>
                    <Input
                      id="apy"
                      type="number"
                      placeholder="12.5"
                      value={yieldData.apy}
                      onChange={(e) => setYieldData({...yieldData, apy: e.target.value})}
                      className="font-consciousness text-base"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="duration" className="font-consciousness">
                      Duration (days)
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="365"
                      value={yieldData.duration}
                      onChange={(e) => setYieldData({...yieldData, duration: e.target.value})}
                      className="font-consciousness text-base"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-lg font-consciousness font-semibold text-foreground">
                  Projected Returns
                </h4>
                
                {yieldResults ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                      <span className="font-consciousness text-white/50">Final Amount:</span>
                      <span className="font-consciousness font-semibold text-primary">
                        ${yieldResults.finalAmount.toLocaleString('en-US', {maximumFractionDigits: 2})}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-accent/10 rounded-lg">
                      <span className="font-consciousness text-white/50">Total Profit:</span>
                      <span className="font-consciousness font-semibold text-accent">
                        ${yieldResults.totalProfit.toLocaleString('en-US', {maximumFractionDigits: 2})}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white/3 rounded-lg">
                      <span className="font-consciousness text-white/50">Daily Earnings:</span>
                      <span className="font-consciousness font-semibold text-foreground">
                        ${yieldResults.dailyEarnings.toLocaleString('en-US', {maximumFractionDigits: 2})}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 bg-white/3 rounded-lg">
                    <Percent className="w-12 h-12 text-white/50 mx-auto mb-4" />
                    <p className="text-white/50 font-consciousness">
                      Enter values to see projected returns
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="liquidity">
          <Card className="p-6 bg-card/60 border-white/8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-xl font-consciousness font-semibold text-foreground mb-4">
                  Liquidity Pool Value Calculator
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-consciousness">Token 1 Amount</Label>
                      <Input
                        type="number"
                        placeholder="100"
                        value={liquidityData.token1Amount}
                        onChange={(e) => setLiquidityData({...liquidityData, token1Amount: e.target.value})}
                        className="font-consciousness text-base"
                      />
                    </div>
                    <div>
                      <Label className="font-consciousness">Token 1 Price ($)</Label>
                      <Input
                        type="number"
                        placeholder="50"
                        value={liquidityData.token1Price}
                        onChange={(e) => setLiquidityData({...liquidityData, token1Price: e.target.value})}
                        className="font-consciousness text-base"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-consciousness">Token 2 Amount</Label>
                      <Input
                        type="number"
                        placeholder="5000"
                        value={liquidityData.token2Amount}
                        onChange={(e) => setLiquidityData({...liquidityData, token2Amount: e.target.value})}
                        className="font-consciousness text-base"
                      />
                    </div>
                    <div>
                      <Label className="font-consciousness">Token 2 Price ($)</Label>
                      <Input
                        type="number"
                        placeholder="1"
                        value={liquidityData.token2Price}
                        onChange={(e) => setLiquidityData({...liquidityData, token2Price: e.target.value})}
                        className="font-consciousness text-base"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-lg font-consciousness font-semibold text-foreground">
                  Pool Analysis
                </h4>
                
                {liquidityResults ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                      <span className="font-consciousness text-white/50">Total Pool Value:</span>
                      <span className="font-consciousness font-semibold text-primary">
                        ${liquidityResults.totalValue.toLocaleString('en-US', {maximumFractionDigits: 2})}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white/3 rounded-lg">
                      <span className="font-consciousness text-white/50">Token 1 Value:</span>
                      <span className="font-consciousness font-semibold text-foreground">
                        ${liquidityResults.token1Value.toLocaleString('en-US', {maximumFractionDigits: 2})}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white/3 rounded-lg">
                      <span className="font-consciousness text-white/50">Token 2 Value:</span>
                      <span className="font-consciousness font-semibold text-foreground">
                        ${liquidityResults.token2Value.toLocaleString('en-US', {maximumFractionDigits: 2})}
                      </span>
                    </div>
                    
                    <div className="p-3 bg-accent/10 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-consciousness text-white/50">Balance Deviation:</span>
                        <span className="font-consciousness font-semibold text-accent">
                          {liquidityResults.balance.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-sm text-white/50 font-consciousness">
                        {liquidityResults.balance < 5 ? "✅ Well balanced" : 
                         liquidityResults.balance < 15 ? "⚠️ Slightly imbalanced" : 
                         "❌ Significantly imbalanced"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 bg-white/3 rounded-lg">
                    <DollarSign className="w-12 h-12 text-white/50 mx-auto mb-4" />
                    <p className="text-white/50 font-consciousness">
                      Enter token amounts and prices
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="risk">
          <Card className="p-6 bg-card/60 border-white/8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-xl font-consciousness font-semibold text-foreground mb-4">
                  Risk Assessment Tool
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className="font-consciousness">Portfolio Value ($)</Label>
                    <Input
                      type="number"
                      placeholder="25000"
                      value={riskData.portfolioValue}
                      onChange={(e) => setRiskData({...riskData, portfolioValue: e.target.value})}
                      className="font-consciousness text-base"
                    />
                  </div>
                  
                  <div>
                    <Label className="font-consciousness">Risk Tolerance</Label>
                    <select 
                      value={riskData.riskTolerance}
                      onChange={(e) => setRiskData({...riskData, riskTolerance: e.target.value})}
                      className="w-full p-2 border border-white/8 rounded-md bg-black font-consciousness text-base min-h-[44px]"
                    >
                      <option value="low">Conservative</option>
                      <option value="medium">Moderate</option>
                      <option value="high">Aggressive</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label className="font-consciousness">Number of Different Protocols</Label>
                    <Input
                      type="number"
                      placeholder="5"
                      value={riskData.diversification}
                      onChange={(e) => setRiskData({...riskData, diversification: e.target.value})}
                      className="font-consciousness text-base"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-lg font-consciousness font-semibold text-foreground">
                  Risk Profile
                </h4>
                
                {riskResults ? (
                  <div className="space-y-4">
                    <div className="text-center p-4 rounded-lg">
                      <Badge className={`${riskResults.riskColor} text-lg px-4 py-2 font-consciousness`}>
                        {riskResults.riskLevel} Risk
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="p-3 bg-white/3 rounded-lg">
                        <h5 className="font-consciousness font-semibold text-foreground mb-2">
                          Recommendations:
                        </h5>
                        <ul className="text-sm text-white/50 font-consciousness space-y-1">
                          {riskResults.riskLevel === "High" && (
                            <>
                              <li>• Consider reducing position sizes</li>
                              <li>• Diversify across more protocols</li>
                              <li>• Focus on blue-chip DeFi projects</li>
                              <li>• Set stop-loss limits</li>
                            </>
                          )}
                          {riskResults.riskLevel === "Medium" && (
                            <>
                              <li>• Well-balanced risk profile</li>
                              <li>• Consider adding stablecoin strategies</li>
                              <li>• Monitor protocol fundamentals</li>
                              <li>• Regular rebalancing recommended</li>
                            </>
                          )}
                          {riskResults.riskLevel === "Low" && (
                            <>
                              <li>• Conservative approach detected</li>
                              <li>• Can consider slightly higher yields</li>
                              <li>• Current diversification is good</li>
                              <li>• Focus on established protocols</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 bg-white/3 rounded-lg">
                    <AlertTriangle className="w-12 h-12 text-white/50 mx-auto mb-4" />
                    <p className="text-white/50 font-consciousness">
                      Complete the assessment for risk analysis
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="p-6 bg-awareness/5 border-awareness/20">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-awareness mt-1" />
          <div>
            <h4 className="font-consciousness font-semibold text-foreground mb-2">
              Important Disclaimer
            </h4>
            <p className="text-sm text-white/50 font-consciousness leading-relaxed">
              These calculators are educational tools and do not constitute financial advice. 
              DeFi involves significant risks including smart contract vulnerabilities, impermanent loss, 
              and market volatility. Always do your own research and never invest more than you can afford to lose.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DefiCalculators;