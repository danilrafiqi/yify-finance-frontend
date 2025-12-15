// pages/help/HelpFAQ.tsx
// REFACTORED - Menggunakan viewmodel pattern
import React from 'react'
import { HelpCircle, AlertTriangle, MessageCircle } from 'lucide-react'

import { useFAQViewModel, FAQItem } from '../viewmodels/faq.viewmodel'
import { FAQItemComponent } from '../components/FAQItem'

const HelpFAQ: React.FC = () => {
  const { faqs } = useFAQViewModel()

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black uppercase">Help Center</h1>
        <p className="text-xl font-bold text-gray-600">Got questions? We've got answers.</p>
      </div>

      <div className="grid gap-8">
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-neo-cyan border-4 border-black shadow-neo">
              <HelpCircle size={32} />
            </div>
            <h2 className="text-3xl font-black uppercase">Frequently Asked Questions</h2>
          </div>
          <div>
            {faqs.map((faq: FAQItem, index: number) => (
              <FAQItemComponent key={index} faq={faq} />
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card-neo bg-neo-yellow">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={24} />
              <h3 className="text-xl font-black uppercase">Risk Disclosure</h3>
            </div>
            <p className="font-bold mb-4">
              While we minimize risks, DeFi protocols always carry some inherent risks including smart contract bugs and systemic failures.
            </p>
            <button className="btn-neo text-sm w-full">Read Full Disclosure</button>
          </div>

          <div className="card-neo bg-neo-lime">
            <div className="flex items-center gap-3 mb-4">
              <MessageCircle size={24} />
              <h3 className="text-xl font-black uppercase">Support</h3>
            </div>
            <p className="font-bold mb-4">
              Need direct assistance? Our support team is available 24/7 on Discord and Telegram.
            </p>
            <button className="btn-neo text-sm w-full">Contact Support</button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default HelpFAQ

