import { createFileRoute } from '@tanstack/react-router';
import { UserManagement } from '@/components/admin';
import { SEOHead } from '@/components/seo/SEOHead';
import { PAGE_SEO_CONFIG } from '@/config/page-seo';
import { generateProtectedPageSEO } from '@/utils/seo';

export const Route = createFileRoute('/(protected)/admin/users')({
  component: UsersPage,
});

function UsersPage() {
  // TODO: Get current user role from auth context
  const currentUserRole = 'super_admin'; // This should come from auth context

  const seoMetadata = generateProtectedPageSEO({
    title: PAGE_SEO_CONFIG.adminUsers.title,
    description: PAGE_SEO_CONFIG.adminUsers.description,
    path: '/admin/users',
  });

  return (
    <>
      <SEOHead metadata={seoMetadata} />
      <UserManagement 
        userType="all" 
        currentUserRole={currentUserRole}
      />
    </>
  );
}