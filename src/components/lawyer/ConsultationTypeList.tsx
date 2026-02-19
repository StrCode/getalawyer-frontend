import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useConsultationTypes, useDeleteConsultationType } from '@/lib/hooks/useConsultationTypes';

export function ConsultationTypeList() {
  const { data: consultationTypes, isLoading, error } = useConsultationTypes();
  const deleteConsultationType = useDeleteConsultationType();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteConsultationType.mutateAsync(id);
    } catch (error) {
      // Error is handled by the mutation
      console.error('Failed to delete consultation type:', error);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-full h-32" />
        <Skeleton className="w-full h-32" />
        <Skeleton className="w-full h-32" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load consultation types. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!consultationTypes || consultationTypes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Consultation Types</CardTitle>
          <CardDescription>
            You haven't created any consultation types yet. Create your first one to start accepting bookings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/lawyer/consultation-types/new">
            <Button>Create Consultation Type</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {consultationTypes.map((type) => (
        <Card key={type.id} data-testid="consultation-type-item">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle>{type.name}</CardTitle>
                  <Badge variant={type.isActive ? 'default' : 'secondary'}>
                    {type.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <CardDescription>{type.description}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Link to="/lawyer/consultation-types/$id/edit" params={{ id: type.id }}>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deletingId === type.id}
                    >
                      {deletingId === type.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the "{type.name}" consultation type.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(type.id)}
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="gap-4 grid grid-cols-2 text-sm">
              <div>
                <span className="font-medium">Duration:</span> {type.duration} minutes
              </div>
              <div>
                <span className="font-medium">Price:</span> ${type.price.toFixed(2)}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
