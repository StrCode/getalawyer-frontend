import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'

interface Subscription {
  id: string
  status: 'active' | 'pending' | 'expired' | 'cancelled' | 'failed_renewal'
  subscriptionStartDate: string
  subscriptionEndDate: string
  nextBillingDate: string
  daysRemaining: number
  cardLast4: string
  bank: string
  autoRenewEnabled: boolean
}

interface SubscriptionResponse {
  success: boolean
  data: {
    hasActiveSubscription: boolean
    subscription: Subscription | null
  }
}

export function useSubscription() {
  return useQuery<SubscriptionResponse>({
    queryKey: ['subscription'],
    queryFn: async () => {
      return api.subscriptions.getStatus()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
