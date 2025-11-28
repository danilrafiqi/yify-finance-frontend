import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useNetworkStore, NetworkType } from '../../stores/networkStore'
import { motion, AnimatePresence } from 'framer-motion'

const NetworkSwitcher: React.FC = () => {
  const { currentNetwork, setNetwork } = useNetworkStore()
  const [isOpen, setIsOpen] = useState(false)

  const networks: { type: NetworkType; color: string }[] = [
    { type: 'Base', color: 'bg-blue-500' },
    { type: 'Optimism', color: 'bg-red-500' },
    { type: 'Ethereum', color: 'bg-purple-500' }
  ]

  const getNetworkColor = (type: NetworkType) => {
    switch (type) {
      case 'Base': return 'bg-blue-500'
      case 'Optimism': return 'bg-red-500'
      case 'Ethereum': return 'bg-purple-500'
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black font-bold uppercase hover:bg-gray-50 transition-colors"
      >
        <div className={`w-3 h-3 rounded-full ${getNetworkColor(currentNetwork)}`} />
        {currentNetwork}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full right-0 mt-2 w-40 bg-white border-2 border-black shadow-neo z-50"
          >
            {networks.map((network) => (
              <button
                key={network.type}
                onClick={() => {
                  setNetwork(network.type)
                  setIsOpen(false)
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100 font-bold uppercase text-sm"
              >
                <div className={`w-2 h-2 rounded-full ${network.color}`} />
                {network.type}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NetworkSwitcher

