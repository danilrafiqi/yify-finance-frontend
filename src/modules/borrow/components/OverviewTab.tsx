// modules/borrow/components/OverviewTab.tsx
import React from 'react'
import { motion } from 'framer-motion'

interface OverviewTabProps {
  repaymentProgress: number
  remainingDebt: number
  repaid: number
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  repaymentProgress,
  remainingDebt,
  repaid
}) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-neo bg-neo-red text-white">
          <h4 className="font-bold uppercase opacity-80">Remaining Debt</h4>
          <p className="text-3xl font-black">${remainingDebt.toLocaleString()}</p>
        </div>
        <div className="card-neo bg-neo-green text-black">
          <h4 className="font-bold uppercase opacity-80">Yield Generated</h4>
          <p className="text-3xl font-black">${repaid.toLocaleString()}</p>
        </div>
      </div>

      <div className="card-neo bg-white">
        <h3 className="text-xl font-black uppercase mb-4">Repayment Progress</h3>
        <div className="w-full h-8 bg-gray-200 border-4 border-black relative">
          <motion.div
            className="h-full bg-neo-green"
            initial={{ width: 0 }}
            animate={{ width: `${repaymentProgress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 font-bold">
          <span>{repaymentProgress.toFixed(1)}% Repaid</span>
        </div>
      </div>
    </motion.div>
  )
}

