import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'

import { NFT } from '../../utils/types'
import NFTCard from '../../components/common/NFTCard'
import { ArrowLeft, Wallet, Settings, AlertTriangle, FileText, Vote, BarChart3, ArrowUpRight, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { useAccount, useReadContract, useWriteContract, useChainId, usePublicClient } from 'wagmi'
import { formatUnits, parseUnits, erc20Abi } from 'viem'
import { CONTRACT_ADDRESSES, LISK_SEPOLIA_CHAIN_ID, LOAN_MANAGER_ABI, LENS_ABI, SIMPLE_ORACLE_ABI, YIELD_DISTRIBUTOR_ABI } from '../../constants/contracts'

const BorrowerDetail: React.FC = () => {
  const { idnft } = useParams<{ idnft: string }>()
  const navigate = useNavigate()

  const { address } = useAccount()
  const chainId = useChainId()
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || CONTRACT_ADDRESSES[LISK_SEPOLIA_CHAIN_ID]

  // Data Fetching via Lens
  const { data: userPositionsResult, isLoading: isLoadingPositions, refetch: refetchPositions } = useReadContract({
    address: addresses.lens as `0x${string}`,
    abi: LENS_ABI,
    functionName: 'getUserLoans',
    args: [addresses.loanManager, address!],
    query: { enabled: !!address && !!addresses.loanManager, refetchInterval: 5000 }
  })

  const userPositions = userPositionsResult as any[] | undefined;

  // Find the position matching the idnft (Token ID) passed in URL
  // Filter only ACTIVE loans
  const position = useMemo(() => {
    if (!userPositions || !idnft) return undefined;
    return userPositions.find((p: any) => p.tokenId.toString() === idnft && p.isActive)
  }, [userPositions, idnft])

  // Get NFT Value from Oracle
  const { data: nftValueData } = useReadContract({
    address: addresses.nftOracle as `0x${string}`,
    abi: SIMPLE_ORACLE_ABI,
    functionName: 'getAssetPrice',
    args: [position?.nftContract as `0x${string}`, position?.tokenId as bigint],
    query: { enabled: !!position && !!addresses.nftOracle }
  })

  const nftValue = nftValueData ? parseFloat(formatUnits(nftValueData as bigint, 18)) : 0

  // NFT metadata from on-chain position data
  const nft = useMemo(() => {
    if (!position) return undefined
    return {
      id: position.tokenId.toString(),
      name: `NFT #${position.tokenId.toString()}`,
      imageUrl: 'https://placehold.co/400',
      network: 'Foundry',
      price: nftValue, // Use real value from oracle
      projectedYield: 0,
      ltv: 0,
      maxBorrow: 0,
      type: 'erc721',
      isMock: false
    } as NFT
  }, [position, nftValue])

  // Contract Interactions
  const { writeContractAsync: writeLoanManager } = useWriteContract()
  const { writeContractAsync: writeApprove } = useWriteContract()
  const { writeContractAsync: writeDistributor } = useWriteContract()
  const publicClient = usePublicClient()

  // States
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'settings'>('overview')
  const [yieldConfig, setYieldConfig] = useState<'repay' | 'reinvest'>('repay')
  const [reinvestRatio, setReinvestRatio] = useState<number>(50)
  const [manualRepayAmount, setManualRepayAmount] = useState<string>('')
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [currentSavedConfig, setCurrentSavedConfig] = useState<{ mode: 'repay' | 'reinvest', ratio?: number }>({ mode: 'repay' })
  const [chartRange, setChartRange] = useState<'1W' | '1M' | '3M' | 'ALL'>('1M')
  const [chartType, setChartType] = useState<'yield' | 'debt' | 'cumulative'>('yield')
  const [isRepaying, setIsRepaying] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [claimingSimulationId, setClaimingSimulationId] = useState<string | null>(null)

  // USDC Allowance Check
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: addresses.usdc as `0x${string}`,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address!, addresses.loanManager as `0x${string}`],
    query: { enabled: !!address && !!addresses.usdc && !!addresses.loanManager }
  })

  // Fetch Real Yield Data from Ponder with Enhanced Chart Data
  const yieldHistoryQuery = useQuery({
    queryKey: ['yieldHistory', position?.nftContract, position?.tokenId.toString()], // Convert BigInt to string for serialization
    queryFn: async () => {
      if (!position) return []
      const loanId = `${position.nftContract.toLowerCase()}-${position.tokenId}` // Match Ponder ID format (lowercase)
      const response = await fetch('http://localhost:42069/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetYieldEvents($loanId: String!) {
              yieldEvents(
                where: { loanId: $loanId }
                orderBy: "timestamp"
                orderDirection: "asc"
                limit: 100
              ) {
                items {
                  id
                  loanId
                  asset
                  tokenId
                  totalAmount
                  repaidDebt
                  lenderYield
                  protocolFee
                  timestamp
                }
              }
            }
          `,
          variables: { loanId }
        })
      })
      const result = await response.json()
      return result.data?.yieldEvents?.items || []
    },
    enabled: !!position && activeTab === 'history',
    refetchInterval: 3000 // More frequent updates for real-time chart
  })
  const yieldHistory = yieldHistoryQuery.data || []

  const handleClaimSimulation = async (eventRow: any) => {
    if (!addresses.yieldDistributor) {
      toast.error('Yield distributor not configured on this network')
      return
    }

    try {
      setClaimingSimulationId(eventRow.id)
      const hash = await writeDistributor({
        address: addresses.yieldDistributor as `0x${string}`,
        abi: YIELD_DISTRIBUTOR_ABI,
        functionName: 'claimAndDistribute',
                args: [eventRow.asset as `0x${string}`, BigInt(eventRow.tokenId)],
      })

      await publicClient?.waitForTransactionReceipt({ hash })
      toast.success('Yield claimed & distributed')
      await yieldHistoryQuery.refetch()
    } catch (error: any) {
      console.error('Yield Claim Error:', error)
      toast.error(error.shortMessage || error.message || 'Failed to claim yield')
    } finally {
      setClaimingSimulationId(null)
    }
  }

  const chartData = useMemo(() => {
    if (!yieldHistory || yieldHistory.length === 0) return []

    let filteredEvents = [...yieldHistory]
    const now = Date.now() / 1000 // seconds
    let cutoff = 0

    if (chartRange === '1W') cutoff = now - 7 * 24 * 60 * 60
    if (chartRange === '1M') cutoff = now - 30 * 24 * 60 * 60
    if (chartRange === '3M') cutoff = now - 90 * 24 * 60 * 60
    if (chartRange === 'ALL') cutoff = 0

    filteredEvents = filteredEvents.filter((e: any) => Number(e.timestamp) >= cutoff)

    let cumulativeYield = 0
    let cumulativeDebtRepaid = 0

    return filteredEvents.map((e: any) => {
      const yieldAmount = parseFloat(formatUnits(BigInt(e.lenderYield), 6))
      const debtRepaid = parseFloat(formatUnits(BigInt(e.repaidDebt), 6))
      const protocolFee = parseFloat(formatUnits(BigInt(e.protocolFee), 6))
      const totalAmount = parseFloat(formatUnits(BigInt(e.totalAmount), 6))

      cumulativeYield += yieldAmount
      cumulativeDebtRepaid += debtRepaid

      return {
        date: new Date(Number(e.timestamp) * 1000).toISOString(),
        timestamp: Number(e.timestamp),
        yieldAmount,
        debtRepaid,
        protocolFee,
        totalAmount,
        cumulativeYield,
        cumulativeDebtRepaid
      }
    })
  }, [yieldHistory, chartRange])

  if (isLoadingPositions) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin" size={48} />
      </div>
    )
  }

  if (!nft || !position) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-black uppercase">Loan Position Not Found</h2>
        <button onClick={() => navigate('/borrower/dashboard')} className="btn-primary mt-4 flex items-center gap-2 mx-auto">
          <ArrowLeft /> Back to Dashboard
        </button>
      </div>
    )
  }

  // Derived Values
  const totalBorrowed = parseFloat(formatUnits(position.totalBorrowed, 6))
  const remainingDebt = parseFloat(formatUnits(position.remainingDebt, 6))
  const repaid = totalBorrowed - remainingDebt
  const yieldGenerated = repaid // Yield generated equals amount repaid
  const repaymentProgress = totalBorrowed > 0 ? (repaid / totalBorrowed) * 100 : 0


  const handleWithdraw = async () => {
    if (remainingDebt > 0.01) { // Tolerance for dust
      toast.error('Cannot withdraw while debt remains!')
      return
    }

    try {
      setIsWithdrawing(true)
      const hash = await writeLoanManager({
        address: addresses.loanManager as `0x${string}`,
        abi: LOAN_MANAGER_ABI,
        functionName: 'withdrawNFT',
        args: [position.nftContract, position.tokenId]
      })
      toast.success(`Withdrawal transaction sent: ${hash.slice(0, 10)}...`)
      // Ideally wait for receipt here or via a global watcher

      // Optimistic update or wait for refetch
      setTimeout(() => {
        navigate('/borrower/dashboard')
      }, 2000)

    } catch (error: any) {
      console.error(error)
      toast.error(error.shortMessage || 'Failed to withdraw NFT')
    } finally {
      setIsWithdrawing(false)
    }
  }

  const handleManualRepay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualRepayAmount || Number(manualRepayAmount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    const amount = Number(manualRepayAmount)
    const amountBigInt = parseUnits(manualRepayAmount, 6)

    if (amount > remainingDebt + 0.1) { // Small buffer
      toast.error(`Amount exceeds remaining debt ($${remainingDebt.toFixed(2)})`)
      return
    }

    try {
      setIsRepaying(true)

      // Check Allowance
      if (!allowance || allowance < amountBigInt) {
        toast('Approving USDC...', { icon: '📝' })
        await writeApprove({
          address: addresses.usdc as `0x${string}`,
          abi: erc20Abi,
          functionName: 'approve',
          args: [addresses.loanManager as `0x${string}`, amountBigInt]
        })

        toast.success('Approval sent! Please wait a moment then confirm Repay.')
        refetchAllowance()
        setIsRepaying(false)
        return
      }

      const hash = await writeLoanManager({
        address: addresses.loanManager as `0x${string}`,
        abi: LOAN_MANAGER_ABI,
        functionName: 'repay',
        args: [position.nftContract, position.tokenId, amountBigInt]
      })

      toast.success(`Repayment successful! Tx: ${hash.slice(0, 10)}...`)
      setManualRepayAmount('')
      refetchPositions()

    } catch (error: any) {
      console.error(error)
      toast.error(error.shortMessage || 'Repayment failed')
    } finally {
      setIsRepaying(false)
    }
  }

  const needsApproval = allowance ? allowance < parseUnits(manualRepayAmount || '0', 6) : true

  const handleYieldConfigChange = (config: 'repay' | 'reinvest') => {
    // Mock logic for now
    if (nft.type !== 'veAERO' && nft.type !== 'veVELO') {
      toast.error('Yield reinvestment only available for veNFTs!')
      return
    }
    setYieldConfig(config)
  }

  const handleSaveConfiguration = async () => {
    // Mock logic for now
    if (nft.type !== 'veAERO' && nft.type !== 'veVELO' && yieldConfig === 'reinvest') {
      toast.error('Yield reinvestment only available for veNFTs!')
      return
    }
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    const newConfig = {
      mode: yieldConfig,
      ratio: yieldConfig === 'reinvest' ? reinvestRatio : undefined
    }
    setCurrentSavedConfig(newConfig)
    setIsSaving(false)
    toast.success(`Configuration saved successfully!`)
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
            <span className={`text-lg px-3 py-1 border-2 border-black ${position.isActive ? 'bg-neo-green' : 'bg-gray-200'}`}>
              {position.isActive ? 'Active' : 'Closed'}
            </span>
          </h1>
          <p className="font-bold text-gray-600 mt-2">ID: {position.tokenId.toString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: NFT & Actions */}
        <div className="space-y-6">
          <NFTCard nft={nft} />

          <div className="card-neo bg-white space-y-4">
            <h3 className="text-xl font-black uppercase">Quick Actions</h3>

            <div className="border-b-4 border-black pb-4 mb-4">
              <h4 className="font-bold uppercase mb-2">Manual Repay</h4>
              <form onSubmit={handleManualRepay} className="flex gap-2">
                <input
                  type="number"
                  placeholder="Amount"
                  value={manualRepayAmount}
                  onChange={(e) => setManualRepayAmount(e.target.value)}
                  className="w-full border-2 border-black p-2 font-bold focus:outline-none focus:bg-neo-yellow"
                  disabled={isRepaying}
                />
                <button
                  type="submit"
                  disabled={isRepaying || !manualRepayAmount}
                  className="btn-neo bg-black text-white p-2 min-w-[50px] flex justify-center items-center"
                >
                  {isRepaying ? <Loader2 className="animate-spin" size={20} /> : (needsApproval && Number(manualRepayAmount) > 0 ? "Approve" : <Wallet size={20} />)}
                </button>
              </form>
              {needsApproval && Number(manualRepayAmount) > 0 && <p className="text-xs text-gray-500 mt-1">Approval required first</p>}
            </div>

            <button
              onClick={handleWithdraw}
              disabled={remainingDebt > 0.01 || isWithdrawing}
              className={`w-full btn-neo flex items-center justify-center gap-2 ${remainingDebt > 0.01
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-400'
                : 'bg-white hover:bg-red-50 text-red-600'
                }`}
            >
              {isWithdrawing ? <Loader2 className="animate-spin" /> : <ArrowUpRight size={20} />}
              Withdraw NFT
            </button>

            {(nft.type === 'veAERO' || nft.type === 'veVELO') && (
              <button className="w-full btn-neo bg-neo-blue text-white flex items-center justify-center gap-2">
                <Vote size={20} /> Vote veNFT
              </button>
            )}

            {nft.type === 'rwa' && (
              <button className="w-full btn-neo bg-neo-magenta text-white flex items-center justify-center gap-2">
                <FileText size={20} /> Claim RWA Yield
              </button>
            )}
          </div>
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="card-neo bg-neo-red text-white">
                    <h4 className="font-bold uppercase opacity-80">Remaining Debt</h4>
                    <p className="text-3xl font-black">${remainingDebt.toLocaleString()}</p>
                  </div>
                  <div className="card-neo bg-neo-green text-black">
                    <h4 className="font-bold uppercase opacity-80">Yield Generated</h4>
                    <p className="text-3xl font-black">${yieldGenerated.toLocaleString()}</p>
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
                    {/* <span>{Math.max(0, position.totalWeeks - position.currentWeek)} Weeks Left</span> */}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="card-neo bg-white border-2">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black uppercase flex items-center gap-2">
                      <BarChart3 /> Yield Performance Analytics
                    </h3>

                    <div className="flex gap-2">
                      {/* Chart Type Selector */}
                      <select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value as 'yield' | 'debt' | 'cumulative')}
                        className="px-3 py-1 text-sm font-bold bg-neo-blue text-white border-2 border-black"
                      >
                        <option value="yield">Yield Amount</option>
                        <option value="debt">Debt Repaid</option>
                        <option value="cumulative">Cumulative</option>
                      </select>

                      {/* Time Range Selector */}
                      {(['1W', '1M', '3M', 'ALL'] as const).map((range) => (
                        <button
                          key={range}
                          onClick={() => setChartRange(range)}
                          className={`px-3 py-1 text-sm font-bold ${chartRange === range ? 'bg-black text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Enhanced Analytics Chart */}
                  <div className="h-64 bg-gray-50 border-2 border-dashed border-black p-4 relative">
                    {chartData.length > 0 ? (
                      <div className="h-full flex flex-col">
                        {/* Chart Area */}
                        <div className="flex-1 flex items-end justify-between gap-1">
                          {chartData.map((data, index) => {
                            let value, color, label;

                            switch (chartType) {
                              case 'yield':
                                value = data.yieldAmount;
                                color = 'bg-neo-green';
                                label = `Yield: $${data.yieldAmount.toFixed(2)}`;
                                break;
                              case 'debt':
                                value = data.debtRepaid;
                                color = 'bg-red-500';
                                label = `Debt Repaid: $${data.debtRepaid.toFixed(2)}`;
                                break;
                              case 'cumulative':
                                value = data.cumulativeYield;
                                color = 'bg-neo-blue';
                                label = `Total Yield: $${data.cumulativeYield.toFixed(2)}`;
                                break;
                              default:
                                value = data.yieldAmount;
                                color = 'bg-neo-green';
                                label = `$${data.yieldAmount.toFixed(2)}`;
                            }

                            const maxValue = Math.max(...chartData.map(d => {
                              switch (chartType) {
                                case 'yield': return d.yieldAmount;
                                case 'debt': return d.debtRepaid;
                                case 'cumulative': return d.cumulativeYield;
                                default: return d.yieldAmount;
                              }
                            }));

                            const heightPercentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

                            return (
                              <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                                <div
                                  className={`w-full ${color} border-2 border-black hover:opacity-80 transition-all`}
                                  style={{ height: `${Math.max(heightPercentage, 2)}%`, minHeight: '4px' }}
                                ></div>
                                <span className="text-xs font-bold mt-1 text-gray-500 absolute -bottom-6 transform -rotate-45 origin-top-left">
                                  {new Date(data.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                                {/* Enhanced Tooltip */}
                                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 bg-black text-white text-xs p-2 rounded whitespace-nowrap z-10 pointer-events-none">
                                  <div className="font-bold">{label}</div>
                                  <div>Fee: ${data.protocolFee.toFixed(2)}</div>
                                  <div>{new Date(data.timestamp * 1000).toLocaleString()}</div>
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Chart Summary */}
                        <div className="mt-4 pt-2 border-t border-gray-300 flex justify-between text-xs font-bold">
                          <span>Total Events: {chartData.length}</span>
                          <span>
                            {chartType === 'cumulative'
                              ? `Total Yield: $${chartData[chartData.length - 1]?.cumulativeYield.toFixed(2) || '0'}`
                              : `Avg per Event: $${(chartData.reduce((sum, d) => {
                                  switch (chartType) {
                                    case 'yield': return sum + d.yieldAmount;
                                    case 'debt': return sum + d.debtRepaid;
                                    default: return sum + d.yieldAmount;
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
                                    onClick={() => handleClaimSimulation(event)}
                                    disabled={isClaiming || !addresses.yieldDistributor}
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
            )}

            {activeTab === 'settings' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="card-neo bg-white">
                  <h3 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
                    <Settings /> Yield Configuration Panel
                  </h3>

                  <div className="space-y-4">
                    <label className={`flex items-start gap-4 p-6 border-4 border-black cursor-pointer transition-all ${yieldConfig === 'repay' ? 'bg-neo-yellow shadow-neo' : 'hover:bg-gray-50'}`}>
                      <input
                        type="radio"
                        name="yieldConfig"
                        checked={yieldConfig === 'repay'}
                        onChange={() => handleYieldConfigChange('repay')}
                        className="mt-1 w-6 h-6 accent-black"
                      />
                      <div>
                        <h4 className="font-black uppercase text-xl mb-2">Auto-Repay Mode (Default)</h4>
                        <p className="font-bold text-gray-700 leading-relaxed">
                          All generated yield is automatically allocated to pay down your loan principal + interest.
                          This is the fastest way to become debt-free and unlock your NFT.
                        </p>
                      </div>
                    </label>

                    <label className={`block p-6 border-4 border-black cursor-pointer transition-all ${yieldConfig === 'reinvest' ? 'bg-neo-cyan shadow-neo' : 'hover:bg-gray-50'}`}>
                      <div className="flex items-start gap-4 mb-4">
                        <input
                          type="radio"
                          name="yieldConfig"
                          checked={yieldConfig === 'reinvest'}
                          onChange={() => handleYieldConfigChange('reinvest')}
                          className="mt-1 w-6 h-6 accent-black"
                        />
                        <div>
                          <h4 className="font-black uppercase text-xl mb-2">Compound Reinvest Mode (veNFT Only)</h4>
                          <p className="font-bold text-gray-700 leading-relaxed">
                            Reinvest yield to increase your voting power and future yield potential.
                          </p>
                        </div>
                      </div>

                      {/* ... reinvest details retained ... */}
                      {yieldConfig === 'reinvest' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="pl-10 mt-4 border-t-2 border-black pt-4"
                        >
                          <h5 className="font-black uppercase mb-4">Reinvestment Allocation</h5>

                          <div className="flex items-center justify-between mb-2 font-bold">
                            <span>Debt Repayment: {100 - reinvestRatio}%</span>
                            <span>Reinvest: {reinvestRatio}%</span>
                          </div>

                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="10"
                            value={reinvestRatio}
                            onChange={(e) => setReinvestRatio(Number(e.target.value))}
                            className="w-full h-4 bg-white rounded-lg appearance-none cursor-pointer accent-black border-2 border-black mb-4"
                          />

                          <div className="p-4 bg-white border-2 border-black">
                            <p className="font-bold text-sm mb-2 flex justify-between">
                              <span>Projected Voting Power Increase:</span>
                              <span className="text-neo-green">+{reinvestRatio * 0.5} veNFT</span>
                            </p>
                            <p className="font-bold text-sm flex justify-between">
                              <span>Est. Debt Reduction Speed:</span>
                              <span className="text-neo-red">-{reinvestRatio}% Slower</span>
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </label>
                  </div>

                  {/* Current Configuration Status */}
                  <div className="mt-6 p-4 bg-black text-white border-2 border-black">
                    <h4 className="font-black uppercase mb-2">Current Active Configuration</h4>
                    <p className="font-bold">
                      {currentSavedConfig.mode === 'repay'
                        ? '🔄 100% Auto-Repay Mode'
                        : `📈 ${currentSavedConfig.ratio}% Reinvest / ${100 - (currentSavedConfig.ratio || 0)}% Repay Mode`
                      }
                    </p>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSaveConfiguration}
                    disabled={isSaving}
                    className={`w-full mt-6 btn-primary text-xl py-4 shadow-neo-lg hover:shadow-neo hover:translate-y-1 flex items-center justify-center gap-2 ${isSaving ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                  >
                    {isSaving ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving Configuration...
                      </>
                    ) : (
                      <>
                        <Settings size={24} />
                        Save Configuration
                      </>
                    )}
                  </button>

                  {nft.type === 'rwa' && (
                    <div className="mt-4 p-4 bg-red-100 border-2 border-red-500 text-red-700 font-bold flex items-center gap-2">
                      <AlertTriangle /> Reinvestment is not available for Real World Assets (RWA).
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BorrowerDetail
