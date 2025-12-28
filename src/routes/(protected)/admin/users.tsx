import { createFileRoute } from '@tanstack/react-router';
import { UserManagement } from '@/components/admin';

export const Route = createFileRoute('/(protected)/admin/users')({
  component: UsersPage,
});

function UsersPage() {
  // TODO: Get current user role from auth context
  const currentUserRole = 'super_admin'; // This should come from auth context

  return (
    <UserManagement 
      userType="all" 
      currentUserRole={currentUserRole}
    />
  );
}