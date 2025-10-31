import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNFTStore } from '../stores/nftStore'
import { usePositionStore } from '../stores/positionStore'
import { useTransactionStore } from '../stores/transactionStore'

interface DepositFormData {
  confirmDeposit: boolean
}

const DepositInterface: React.FC = () => {
  const [selectedNFTs, setSelectedNFTs] = useState<string[]>([])
  const [step, setStep] = useState<'select' | 'confirm' | 'processing'>('select')
  const { register, handleSubmit, formState: { errors } } = useForm<DepositFormData>()

  const { getAvailableNFTs, depositNFTs } = useNFTStore()
  const { createIsolatedPosition } = usePositionStore()
  const { addTransaction } = useTransactionStore()

  const availableNFTs = getAvailableNFTs()

  const toggleNFTSelection = (nftId: string) => {
    setSelectedNFTs(prev =>
      prev.includes(nftId)
        ? prev.filter(id => id !== nftId)
        : [...prev, nftId]
    )
  }

  const calculateTotals = () => {
    const selected = availableNFTs.filter(nft => selectedNFTs.includes(nft.id))

    if (selected.length === 0) return { totalValue: 0, maxBorrow: 0, avgYield: 0, weightedLTV: 0 }

    const totalValue = selected.reduce((sum, nft) => sum + nft.floorPrice, 0)

    // Weighted LTV calculation (Aave-style)
    const weightedLTV = selected.reduce((sum, nft) =>
      sum + (nft.floorPrice * nft.ltv / 100), 0
    ) / totalValue * 100

    return {
      totalValue,
      maxBorrow: totalValue * (weightedLTV / 100),
      avgYield: selected.reduce((sum, nft) => sum + nft.currentYield, 0) / selected.length,
      weightedLTV
    }
  }

  const onSubmit = async (data: DepositFormData) => {
    if (step === 'select') {
      setStep('confirm')
    } else if (step === 'confirm' && data.confirmDeposit) {
      setStep('processing')

      try {
        // Simulate blockchain transaction delay
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Create isolated position for each selected NFT
        const positionIds: string[] = []
        for (const nftId of selectedNFTs) {
          const positionId = createIsolatedPosition(nftId)
          positionIds.push(positionId)
        }

        // Deposit NFTs (each gets its own position)
        depositNFTs(selectedNFTs, positionIds.join(','))

        // Add transaction record
        addTransaction({
          type: 'deposit',
          amount: 0, // NFT deposit, no token amount
          token: 'NFT',
          nftIds: selectedNFTs,
          status: 'confirmed',
          description: `Deposited ${selectedNFTs.length} veAero NFTs as isolated collateral`
        })

        // Reset form
        setStep('select')
        setSelectedNFTs([])

        alert(`✅ Deposit successful! Created ${selectedNFTs.length} isolated positions for your NFTs.`)

      } catch (error) {
        console.error('Deposit failed:', error)
        addTransaction({
          type: 'deposit',
          amount: 0,
          token: 'NFT',
          nftIds: selectedNFTs,
          status: 'failed',
          description: 'Deposit transaction failed'
        })
        alert('❌ Deposit failed. Please try again.')
        setStep('confirm')
      }
    }
  }

  const totals = calculateTotals()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Deposit veNFT & NFT RWA</h2>

        {step === 'select' && (
          <div className="space-y-6">
            <p className="text-gray-600">
              Select the veNFT or NFT RWA you want to deposit as collateral for borrowing.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableNFTs.map((nft) => (
                <div
                  key={nft.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedNFTs.includes(nft.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleNFTSelection(nft.id)}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedNFTs.includes(nft.id)}
                      onChange={() => toggleNFTSelection(nft.id)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{nft.name}</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Value: ${nft.floorPrice.toLocaleString()}</p>
                        <p>Yield: {nft.currentYield}%</p>
                        <p>LTV: {nft.ltv}%</p>
                        <p>Expiry: {nft.expiryDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedNFTs.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-3">Deposit Summary ({selectedNFTs.length} NFTs)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-blue-700">Total Value</p>
                    <p className="font-medium">${totals.totalValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Weighted LTV</p>
                    <p className="font-medium">{totals.weightedLTV.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Max Borrow</p>
                    <p className="font-medium">${totals.maxBorrow.toLocaleString()} USDC</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Avg Yield</p>
                    <p className="font-medium">{totals.avgYield.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-blue-600">
                  <p>💡 Aave-style lending: Multiple NFTs combined into single collateral position</p>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={selectedNFTs.length === 0}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
              >
                Continue to Deposit
              </button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Confirm Deposit</h3>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Selected NFTs:</h4>
              <ul className="space-y-2">
                {selectedNFTs.map(nftId => {
                  const nft = availableNFTs.find(n => n.id === nftId)
                  return (
                    <li key={nftId} className="flex justify-between text-sm">
                      <span>{nft?.name}</span>
                      <span>${nft?.floorPrice}</span>
                    </li>
                  )
                })}
              </ul>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-medium">
                  <span>Total Value:</span>
                  <span>${totals.totalValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Max Borrow:</span>
                  <span>${totals.maxBorrow.toFixed(2)} USDC</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="confirmDeposit"
                  {...register('confirmDeposit', { required: 'You must confirm the deposit' })}
                  className="mt-1 h-4 w-4 text-blue-600"
                />
                <label htmlFor="confirmDeposit" className="text-sm text-gray-700">
                  I understand that depositing these NFTs will lock them in the protocol and I can only withdraw them after repaying any outstanding loans.
                </label>
              </div>
              {errors.confirmDeposit && (
                <p className="text-red-600 text-sm">{errors.confirmDeposit.message}</p>
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep('select')}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-400"
              >
                Back
              </button>
              <button
                onClick={handleSubmit(onSubmit)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
              >
                Confirm Deposit
              </button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <h3 className="text-xl font-medium text-gray-900 mt-4">Processing Deposit</h3>
            <p className="text-gray-600 mt-2">Please confirm the transaction in your wallet...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DepositInterface
