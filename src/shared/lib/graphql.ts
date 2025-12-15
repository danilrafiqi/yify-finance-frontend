// shared/lib/graphql.ts

const endpoint = import.meta.env.VITE_PONDER_GRAPHQL_ENDPOINT || 'http://localhost:42069/graphql'

export interface GraphQLResponse<T> {
  data?: T
  errors?: Array<{ message: string }>
}

/**
 * Simple GraphQL client
 */
export async function query<T>(queryString: string, variables?: any): Promise<T> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: queryString, variables })
  })

  const result: GraphQLResponse<T> = await response.json()

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'GraphQL query failed')
  }

  if (!result.data) {
    throw new Error('No data returned from GraphQL query')
  }

  return result.data
}

