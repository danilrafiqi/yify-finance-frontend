// modules/help/components/FAQItem.tsx
import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { FAQItem } from '../viewmodels/faq.viewmodel'

interface FAQItemProps {
  faq: FAQItem
}

export const FAQItemComponent: React.FC<FAQItemProps> = ({ faq }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-4 border-black bg-white shadow-neo mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left font-bold hover:bg-gray-50 transition-colors"
      >
        <span className="text-lg uppercase">{faq.question}</span>
        <ChevronDown 
          className={`w-6 h-6 transition-transform border-2 border-black rounded-full ${isOpen ? 'rotate-180 bg-neo-yellow' : ''}`} 
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-4 border-t-4 border-black bg-gray-50 font-medium">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

