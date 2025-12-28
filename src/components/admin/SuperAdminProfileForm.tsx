import { useForm } from '@tanstack/react-form';
import { AlertTriangle, CheckCircle, Crown, Mail, Shield, User } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateUserProfile } from '@/hooks/use-admin-queries';
import { User as UserType } from './UserManagement';

interface ProfileEditFormData {
  name: string;
  email: string;
  role: 'user' | 'reviewer' | 'admin' | 'super_admin';
}

export interface SuperAdminProfileFormProps {
  user: UserType;
  currentUserRole: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SuperAdminProfileForm({ 
  user, 
  currentUserRole, 
  onSuccess, 
  onCancel 
}: SuperAdminProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateUserProfile = useUpdateUserProfile();

  // Check if current user has permission to edit profiles
  const canEditProfiles = currentUserRole === 'super_admin';

  const form = useForm<ProfileEditFormData>({
    defaultValues: {
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'user',
    },
    onSubmit: async ({ value }) => {
      if (!canEditProfiles) {
        return;
      }

      // Validation
      if (!value.name || value.name.length < 2) {
        return;
      }
      if (value.name.length > 100) {
        return;
      }
      if (!value.email || !isValidEmail(value.email)) {
        return;
      }
      if (!value.role) {
        return;
      }

      setIsSubmitting(true);
      try {
        await updateUserProfile.mutateAsync({
          id: user.id,
          name: value.name !== user.name ? value.name : undefined,
          email: value.email !== user.email ? value.email : undefined,
          role: value.role !== user.role ? value.role : undefined,
        });
        onSuccess();
      } catch (error) {
        console.error('Failed to update user profile:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'super_admin':
        return {
          icon: Crown,
          label: 'Super Admin',
          description: 'Full system access with user management capabilities',
          variant: 'default' as const,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
        };
      case 'admin':
        return {
          icon: Shield,
          label: 'Admin',
          description: 'Administrative access to manage applications and users',
          variant: 'secondary' as const,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
        };
      case 'reviewer':
        return {
          icon: CheckCircle,
          label: 'Reviewer',
          description: 'Can review and approve/reject lawyer applications',
          variant: 'outline' as const,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
        };
      case 'user':
        return {
          icon: User,
          label: 'User',
          description: 'Standard user access',
          variant: 'outline' as const,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
        };
      default:
        return {
          icon: User,
          label: 'Unknown',
          description: 'Unknown role',
          variant: 'outline' as const,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
        };
    }
  };

  if (!canEditProfiles) {
    return (
      <div className="space-y-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Access Denied:</strong> Only Super Admins can edit user profiles.
          </AlertDescription>
        </Alert>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onCancel}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Information Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <Badge variant={getRoleConfig(user.role).variant}>
              {getRoleConfig(user.role).label}
            </Badge>
          </CardTitle>
          <CardDescription>
            Edit user profile information and role permissions
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Profile Edit Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        {/* Name Field */}
        <form.Field
          name="name"
          children={(field) => (
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name *</label>
              <Input
                placeholder="Enter full name"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                The user's display name throughout the platform
              </p>
              {field.state.value && field.state.value.length < 2 && (
                <p className="text-sm text-red-600">
                  Name must be at least 2 characters long
                </p>
              )}
              {field.state.value && field.state.value.length > 100 && (
                <p className="text-sm text-red-600">
                  Name must not exceed 100 characters
                </p>
              )}
            </div>
          )}
        />

        {/* Email Field */}
        <form.Field
          name="email"
          children={(field) => (
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address *</label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                The user's login email address
              </p>
              {field.state.value && !isValidEmail(field.state.value) && (
                <p className="text-sm text-red-600">
                  Please enter a valid email address
                </p>
              )}
            </div>
          )}
        />

        {/* Role Selection */}
        <form.Field
          name="role"
          children={(field) => {
            const roleConfig = getRoleConfig(field.state.value);
            const RoleIcon = roleConfig.icon;

            return (
              <div className="space-y-2">
                <label className="text-sm font-medium">User Role *</label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value as 'user' | 'reviewer' | 'admin' | 'super_admin')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-600" />
                        <span>User</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="reviewer">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Reviewer</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span>Admin</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="super_admin">
                      <div className="flex items-center space-x-2">
                        <Crown className="h-4 w-4 text-purple-600" />
                        <span>Super Admin</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  Determines the user's access level and permissions
                </p>

                {/* Role Preview */}
                {field.state.value && (
                  <Alert className={roleConfig.bgColor}>
                    <RoleIcon className={`h-4 w-4 ${roleConfig.color}`} />
                    <AlertDescription>
                      <strong>{roleConfig.label}:</strong> {roleConfig.description}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            );
          }}
        />

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !form.state.isDirty}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Warning for Role Changes */}
      <form.Field
        name="role"
        children={(field) => (
          field.state.value !== user.role && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Role Change Warning:</strong> Changing this user's role will immediately affect
                their access permissions. This action will be logged for audit purposes.
                {field.state.value === 'super_admin' && (
                  <div className="mt-2">
                    <strong>Super Admin Access:</strong> This role grants full system access including
                    the ability to modify other admin accounts.
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )
        )}
      />
    </div>
  );
}