import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginForm } from "@/components/auth/LoginForm";
import { Logo } from "@/components/logo";
import { SEOHead } from "@/components/seo/SEOHead";
import { PAGE_SEO_CONFIG } from "@/config/page-seo";
import { getUser } from "@/functions/get-user";
import { generateAuthPageSEO } from "@/utils/seo";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    // Check if user is already authenticated
    const session = await getUser();
    
    if (session?.user) {
      // If authenticated, redirect to dashboard
      throw redirect({
        to: '/dashboard',
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const seoMetadata = generateAuthPageSEO({
    title: PAGE_SEO_CONFIG.login.title,
    description: PAGE_SEO_CONFIG.login.description,
    path: '/login',
  });

  return (
    <>
      <SEOHead metadata={seoMetadata} />
      <main className="relative lg:grid lg:grid-cols-2 md:h-screen md:overflow-hidden">
        <div className="hidden relative lg:flex flex-col border-r h-full overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-no-repeat bg-center"
            style={{ backgroundImage: 'url(/getalawyer-logo.jpg)' }}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/50 to-black/30" />
          
          {/* Content */}
          <div className="z-10 relative flex flex-col p-10 h-full">
            <Logo className="brightness-0 invert mr-auto h-5" />
            
            <div className="mt-auto">
              <blockquote className="space-y-2 text-white">
                <p className="text-xl">
                  &ldquo;This Platform has helped me to save time and serve my
                  clients faster than ever before.&rdquo;
                </p>
                <footer className="font-mono font-semibold text-white/80 text-sm">
                  ~ Ali Hassan
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
        <div className="relative flex flex-col justify-center p-6 lg:p-8 min-h-screen">
          <div
            aria-hidden
            className="-z-10 isolate absolute inset-0 opacity-60 contain-strict"
          >
            <div className="top-0 right-0 absolute bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)] rounded-full w-140 h-320 -translate-y-87.5" />
            <div className="top-0 right-0 absolute bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] rounded-full w-60 h-320 [translate:5%_-50%]" />
            <div className="top-0 right-0 absolute bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] rounded-full w-60 h-320 -translate-y-87.5" />
          </div>
          <div className="mx-auto w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </main>
    </>
  );
}
