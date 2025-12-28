import { useForm } from '@tanstack/react-form';
import { format } from 'date-fns';
import { AlertTriangle, CalendarIcon, Flag, UserCheck, UserX } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateUserStatus } from '@/hooks/use-admin-queries';
import { cn } from '@/lib/utils';
import { User } from './UserManagement';

interface UserStatusFormData {
  action: 'suspend' | 'reactivate' | 'flag';
  reason: string;
  banExpires?: Date;
}

export interface UserStatusFormProps {
  user: User;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserStatusForm({ user, onSuccess, onCancel }: UserStatusFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateUserStatus = useUpdateUserStatus();

  const form = useForm<UserStatusFormData>({
    defaultValues: {
      action: user.banned ? 'reactivate' : 'suspend',
      reason: '',
      banExpires: undefined,
    },
    onSubmit: async ({ value }) => {
      // Validation
      if (!value.action) {
        return;
      }
      if (!value.reason || value.reason.length < 10) {
        return;
      }
      if (value.reason.length > 500) {
        return;
      }
      if (value.action === 'suspend' && value.banExpires && value.banExpires <= new Date()) {
        return;
      }

      setIsSubmitting(true);
      try {
        await updateUserStatus.mutateAsync({
          id: user.id,
          status: value.action,
          reason: value.reason,
          banExpires: value.banExpires ? value.banExpires.toISOString() : undefined,
        });
        onSuccess();
      } catch (error) {
        console.error('Failed to update user status:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const getActionConfig = (action: string) => {
    switch (action) {
      case 'suspend':
        return {
          icon: UserX,
          label: 'Suspend Account',
          description: 'Temporarily disable the user account',
          variant: 'destructive' as const,
          color: 'text-red-600',
        };
      case 'reactivate':
        return {
          icon: UserCheck,
          label: 'Reactivate Account',
          description: 'Restore access to the user account',
          variant: 'default' as const,
          color: 'text-green-600',
        };
      case 'flag':
        return {
          icon: Flag,
          label: 'Flag Account',
          description: 'Mark account for review without suspending',
          variant: 'secondary' as const,
          color: 'text-yellow-600',
        };
      default:
        return {
          icon: AlertTriangle,
          label: 'Unknown Action',
          description: '',
          variant: 'outline' as const,
          color: 'text-gray-600',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* User Information */}
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
            <Badge variant={user.banned ? 'destructive' : 'default'}>
              {user.banned ? 'Banned' : 'Active'}
            </Badge>
          </CardTitle>
          <CardDescription>
            {user.banned ? (
              <div className="text-red-600">
                Account is currently suspended
                {user.banReason && (
                  <div className="mt-1">
                    <strong>Reason:</strong> {user.banReason}
                  </div>
                )}
                {user.banExpires && (
                  <div className="mt-1">
                    <strong>Expires:</strong> {format(new Date(user.banExpires), 'PPP')}
                  </div>
                )}
              </div>
            ) : (
              'Account is currently active'
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Status Update Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        {/* Action Selection */}
        <form.Field
          name="action"
          children={(field) => {
            const actionConfig = getActionConfig(field.state.value);
            const ActionIcon = actionConfig.icon;

            return (
              <div className="space-y-2">
                <label className="text-sm font-medium">Action</label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value as 'suspend' | 'reactivate' | 'flag')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suspend">
                      <div className="flex items-center space-x-2">
                        <UserX className="h-4 w-4 text-red-600" />
                        <span>Suspend Account</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="reactivate">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        <span>Reactivate Account</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="flag">
                      <div className="flex items-center space-x-2">
                        <Flag className="h-4 w-4 text-yellow-600" />
                        <span>Flag for Review</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  Choose the action to perform on this user account
                </p>
                {!field.state.value && (
                  <p className="text-sm text-red-600">Please select an action</p>
                )}

                {/* Action Preview */}
                {field.state.value && (
                  <Alert>
                    <ActionIcon className={cn('h-4 w-4', actionConfig.color)} />
                    <AlertDescription>
                      <strong>{actionConfig.label}:</strong> {actionConfig.description}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            );
          }}
        />

        {/* Reason Field */}
        <form.Field
          name="reason"
          children={(field) => (
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason *</label>
              <Textarea
                placeholder="Provide a detailed reason for this action..."
                className="min-h-[100px]"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                Explain why this action is being taken (minimum 10 characters)
              </p>
              {field.state.value && field.state.value.length < 10 && (
                <p className="text-sm text-red-600">
                  Reason must be at least 10 characters long
                </p>
              )}
              {field.state.value && field.state.value.length > 500 && (
                <p className="text-sm text-red-600">
                  Reason must not exceed 500 characters
                </p>
              )}
            </div>
          )}
        />

        {/* Ban Expiration Date (only for suspend action) */}
        <form.Field
          name="action"
          children={(actionField) => (
            actionField.state.value === 'suspend' && (
              <form.Field
                name="banExpires"
                children={(field) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ban Expiration Date (Optional)</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.state.value && 'text-muted-foreground'
                          )}
                        >
                          {field.state.value ? (
                            format(field.state.value, 'PPP')
                          ) : (
                            <span>Select expiration date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.state.value}
                          onSelect={(date) => field.handleChange(date)}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-sm text-gray-500">
                      Leave empty for permanent suspension. Date must be in the future.
                    </p>
                    {field.state.value && field.state.value <= new Date() && (
                      <p className="text-sm text-red-600">
                        Ban expiration date must be in the future
                      </p>
                    )}
                  </div>
                )}
              />
            )
          )}
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
          <form.Field
            name="action"
            children={(actionField) => {
              const actionConfig = getActionConfig(actionField.state.value);
              const ActionIcon = actionConfig.icon;

              return (
                <Button
                  type="submit"
                  variant={actionConfig.variant}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ActionIcon className="h-4 w-4 mr-2" />
                      {actionConfig.label}
                    </>
                  )}
                </Button>
              );
            }}
          />
        </div>
      </form>

      {/* Warning for Destructive Actions */}
      <form.Field
        name="action"
        children={(field) => (
          field.state.value === 'suspend' && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Warning:</strong> Suspending this account will immediately prevent the user from
                accessing the platform. This action will be logged for audit purposes.
              </AlertDescription>
            </Alert>
          )
        )}
      />
    </div>
  );
}