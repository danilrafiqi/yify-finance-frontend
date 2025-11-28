import React from 'react'
import { MockNFT } from '../../utils/mockData'
import { motion } from 'framer-motion'

interface NFTCardProps {
  nft: MockNFT
  selected?: boolean
  onSelect?: (nft: MockNFT) => void
}

const NFTCard: React.FC<NFTCardProps> = ({ nft, selected, onSelect }) => {
  return (
    <motion.div
      onClick={() => onSelect && onSelect(nft)}
      whileHover={{ y: -4, boxShadow: "12px 12px 0px 0px rgba(0,0,0,1)" }}
      className={`
        cursor-pointer border-4 border-black p-4
        ${selected 
          ? 'bg-neo-yellow shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]' 
          : 'bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'}
        transition-all duration-200
      `}
    >
      <div className="aspect-square bg-gray-200 border-2 border-black mb-4 overflow-hidden relative">
        <img 
          src={nft.imageUrl} 
          alt={nft.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-black text-white px-2 py-1 text-xs font-bold uppercase">
          {nft.network}
        </div>
      </div>

      <h3 className="text-xl font-black uppercase mb-2 truncate">{nft.name}</h3>
      
      <div className="space-y-2 text-sm font-bold">
        <div className="flex justify-between">
          <span>Price:</span>
          <span>${nft.price.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-neo-blue">
          <span>Yield:</span>
          <span>{nft.projectedYield}% APR</span>
        </div>
        <div className="flex justify-between text-neo-green">
          <span>LTV:</span>
          <span>{nft.ltv.toFixed(1)}%</span>
        </div>
        <div className="pt-2 border-t-2 border-black mt-2">
          <div className="flex justify-between">
            <span>Max Borrow:</span>
            <span>${nft.maxBorrow.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default NFTCard

