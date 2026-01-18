import { createFileRoute } from '@tanstack/react-router'
import { AlertCircle, Check, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toastManager } from '@/components/ui/toast'
import { api } from '@/lib/api/client'

export const Route = createFileRoute('/(protected)/dashboard/plans')({
  component: PlansPage,
})

function PlansPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const plan = {
    name: 'Professional',
    price: 50000,
    description: 'Everything you need to grow your practice',
    duration: 'per year',
    features: [
      'Unlimited client management',
      'Advanced case tracking',
      'Document automation',
      'Priority support',
      'Analytics dashboard',
      'Team collaboration tools',
    ],
  }

  const handleSubscribe = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.subscriptions.initialize()
      
      if (response.success && response.data?.redirectUrl) {
        toastManager.add({
          title: 'Redirecting to Payment',
          description: 'You will be redirected to Paystack to complete your payment',
          type: 'success',
        })
        window.location.href = response.data.redirectUrl
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toastManager.add({
        title: 'Subscription Error',
        description: errorMessage,
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-auto">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 font-bold text-3xl">Choose Your Plan</h1>
          <p className="text-gray-600">Select the plan that works best for you</p>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-50 mb-6 p-4 border border-red-200 rounded-lg">
            <AlertCircle className="mt-0.5 w-5 h-5 text-red-600 shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="gap-6 grid">
          <Card className="relative border-2 border-blue-500">
            <div className="-top-3 left-6 absolute bg-blue-500 px-3 py-1 rounded-full font-semibold text-white text-sm">
              Recommended
            </div>
            <CardHeader className="pt-8">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="font-bold text-4xl">
                  ₦{plan.price.toLocaleString()}
                </div>
                <p className="mt-1 text-gray-600 text-sm">{plan.duration}</p>
              </div>

              <Button
                onClick={handleSubscribe}
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Subscribe Now'
                )}
              </Button>

              <div className="space-y-3">
                <p className="font-semibold text-sm">What's included:</p>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-600 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
