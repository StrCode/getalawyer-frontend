import { Link } from '@tanstack/react-router'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSubscription } from '@/hooks/use-subscription'

export function SubscriptionBanner() {
  const { data, isLoading } = useSubscription()

  if (isLoading) {
    return (
      <div className="flex justify-between items-center gap-4 bg-gray-50 p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-gray-600 animate-spin shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900">Loading subscription status...</h3>
          </div>
        </div>
      </div>
    )
  }

  const hasActiveSubscription = data?.data?.hasActiveSubscription

  if (hasActiveSubscription) {
    const subscription = data?.data?.subscription
    return (
      <div className="flex justify-between items-center gap-4 bg-green-50 p-4 border border-green-200 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 text-green-600 shrink-0">✓</div>
          <div>
            <h3 className="font-semibold text-green-900">Active Subscription</h3>
            <p className="text-green-700 text-sm">
              {subscription?.daysRemaining ? `${subscription.daysRemaining} days remaining` : 'Your subscription is active'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-between items-center gap-4 bg-blue-50 p-4 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
        <div>
          <h3 className="font-semibold text-blue-900">Upgrade Your Plan</h3>
          <p className="text-blue-700 text-sm">Subscribe to unlock premium features</p>
        </div>
      </div>
      <Link to="/dashboard/plans">
        <Button variant="default" size="sm">
          View Plans
        </Button>
      </Link>
    </div>
  )
}
