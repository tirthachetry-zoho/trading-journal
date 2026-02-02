export const LOSS_REASONS = [
  'Market went against my position',
  'Poor entry timing',
  'Stop loss hit too early',
  'Overtrading / revenge trading',
  'No clear trading plan',
  'Risk management issues',
  'News/announcement impact',
  'Technical analysis failure',
  'Emotional trading decisions',
  'Position sizing too large',
  'Holding losing position too long',
  'Chasing losses',
  'Lack of research',
  'Market volatility',
  'Brokerage/charges too high',
  'Other'
] as const

export const PROFIT_REASONS = [
  'Market moved in favor',
  'Good entry timing',
  'Proper risk management',
  'Strong technical analysis',
  'Fundamental analysis paid off',
  'Patience and discipline',
  'Position sizing optimal',
  'News/announcement helped',
  'Market momentum',
  'Trend following strategy',
  'Support/resistance levels worked',
  'Risk-reward ratio favorable',
  'Market conditions favorable',
  'Research and analysis',
  'Stopped out at right time',
  'Other'
] as const

export const SEBI_GUIDELINES = {
  title: "SEBI Guidelines: Why 90% of Traders Lose Money",
  statistics: [
    "According to SEBI studies, approximately 90% of individual traders lose money in the stock market",
    "Only 10% of traders consistently make profits over the long term",
    "The average retail trader loses money within 6-12 months of starting"
  ],
  commonReasons: [
    "Lack of proper trading education and knowledge",
    "Emotional trading decisions (fear and greed)",
    "Poor risk management practices",
    "Overtrading and excessive leverage",
    "No proper trading plan or strategy",
    "Chasing losses and revenge trading",
    "Ignoring market trends and analysis",
    "High transaction costs and taxes",
    "Lack of discipline and patience",
    "Unrealistic profit expectations"
  ],
  recommendations: [
    "Get proper education before trading",
    "Start with paper trading to build skills",
    "Never risk more than 1-2% per trade",
    "Always use stop-loss orders",
    "Have a clear trading plan with entry/exit rules",
    "Keep detailed trading records",
    "Focus on risk management over profits",
    "Don't trade with emotions",
    "Diversify your portfolio",
    "Set realistic profit targets"
  ],
  riskManagement: [
    "Use position sizing formula: Risk = 1-2% of capital",
    "Always calculate risk-reward ratio before entry",
    "Set stop-loss at logical levels",
    "Take partial profits at key levels",
    "Never add to losing positions",
    "Use trailing stops for protecting profits",
    "Maintain trading journal for analysis",
    "Review trades weekly to identify patterns"
  ],
  psychologicalAspects: [
    "Fear of missing out (FOMO) leads to poor entries",
    "Greed causes holding winners too long",
    "Hope leads to holding losers too long",
    "Revenge trading after losses",
    "Overconfidence after few wins",
    "Analysis paralysis from too much information",
    "Impulsive decisions during market volatility",
    "Following tips without own analysis"
  ]
}
