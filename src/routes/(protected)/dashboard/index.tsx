import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { toastManager } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";
import { clearEnhancedOnboardingStore } from "@/stores/enhanced-onboarding-store";

export const Route = createFileRoute("/(protected)/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { data: session, error, isPending } = authClient.useSession();

  if (isPending) {
    return <div>Loading session...</div>;
  }

  // 3. Safety guard: If no session exists (and redirect hasn't happened yet), return null
  if (!session?.user) return null;

  const verifyEmail = async (email: string) => {
    try {
      await authClient.sendVerificationEmail({
        email: email,
        callbackURL: `${import.meta.env.VITE_APP_URL}/dashboard`,
        fetchOptions: {
          onSuccess: () => {
            toastManager.add({
              title: "Check your email",
              description: "We've sent a verification link to your inbox.",
              type: "success", // Assuming your toast supports types
            });
          },
        },
      });
    } catch (error) {
      console.error("Verification failed:", error);
    }
  };

  const handleSignOut = async () => {
    // Clear all onboarding-related cache before signing out
    clearEnhancedOnboardingStore();
    localStorage.removeItem('onboarding-form-draft');
    localStorage.removeItem('onboarding-progress');
    localStorage.removeItem('offline-operation-queue');
    
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => navigate({ to: "/login" }),
      },
    });
  };

  return (
    <div className="space-y-4 p-4">
      <h1 className="font-bold text-2xl">Dashboard</h1>
      <p>Welcome {session.user.name}</p>

      <Button size="lg" variant="destructive" onClick={handleSignOut}>
        Sign Out
      </Button>

      <div className="flex items-center gap-4">
        <span>
          The email is{" "}
          {session.user.emailVerified ? "Verified" : "Not Verified"}
        </span>
        {!session.user.emailVerified && (
          <Button
            onClick={() => verifyEmail(session.user.email)}
            variant="secondary"
          >
            Verify Email Address
          </Button>
        )}
      </div>
    </div>
  );
}
