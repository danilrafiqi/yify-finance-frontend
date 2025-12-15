// modules/borrow/components/HistoryTab.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Loader2 } from 'lucide-react'
import { formatUnits } from 'viem'
import { YieldEvent } from '../viewmodels/detail.viewmodel'

interface HistoryTabProps {
  yieldHistory: YieldEvent[]
  chartData: any[]
  chartType: 'yield' | 'debt' | 'cumulative'
  chartRange: '1W' | '1M' | '3M' | 'ALL'
  onChartTypeChange: (type: 'yield' | 'debt' | 'cumulative') => void
  onChartRangeChange: (range: '1W' | '1M' | '3M' | 'ALL') => void
  onClaimYield: (event: YieldEvent) => void
  claimingSimulationId: string | null
  isLoading: boolean
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  yieldHistory,
  chartData,
  chartType,
  chartRange,
  onChartTypeChange,
  onChartRangeChange,
  onClaimYield,
  claimingSimulationId,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin" size={48} />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="card-neo bg-white border-2">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black uppercase flex items-center gap-2">
            <BarChart3 /> Yield Performance Analytics
          </h3>

          <div className="flex gap-2">
            <select
              value={chartType}
              onChange={(e) => onChartTypeChange(e.target.value as 'yield' | 'debt' | 'cumulative')}
              className="px-3 py-1 text-sm font-bold bg-neo-blue text-white border-2 border-black"
            >
              <option value="yield">Yield Amount</option>
              <option value="debt">Debt Repaid</option>
              <option value="cumulative">Cumulative</option>
            </select>

            {(['1W', '1M', '3M', 'ALL'] as const).map((range) => (
              <button
                key={range}
                onClick={() => onChartRangeChange(range)}
                className={`px-3 py-1 text-sm font-bold ${chartRange === range ? 'bg-black text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="h-64 bg-gray-50 border-2 border-dashed border-black p-4 relative">
          {chartData.length > 0 ? (
            <div className="h-full flex flex-col">
              <div className="flex-1 flex items-end justify-between gap-1">
                {chartData.map((data, index) => {
                  let value, color, label

                  switch (chartType) {
                    case 'yield':
                      value = data.yieldAmount
                      color = 'bg-neo-green'
                      label = `Yield: $${data.yieldAmount.toFixed(2)}`
                      break
                    case 'debt':
                      value = data.debtRepaid
                      color = 'bg-red-500'
                      label = `Debt Repaid: $${data.debtRepaid.toFixed(2)}`
                      break
                    case 'cumulative':
                      value = data.cumulativeYield
                      color = 'bg-neo-blue'
                      label = `Total Yield: $${data.cumulativeYield.toFixed(2)}`
                      break
                    default:
                      value = data.yieldAmount
                      color = 'bg-neo-green'
                      label = `$${data.yieldAmount.toFixed(2)}`
                  }

                  const maxValue = Math.max(...chartData.map(d => {
                    switch (chartType) {
                      case 'yield': return d.yieldAmount
                      case 'debt': return d.debtRepaid
                      case 'cumulative': return d.cumulativeYield
                      default: return d.yieldAmount
                    }
                  }))

                  const heightPercentage = maxValue > 0 ? (value / maxValue) * 100 : 0

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                      <div
                        className={`w-full ${color} border-2 border-black hover:opacity-80 transition-all`}
                        style={{ height: `${Math.max(heightPercentage, 2)}%`, minHeight: '4px' }}
                      />
                      <span className="text-xs font-bold mt-1 text-gray-500 absolute -bottom-6 transform -rotate-45 origin-top-left">
                        {new Date(data.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 bg-black text-white text-xs p-2 rounded whitespace-nowrap z-10 pointer-events-none">
                        <div className="font-bold">{label}</div>
                        <div>Fee: ${data.protocolFee.toFixed(2)}</div>
                        <div>{new Date(data.timestamp * 1000).toLocaleString()}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 pt-2 border-t border-gray-300 flex justify-between text-xs font-bold">
                <span>Total Events: {chartData.length}</span>
                <span>
                  {chartType === 'cumulative'
                    ? `Total Yield: $${chartData[chartData.length - 1]?.cumulativeYield.toFixed(2) || '0'}`
                    : `Avg per Event: $${(chartData.reduce((sum, d) => {
                        switch (chartType) {
                          case 'yield': return sum + d.yieldAmount
                          case 'debt': return sum + d.debtRepaid
                          default: return sum + d.yieldAmount
                        }
                      }, 0) / chartData.length).toFixed(2)}`
                  }
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">
              No yield data available for this range
            </div>
          )}
        </div>
      </div>

      {/* Yield History Table */}
      <div className="overflow-x-auto border-4 border-black shadow-neo mt-8">
        <table className="w-full bg-white text-left">
          <thead className="bg-black text-white font-black uppercase">
            <tr>
              <th className="p-4 border-b-4 border-black">Date</th>
              <th className="p-4 border-b-4 border-black">Yield Amount</th>
              <th className="p-4 border-b-4 border-black">Debt Repaid</th>
              <th className="p-4 border-b-4 border-black">Lender Yield</th>
              <th className="p-4 border-b-4 border-black">Protocol Fee</th>
              <th className="p-4 border-b-4 border-black">Status</th>
            </tr>
          </thead>
          <tbody className="font-bold">
            {yieldHistory.length > 0 ? (
              yieldHistory.slice().reverse().map((event, index) => {
                const displayDate = new Date(Number(event.timestamp) * 1000)
                const yieldAmount = parseFloat(formatUnits(BigInt(event.totalAmount), 6))
                const debtRepaid = parseFloat(formatUnits(BigInt(event.repaidDebt), 6))
                const lenderYield = parseFloat(formatUnits(BigInt(event.lenderYield), 6))
                const protocolFee = parseFloat(formatUnits(BigInt(event.protocolFee), 6))
                const isPending = event.repaidDebt === '0' && event.lenderYield === '0' && event.protocolFee === '0'
                const isClaiming = claimingSimulationId === event.id

                return (
                  <tr key={`${event.id}-${index}`} className="border-b-2 border-gray-200 hover:bg-gray-50">
                    <td className="p-4">
                      {displayDate.toLocaleDateString()} {displayDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 text-neo-green">+${yieldAmount.toFixed(2)}</td>
                    <td className="p-4 text-red-600">-{Math.max(0, debtRepaid).toFixed(2)}</td>
                    <td className="p-4 text-neo-blue">+${lenderYield.toFixed(2)}</td>
                    <td className="p-4 text-gray-600">${protocolFee.toFixed(2)}</td>
                    <td className="p-4">
                      {isPending ? (
                        <button
                          type="button"
                          className="btn-neo bg-black text-white text-xs px-3 py-1 uppercase flex items-center gap-1"
                          onClick={() => onClaimYield(event)}
                          disabled={isClaiming}
                        >
                          {isClaiming ? <Loader2 className="animate-spin" size={14} /> : 'Claim'}
                        </button>
                      ) : (
                        <span className="bg-neo-green text-black text-xs px-2 py-1 border border-black uppercase">Processed</span>
                      )}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">No dividend history available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

