import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { SEOHead } from '@/components/seo/SEOHead'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toastManager } from '@/components/ui/toast'
import { PAGE_SEO_CONFIG } from '@/config/page-seo'
import { generateProtectedPageSEO } from '@/utils/seo'

export const Route = createFileRoute('/subscription-success')({
  component: SubscriptionSuccess,
})

type VerificationStatus = 'loading' | 'success' | 'pending' | 'error'

function SubscriptionSuccess() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/subscription-success' })
  const reference = (search as any)?.reference
  
  const [status, setStatus] = useState<VerificationStatus>('loading')
  const [subscriptionData, setSubscriptionData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const seoMetadata = generateProtectedPageSEO({
    title: PAGE_SEO_CONFIG.subscriptionSuccess.title,
    description: PAGE_SEO_CONFIG.subscriptionSuccess.description,
    path: '/subscription-success',
  });

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setStatus('error')
        setError('Missing payment reference')
        return
      }

      try {
        // Call the verify endpoint directly without using the API client
        // since this is a public page without authentication context
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/subscriptions/verify/${reference}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: 'Payment verification failed',
          }))
          throw new Error(errorData.message || 'Payment verification failed')
        }

        const data = await response.json()

        if (data.status === 'active') {
          setStatus('success')
          setSubscriptionData(data.subscription)
          toastManager.add({
            title: 'Subscription Activated',
            description: 'Your subscription is now active!',
            type: 'success',
          })
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            navigate({ to: '/dashboard' })
          }, 2000)
        } else if (data.status === 'pending') {
          setStatus('pending')
          setError(data.message || 'Payment is still being processed. Please check back in a few moments.')
        } else {
          setStatus('error')
          setError(data.message || 'Payment verification failed')
        }
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'An error occurred during verification')
      }
    }

    verifyPayment()
  }, [reference, navigate])

  if (status === 'loading') {
    return (
      <>
        <SEOHead metadata={seoMetadata} />
        <div className="flex justify-center items-center bg-background p-4 min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Verifying Payment</CardTitle>
              <CardDescription>Please wait while we verify your payment...</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  if (status === 'success') {
    return (
      <>
        <SEOHead metadata={seoMetadata} />
        <div className="flex justify-center items-center bg-background p-4 min-h-screen">
        <Card className="border-green-200 w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <CardTitle className="text-center">Subscription Activated!</CardTitle>
            <CardDescription className="text-center">
              Your subscription is now active
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscriptionData && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold capitalize">{subscriptionData.status}</span>
                </div>
                {subscriptionData.subscriptionEndDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valid Until:</span>
                    <span className="font-semibold">
                      {new Date(subscriptionData.subscriptionEndDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {subscriptionData.daysRemaining && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Days Remaining:</span>
                    <span className="font-semibold">{subscriptionData.daysRemaining}</span>
                  </div>
                )}
              </div>
            )}
            <p className="text-gray-500 text-xs text-center">Redirecting to dashboard...</p>
            <Button
              onClick={() => navigate({ to: '/dashboard' })}
              className="w-full"
            >
              Go to Dashboard Now
            </Button>
          </CardContent>
        </Card>
      </div>
      </>
    )
  }

  if (status === 'pending') {
    return (
      <>
        <SEOHead metadata={seoMetadata} />
        <div className="flex justify-center items-center bg-background p-4 min-h-screen">
        <Card className="border-yellow-200 w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-yellow-600" />
            </div>
            <CardTitle className="text-center">Payment Pending</CardTitle>
            <CardDescription className="text-center">
              Your payment is still being processed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-sm">
              {error}
            </p>
            <Button
              onClick={() => navigate({ to: '/dashboard' })}
              variant="outline"
              className="w-full"
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
      </>
    )
  }

  return (
    <>
      <SEOHead metadata={seoMetadata} />
      <div className="flex justify-center items-center bg-background p-4 min-h-screen">
        <Card className="border-red-200 w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <CardTitle className="text-center">Payment Failed</CardTitle>
            <CardDescription className="text-center">
              There was an issue with your payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-sm">
              {error}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => navigate({ to: '/dashboard/plans' })}
                className="flex-1"
              >
                Try Again
              </Button>
              <Button
                onClick={() => navigate({ to: '/dashboard' })}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
