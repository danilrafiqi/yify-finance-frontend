// modules/borrow/viewmodels/calculator.viewmodel.ts
import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useChainId } from 'wagmi'
import { toast } from 'react-hot-toast'
import { parseUnits, formatUnits } from 'viem'
import { useContractAddresses } from '../../../shared/hooks/use-contract-addresses'
import { CONTRACT_ADDRESSES, LISK_SEPOLIA_CHAIN_ID, LENDING_POOL_ABI, LOAN_MANAGER_ABI, ERC721_ABI, SIMPLE_ORACLE_ABI } from '../../../constants/contracts'

export function useCalculatorViewModel() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const chainId = useChainId()
  const addresses = useContractAddresses()
  const contractAddresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || CONTRACT_ADDRESSES[LISK_SEPOLIA_CHAIN_ID]

  const tokenIdFromUrl = searchParams.get('tokenId')
  const contractFromUrl = searchParams.get('contract')
  const nftTokenId = tokenIdFromUrl || '0'
  const nftContract = contractFromUrl || contractAddresses.veNFT

  const [loanAmount, setLoanAmount] = useState<number>(0)
  const [currentStep, setCurrentStep] = useState<'approve' | 'deposit' | 'borrow'>('approve')

  // Read NFT Value from Oracle
  const { data: nftValueData } = useReadContract({
    address: contractAddresses.nftOracle as `0x${string}`,
    abi: SIMPLE_ORACLE_ABI,
    functionName: 'getAssetPrice',
    args: [nftContract as `0x${string}`, BigInt(nftTokenId || '0')],
    query: { enabled: !!contractAddresses.nftOracle && !!nftContract }
  })

  // Oracle returns 18 decimals
  const nftValue = nftValueData ? parseFloat(formatUnits(nftValueData as bigint, 18)) : 0
  const maxBorrow = nftValue * 0.50 // 50% LTV

  // Read Pool Stats to check available liquidity
  const { data: totalAssets } = useReadContract({
    address: contractAddresses.lendingPool as `0x${string}`,
    abi: LENDING_POOL_ABI,
    functionName: 'totalAssets',
    query: { enabled: true }
  })

  // USDC uses 6 decimals
  const availableLiquidity = totalAssets ? parseFloat(formatUnits(totalAssets as bigint, 6)) : 0

  useEffect(() => {
    if (maxBorrow > 0) {
      setLoanAmount(Math.floor(maxBorrow * 0.5))
    }
  }, [maxBorrow])

  // Transactions
  const { writeContract: writeApprove, data: approveTxHash, isPending: isApproving, error: approveError } = useWriteContract()
  const { isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveTxHash })

  const { writeContract: writeBorrow, data: borrowTxHash, isPending: isBorrowing, error: borrowError } = useWriteContract()
  const { isSuccess: isBorrowSuccess } = useWaitForTransactionReceipt({ hash: borrowTxHash })

  // Error handling
  useEffect(() => {
    if (approveError) {
      toast.error(`Approve failed: ${approveError.message}`)
    }
  }, [approveError])

  useEffect(() => {
    if (borrowError) {
      console.error('Borrow error:', borrowError)
      toast.error(`Borrow failed: ${borrowError.message}`)
    }
  }, [borrowError])

  // Step tracking
  useEffect(() => {
    if (isApproveSuccess) {
      toast.success('NFT Approved!')
      setCurrentStep('deposit')
    }
  }, [isApproveSuccess])

  useEffect(() => {
    if (isBorrowSuccess) {
      toast.success(`Successfully borrowed $${loanAmount}!`)
      navigate('/borrower/dashboard')
    }
  }, [isBorrowSuccess, loanAmount, navigate])

  const handleApprove = () => {
    writeApprove({
      address: nftContract as `0x${string}`,
      abi: ERC721_ABI,
      functionName: 'setApprovalForAll',
      args: [contractAddresses.loanManager as `0x${string}`, true]
    })
  }

  const handleBorrow = () => {
    if (loanAmount <= 0) {
      toast.error('Loan amount must be greater than 0')
      return
    }
    if (loanAmount > availableLiquidity) {
      toast.error(`Insufficient pool liquidity. Available: $${availableLiquidity.toFixed(2)}`)
      return
    }
    writeBorrow({
      address: contractAddresses.loanManager as `0x${string}`,
      abi: LOAN_MANAGER_ABI,
      functionName: 'borrow',
      args: [nftContract as `0x${string}`, BigInt(nftTokenId), parseUnits(String(loanAmount), 6)]
    })
  }

  // Calculations (assuming 20% APY for demo)
  const projectedYield = 20 // 20% APY
  const weeklyYield = (nftValue * (projectedYield / 100)) / 52
  const repaymentAllocation = weeklyYield * 0.75
  const weeksToRepay = loanAmount > 0 ? Math.ceil(loanAmount / repaymentAllocation) : 0
  const totalYieldGenerated = weeklyYield * weeksToRepay
  const originationFee = loanAmount * 0.008
  const ltv = nftValue > 0 ? (loanAmount / nftValue) * 100 : 0

  return {
    tokenIdFromUrl,
    nftTokenId,
    nftContract,
    loanAmount,
    setLoanAmount,
    nftValue,
    maxBorrow,
    availableLiquidity,
    currentStep,
    isApproving,
    isBorrowing,
    isApproveSuccess,
    handleApprove,
    handleBorrow,
    projectedYield,
    weeklyYield,
    repaymentAllocation,
    weeksToRepay,
    totalYieldGenerated,
    originationFee,
    ltv,
    contractAddresses
  }
}

