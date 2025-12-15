// pages/borrower/BorrowerDetail.tsx
// REFACTORED - Menggunakan viewmodel pattern
import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'

import { useDetailViewModel } from '../viewmodels/detail.viewmodel'
import { QuickActions } from '../components/QuickActions'
import { OverviewTab } from '../components/OverviewTab'
import { HistoryTab } from '../components/HistoryTab'
import { SettingsTab } from '../components/SettingsTab'
import NFTCard from '../../../shared/components/NFTCard'
import { NFT } from '../../../shared/types'

const BorrowerDetail: React.FC = () => {
  const { idnft } = useParams<{ idnft: string }>()
  const navigate = useNavigate()

  // Use ViewModel - semua logic ada di sini
  const viewModel = useDetailViewModel(idnft)

  const {
    loan,
    isLoading,
    nftValue,
    repaymentProgress,
    remainingDebt,
    repaid,
    needsApproval,
    yieldHistory,
    isLoadingHistory,
    chartData,
    activeTab,
    setActiveTab,
    manualRepayAmount,
    setManualRepayAmount,
    chartRange,
    setChartRange,
    chartType,
    setChartType,
    claimingSimulationId,
    repay,
    withdraw,
    claimYield,
    isRepaying,
    isWithdrawing
  } = viewModel

  // NFT metadata
  const nft: NFT | undefined = loan ? {
    id: loan.tokenId.toString(),
    name: `NFT #${loan.tokenId.toString()}`,
    imageUrl: 'https://placehold.co/400',
    network: 'Foundry',
    price: nftValue,
    projectedYield: 0,
    ltv: 0,
    maxBorrow: 0,
    type: 'erc721',
    isMock: false
  } : undefined

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin" size={48} />
      </div>
    )
  }

  if (!nft || !loan) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-black uppercase">Loan Position Not Found</h2>
        <button 
          onClick={() => navigate('/borrower/dashboard')} 
          className="btn-primary mt-4 flex items-center gap-2 mx-auto"
        >
          <ArrowLeft /> Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <button
        onClick={() => navigate('/borrower/dashboard')}
        className="flex items-center gap-2 font-bold hover:underline"
      >
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase flex items-center gap-4">
            Manage Collateral
            <span className={`text-lg px-3 py-1 border-2 border-black ${loan.isActive ? 'bg-neo-green' : 'bg-gray-200'}`}>
              {loan.isActive ? 'Active' : 'Closed'}
            </span>
          </h1>
          <p className="font-bold text-gray-600 mt-2">ID: {loan.tokenId.toString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: NFT & Actions */}
        <div className="space-y-6">
          <NFTCard nft={nft} />
          
          <QuickActions
            manualRepayAmount={manualRepayAmount}
            onManualRepayAmountChange={setManualRepayAmount}
            onRepay={repay}
            onWithdraw={withdraw}
            isRepaying={isRepaying}
            isWithdrawing={isWithdrawing}
            needsApproval={needsApproval}
            remainingDebt={remainingDebt}
          />
        </div>

        {/* Right Column: Detailed View */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex gap-4 border-b-4 border-black pb-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`text-xl font-black uppercase px-4 py-2 ${activeTab === 'overview' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`text-xl font-black uppercase px-4 py-2 ${activeTab === 'history' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
            >
              Dividend History
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`text-xl font-black uppercase px-4 py-2 ${activeTab === 'settings' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
            >
              Yield Settings
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'overview' && (
              <OverviewTab
                repaymentProgress={repaymentProgress}
                remainingDebt={remainingDebt}
                repaid={repaid}
              />
            )}

            {activeTab === 'history' && (
              <HistoryTab
                yieldHistory={yieldHistory}
                chartData={chartData}
                chartType={chartType}
                chartRange={chartRange}
                onChartTypeChange={setChartType}
                onChartRangeChange={setChartRange}
                onClaimYield={claimYield}
                claimingSimulationId={claimingSimulationId}
                isLoading={isLoadingHistory}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab loan={loan} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BorrowerDetail
