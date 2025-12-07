import { useQuery } from '@tanstack/react-query';

// GraphQL query for LenderPosition
const GET_LENDER_POSITION_QUERY = `
  query GetLenderPosition($where: LenderPositionFilter!) {
    lenderPositions(where: $where) {
      items {
        id
        user
        totalDeposited
        totalWithdrawn
        currentBalance
        updatedAt
      }
    }
  }
`;

// GraphQL query for transaction history
const GET_LENDER_TRANSACTIONS_QUERY = `
  query GetLenderTransactions($where: DepositWithdrawEventFilter!, $orderBy: String!, $limit: Int!) {
    depositWithdrawEvents(where: $where, orderBy: $orderBy, limit: $limit) {
      items {
        id
        user
        type
        assets
        shares
        timestamp
        txHash
        blockNumber
      }
    }
  }
`;

// Type definitions
export interface LenderPosition {
    id: string;
    user: string;
    totalDeposited: string;
    totalWithdrawn: string;
    currentBalance: string;
    updatedAt: string;
}

export interface LenderPositionResponse {
    lenderPositions: {
        items: LenderPosition[];
    };
}

export interface LenderPositionFilter {
    user?: string;
}

export interface DepositWithdrawEvent {
    id: string;
    user: string;
    type: string;
    assets: string;
    shares: string;
    timestamp: string;
    txHash: string;
    blockNumber: string;
}

export interface LenderTransactionsResponse {
    depositWithdrawEvents: {
        items: DepositWithdrawEvent[];
    };
}

// Custom hook to get lender position
export function useGetLenderPosition(userAddress?: string) {
    return useQuery<LenderPositionResponse>({
        queryKey: ['lenderPosition', userAddress],
        queryFn: async () => {
            const graphqlEndpoint = import.meta.env.VITE_PONDER_GRAPHQL_ENDPOINT || 'http://localhost:42069/graphql';

            const response = await fetch(graphqlEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: GET_LENDER_POSITION_QUERY,
                    variables: {
                        where: {
                            user: userAddress?.toLowerCase()
                        }
                    }
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.errors) {
                throw new Error(data.errors[0]?.message || 'GraphQL query failed');
            }

            return data.data as LenderPositionResponse;
        },
        enabled: !!userAddress, // Only run query if user address is provided
        staleTime: 10000, // Data is fresh for 10 seconds
        refetchInterval: 30000, // Refetch every 30 seconds
    });
}

// Custom hook to get lender transaction history
export function useGetLenderTransactions(userAddress?: string, limit: number = 10) {
    return useQuery<LenderTransactionsResponse>({
        queryKey: ['lenderTransactions', userAddress, limit],
        queryFn: async () => {
            const graphqlEndpoint = import.meta.env.VITE_PONDER_GRAPHQL_ENDPOINT || 'http://localhost:42069/graphql';

            const response = await fetch(graphqlEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: GET_LENDER_TRANSACTIONS_QUERY,
                    variables: {
                        where: {
                            user: userAddress?.toLowerCase()
                        },
                        orderBy: "timestamp",
                        limit: limit
                    }
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.errors) {
                throw new Error(data.errors[0]?.message || 'GraphQL query failed');
            }

            return data.data as LenderTransactionsResponse;
        },
        enabled: !!userAddress,
        staleTime: 10000,
        refetchInterval: 30000,
    });
}
