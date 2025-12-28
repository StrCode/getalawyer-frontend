import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, FileText, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useApproveApplication, useRejectApplication } from '@/hooks/use-admin-queries';
import type { Application } from './ApplicationManagement';

// Validation schemas
const approveSchema = z.object({
  reviewNotes: z
    .string()
    .min(10, 'Review notes must be at least 10 characters')
    .max(1000, 'Review notes must not exceed 1000 characters'),
});

const rejectSchema = z.object({
  reason: z
    .string()
    .min(5, 'Rejection reason must be at least 5 characters')
    .max(200, 'Rejection reason must not exceed 200 characters'),
  feedback: z
    .string()
    .max(1000, 'Feedback must not exceed 1000 characters')
    .optional(),
});

type ApproveFormData = z.infer<typeof approveSchema>;
type RejectFormData = z.infer<typeof rejectSchema>;

interface ApplicationReviewFormProps {
  application: Application;
  mode: 'approve' | 'reject';
  onApprove?: (notes: string) => void;
  onReject?: (reason: string, feedback: string) => void;
  onCancel?: () => void;
}

export function ApplicationReviewForm({
  application,
  mode,
  onApprove,
  onReject,
  onCancel,
}: ApplicationReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API mutations
  const approveMutation = useApproveApplication();
  const rejectMutation = useRejectApplication();

  // Form setup based on mode
  const approveForm = useForm<ApproveFormData>({
    resolver: zodResolver(approveSchema),
    defaultValues: {
      reviewNotes: '',
    },
  });

  const rejectForm = useForm<RejectFormData>({
    resolver: zodResolver(rejectSchema),
    defaultValues: {
      reason: '',
      feedback: '',
    },
  });

  const handleApprove = async (data: ApproveFormData) => {
    setIsSubmitting(true);
    try {
      await approveMutation.mutateAsync({
        id: application.id,
        reviewNotes: data.reviewNotes,
      });
      onApprove?.(data.reviewNotes);
    } catch (error) {
      console.error('Failed to approve application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (data: RejectFormData) => {
    setIsSubmitting(true);
    try {
      await rejectMutation.mutateAsync({
        id: application.id,
        reason: data.reason,
        feedback: data.feedback || '',
      });
      onReject?.(data.reason, data.feedback || '');
    } catch (error) {
      console.error('Failed to reject application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || approveMutation.isPending || rejectMutation.isPending;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel?.()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {mode === 'approve' ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Approve Application</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-600" />
                <span>Reject Application</span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Application Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Application Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Lawyer:</span>
                <p className="text-gray-900">{application.lawyerName}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Email:</span>
                <p className="text-gray-900">{application.lawyerEmail}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Location:</span>
                <p className="text-gray-900">
                  {application.country}
                  {application.state && `, ${application.state}`}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Experience:</span>
                <p className="text-gray-900">{application.yearsOfExperience} years</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Bar License:</span>
                <p className="text-gray-900 font-mono">{application.barLicenseNumber}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Bar Association:</span>
                <p className="text-gray-900">{application.barAssociation}</p>
              </div>
            </div>
          </div>

          {/* Documents Preview */}
          {application.documents && application.documents.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Submitted Documents</span>
              </h4>
              <div className="space-y-2">
                {application.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-sm">{doc.originalName}</p>
                      <p className="text-xs text-gray-500 capitalize">{doc.type.replace('_', ' ')}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review Form */}
          <div className="border-t pt-6">
            {mode === 'approve' ? (
              <Form {...approveForm}>
                <form onSubmit={approveForm.handleSubmit(handleApprove)} className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>Approve This Application</span>
                    </h3>
                    
                    <FormField
                      control={approveForm.control}
                      name="reviewNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-800">
                            Review Notes *
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Provide detailed notes about why this application is being approved. Include any specific observations about the candidate's qualifications, documentation quality, or other relevant factors..."
                              className="min-h-[120px] border-green-300 focus:border-green-500 focus:ring-green-500"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                          <div className="text-xs text-green-700 mt-1">
                            {approveForm.watch('reviewNotes')?.length || 0}/1000 characters
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center justify-between mt-6">
                      <div className="text-sm text-green-700">
                        <p className="font-medium">This action will:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Mark the application as approved</li>
                          <li>Grant the lawyer access to the platform</li>
                          <li>Send an approval notification email</li>
                        </ul>
                      </div>
                      <div className="flex space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={onCancel}
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-green-600 hover:bg-green-700"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Approving...' : 'Approve Application'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              </Form>
            ) : (
              <Form {...rejectForm}>
                <form onSubmit={rejectForm.handleSubmit(handleReject)} className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center space-x-2">
                      <XCircle className="h-5 w-5" />
                      <span>Reject This Application</span>
                    </h3>
                    
                    <div className="space-y-4">
                      <FormField
                        control={rejectForm.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-red-800">
                              Rejection Reason *
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g., Incomplete documentation, Invalid bar license, Insufficient experience"
                                className="border-red-300 focus:border-red-500 focus:ring-red-500"
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                            <div className="text-xs text-red-700 mt-1">
                              {rejectForm.watch('reason')?.length || 0}/200 characters
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={rejectForm.control}
                        name="feedback"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-red-800">
                              Detailed Feedback (Optional)
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Provide constructive feedback to help the applicant understand what needs to be improved or corrected for future applications..."
                                className="min-h-[100px] border-red-300 focus:border-red-500 focus:ring-red-500"
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                            <div className="text-xs text-red-700 mt-1">
                              {rejectForm.watch('feedback')?.length || 0}/1000 characters
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-6">
                      <div className="text-sm text-red-700">
                        <p className="font-medium">This action will:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Mark the application as rejected</li>
                          <li>Prevent platform access</li>
                          <li>Send a rejection notification email</li>
                          <li>Allow the lawyer to reapply after corrections</li>
                        </ul>
                      </div>
                      <div className="flex space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={onCancel}
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="destructive"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Rejecting...' : 'Reject Application'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              </Form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}