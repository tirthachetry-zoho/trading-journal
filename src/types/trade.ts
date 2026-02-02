export type TradeFormData = {
  tradeDate: string
  symbol: string
  exchange: string
  instrument: string
  side: string
  quantity: string
  entryPrice: string
  exitPrice: string
  charges: string
  notes: string
  lossReason?: string
  profitReason?: string
}

export type TradeFilters = {
  dateFrom?: string
  dateTo?: string
  symbol?: string
  exchange?: string
}

export type AnalyticsData = {
  totalTrades: number
  netPL: number
  winRate: number
  avgWin: number
  avgLoss: number
  bestTrade: { symbol: string; pl: number }
  worstTrade: { symbol: string; pl: number }
  equityCurve: Array<{ date: string; value: number }>
  dailyPL: Array<{ date: string; pl: number }>
  monthlyPL: Array<{ month: string; pl: number }>
}

export type Insight = {
  type: 'warning' | 'info' | 'success'
  title: string
  description: string
}
