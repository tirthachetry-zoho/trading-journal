'use client'

import { AlertTriangle, TrendingDown, BookOpen, Shield } from 'lucide-react'
import { SEBI_GUIDELINES } from '@/lib/trading-guidelines'

export function SEBIGuidelines() {
  return (
    <div className="space-y-6">
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              {SEBI_GUIDELINES.title}
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SEBI_GUIDELINES.statistics.map((stat, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700 dark:text-red-300">{stat}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
        <div className="flex items-start gap-3">
          <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
              Common Reasons for Trading Losses
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {SEBI_GUIDELINES.commonReasons.map((reason, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">{reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-6">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-green-600 dark:text-green-400 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3">
              SEBI Recommendations for Success
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {SEBI_GUIDELINES.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-green-700 dark:text-green-300">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-6">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-3">
              Risk Management Best Practices
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {SEBI_GUIDELINES.riskManagement.map((rule, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-purple-700 dark:text-purple-300">{rule}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-3">
              Psychological Traps to Avoid
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {SEBI_GUIDELINES.psychologicalAspects.map((trap, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-600 dark:bg-orange-400 rounded-full mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-orange-700 dark:text-orange-300">{trap}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Key Takeaways
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              1
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Education First:</strong> Never trade without proper knowledge and education about markets.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              2
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Risk Management:</strong> Always use stop-loss and never risk more than 1-2% per trade.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              3
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Emotional Control:</strong> Keep fear and greed out of your trading decisions.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              4
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Continuous Learning:</strong> Review your trades regularly and learn from mistakes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
