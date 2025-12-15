// modules/lend/viewmodels/deposit.viewmodel.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAccount, useBalance, useReadContract, useWriteContract, usePublicClient, useChainId } from 'wagmi'
import { formatUnits, parseUnits, erc20Abi } from 'viem'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import { LenderService } from '../services/lender.service'
import { useContractAddresses } from '../../../shared/hooks/use-contract-addresses'
import { LENDING_POOL_ABI } from '../../../constants/contracts'

export function useDepositViewModel() {
  const { address } = useAccount()
  const chainId = useChainId()
  const navigate = useNavigate()
  const addresses = useContractAddresses()
  const queryClient = useQueryClient()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()

  const [amount, setAmount] = useState<number>(0)

  // Get balance
  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address,
    token: addresses.usdc as `0x${string}`
  })

  const balanceValue = balanceData ? parseFloat(formatUnits(balanceData.value, balanceData.decimals)) : 0
  const balanceSymbol = balanceData?.symbol || 'USDC'

  // Get allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: addresses.usdc as `0x${string}`,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address!, addresses.lendingPool as `0x${string}`],
    query: { enabled: !!address }
  })

  const currentAllowance = allowance ? parseFloat(formatUnits(allowance, 6)) : 0
  const isApproved = currentAllowance >= amount && amount > 0

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!address || amount <= 0) throw new Error('Invalid amount')
      
      const hash = await writeContractAsync({
        address: addresses.usdc as `0x${string}`,
        abi: erc20Abi,
        functionName: 'approve',
        args: [addresses.lendingPool as `0x${string}`, parseUnits(amount.toString(), 6)]
      })

      await publicClient?.waitForTransactionReceipt({ hash })
      return hash
    },
    onSuccess: () => {
      toast.success('USDC Approved!')
      refetchAllowance()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Approval failed')
    }
  })

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: async () => {
      if (!address || amount <= 0) throw new Error('Invalid amount')
      
      // Validate
      const validation = LenderService.validateDepositAmount(amount, balanceValue)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      const hash = await writeContractAsync({
        address: addresses.lendingPool as `0x${string}`,
        abi: LENDING_POOL_ABI,
        functionName: 'deposit',
        args: [parseUnits(amount.toString(), 6)]
      })

      await publicClient?.waitForTransactionReceipt({ hash })
      return hash
    },
    onSuccess: () => {
      toast.success(`Successfully deposited ${amount.toLocaleString()} ${balanceSymbol}`)
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['lenderPosition', address] })
      queryClient.invalidateQueries({ queryKey: ['lenderTransactions', address] })
      queryClient.invalidateQueries({ queryKey: ['balanceOf', address] })
      queryClient.invalidateQueries({ queryKey: ['convertToAssets'] })
      refetchBalance()
      // Wait a bit for indexer to process the event
      setTimeout(() => {
        navigate('/lender/dashboard')
      }, 2000)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Deposit failed')
    }
  })

  // Mint USDC (for testnet)
  const mintMutation = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error('No address')
      
      const hash = await writeContractAsync({
        address: addresses.usdc as `0x${string}`,
        abi: [{
          type: 'function',
          name: 'mintPublic',
          inputs: [
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' }
          ],
          outputs: [],
          stateMutability: 'nonpayable'
        }] as const,
        functionName: 'mintPublic',
        args: [address, parseUnits('1000', 6)]
      })

      await publicClient?.waitForTransactionReceipt({ hash })
      return hash
    },
    onSuccess: () => {
      toast.success('Minting 1000 Mock USDC...')
      setTimeout(() => refetchBalance(), 2000)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Mint failed')
    }
  })

  return {
    // State
    amount,
    setAmount,
    balanceValue,
    balanceSymbol,
    chainId,
    
    // Approval
    isApproved,
    currentAllowance,
    
    // Actions
    approve: approveMutation.mutate,
    deposit: depositMutation.mutate,
    mint: mintMutation.mutate,
    
    // Loading states
    isApproving: approveMutation.isPending,
    isDepositing: depositMutation.isPending,
    isMinting: mintMutation.isPending,
    
    // Utils
    maxBalance: balanceValue
  }
}

