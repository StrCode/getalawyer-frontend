// ============================================
// Step 2: Bar Admission & Licenses - Enhanced with file upload, validation, and progress tracking
// onboarding/lawyer/credentials.tsx
// ============================================

import { AlertCircleIcon, FloppyDiskIcon, Tick01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import * as z from "zod/v4";
import { ProgressTracker } from "@/components/onboarding/progress-tracker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import type { FileUploadError, UploadedFile } from "@/components/ui/file-uploader";
import { FileUploader } from "@/components/ui/file-uploader";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toastManager } from "@/components/ui/toast";
import { useAppForm } from "@/hooks/form";
import { useDraftIndicator, useDraftManager } from "@/hooks/use-draft-manager";
import type { DocumentInput } from "@/lib/api/client";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { DocumentData, OnboardingStep } from "@/stores/enhanced-onboarding-store";
import { useEnhancedOnboardingStore } from "@/stores/enhanced-onboarding-store";
import { ValidationEngine } from "@/utils/validation-engine";

export const Route = createFileRoute("/onboarding/lawyer/credentials")({
  component: LawyerCredentialsStep,
});

// Enhanced validation schema
const credentialsSchema = z.object({
  barNumber: z.string().min(3, { message: "Bar association number must be at least 3 characters" }),
  admissionYear: z.number({
    message: "Year of admission is required",
  }).int(),
  lawSchool: z.string().min(3, { message: "Law school must be at least 3 characters" }),
  graduationYear: z.number({
    message: "Graduation year is required",
  }).int(),
  currentFirm: z.string().optional(),
}).refine((data) => {
  const currentYear = new Date().getFullYear();
  return data.admissionYear <= currentYear;
}, {
  message: "Admission year cannot be in the future",
  path: ["admissionYear"],
}).refine((data) => {
  const currentYear = new Date().getFullYear();
  return data.admissionYear >= currentYear - 70;
}, {
  message: "Please enter a valid admission year",
  path: ["admissionYear"],
}).refine((data) => {
  const currentYear = new Date().getFullYear();
  return data.graduationYear <= currentYear;
}, {
  message: "Graduation year cannot be in the future",
  path: ["graduationYear"],
}).refine((data) => {
  return data.graduationYear <= data.admissionYear;
}, {
  message: "Graduation year must be before or equal to admission year",
  path: ["graduationYear"],
});

type CredentialsFormData = z.infer<typeof credentialsSchema>;

// Enhanced field validation component
interface EnhancedFieldProps {
  name: keyof CredentialsFormData;
  label: string;
  required?: boolean;
  description?: string;
  children: React.ReactNode;
  validationResult?: {
    hasError: boolean;
    hasWarning: boolean;
    isValid: boolean;
    primaryError?: { message: string; suggestion?: string };
    successMessage?: string;
  };
}

function EnhancedField({ 
  name, 
  label, 
  required = false, 
  description, 
  children, 
  validationResult 
}: EnhancedFieldProps) {
  const hasError = validationResult?.hasError || false;
  const hasWarning = validationResult?.hasWarning || false;
  const isValid = validationResult?.isValid && !hasError && !hasWarning;

  return (
    <Field className="gap-2">
      <FieldLabel htmlFor={name} className="flex items-center gap-2">
        {label}
        {required && <span className="text-red-500">*</span>}
        {isValid && (
          <HugeiconsIcon icon={Tick01Icon} className="w-4 h-4 text-green-500" />
        )}
        {hasError && (
          <HugeiconsIcon icon={AlertCircleIcon} className="w-4 h-4 text-red-500" />
        )}
      </FieldLabel>
      
      {children}
      
      {description && (
        <FieldDescription className="text-xs">
          {description}
        </FieldDescription>
      )}
      
      {/* Enhanced error display */}
      {hasError && validationResult?.primaryError && (
        <FieldError className="flex items-center gap-1">
          <HugeiconsIcon icon={AlertCircleIcon} className="w-3 h-3" />
          {validationResult.primaryError.message}
          {validationResult.primaryError.suggestion && (
            <span className="text-xs text-gray-600 ml-1">
              ({validationResult.primaryError.suggestion})
            </span>
          )}
        </FieldError>
      )}
      
      {/* Success message */}
      {isValid && validationResult.successMessage && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <HugeiconsIcon icon={Tick01Icon} className="w-3 h-3" />
          {validationResult.successMessage}
        </p>
      )}
    </Field>
  );
}

function LawyerCredentialsStep() {
  const router = useRouter();
  
  // Hydration state (prevent hydration mismatch)
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Enhanced onboarding store
  const {
    currentStep,
    completedSteps,
    credentials,
    addDocument,
    removeDocument,
    markStepCompleted,
    setCurrentStep,
    validateStep,
    clearAllErrors,
    setError,
    clearError,
    updateLastSaved,
    updateCredentials,
    canAccessStep
  } = useEnhancedOnboardingStore();

  // Draft management
  const draftManager = useDraftManager({
    stepId: 'documents' as OnboardingStep,
    autoSaveInterval: 30000, // 30 seconds
    onSave: (data) => {
      console.log('Draft saved:', data);
    },
    onRestore: (data) => {
      console.log('Draft restored:', data);
      if (data && typeof data === 'object') {
        const formData = data as CredentialsFormData;
        setFormData(formData);
      }
    }
  });

  // Draft indicator
  const draftIndicator = useDraftIndicator('documents' as OnboardingStep);

  // Form state - initialize from store
  const [formData, setFormData] = useState<CredentialsFormData>({
    barNumber: credentials.barNumber || "",
    admissionYear: credentials.admissionYear || new Date().getFullYear() - 5,
    lawSchool: credentials.lawSchool || "",
    graduationYear: credentials.graduationYear || new Date().getFullYear() - 8,
    currentFirm: credentials.currentFirm || "",
  });

  // File upload state is now managed by the documentUpload hook
  // const [uploadedFiles, setUploadedFiles] = useState<Array<UploadedFile>>([]);
  // const [uploadProgress, setUploadProgress] = useState<Array<{
  //   fileId: string;
  //   fileName: string;
  //   progress: number;
  //   status: 'uploading' | 'completed' | 'error';
  // }>>([]);

  // File upload state - now using real backend API
  const [uploadedFiles, setUploadedFiles] = useState<Array<UploadedFile>>([]);
  
  // Track if credentials have been saved
  const [credentialsSaved, setCredentialsSaved] = useState(false);
  const [isSavingCredentials, setIsSavingCredentials] = useState(false);

  // Simple file upload callbacks
  const handleUploadComplete = useCallback((files: Array<UploadedFile>) => {
    // Convert to DocumentData format and add to store
    files.forEach(file => {
      const documentData: DocumentData = {
        id: file.id,
        type: 'bar_certificate',
        originalName: file.name,
        url: file.url || '',
        publicId: file.publicId || '',
        fileSize: file.size,
        uploadProgress: 100,
        uploadStatus: 'completed',
        uploadedAt: file.uploadedAt,
      };
      addDocument(documentData);
    });

    toastManager.add({
      title: "Documents uploaded",
      description: `${files.length} document(s) uploaded successfully.`,
      type: "success",
    });
  }, [addDocument]);

  const handleUploadError = useCallback((error: FileUploadError) => {
    toastManager.add({
      title: "Upload failed",
      description: error.message,
      type: "error",
    });
  }, []);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 60 }, (_, i) => currentYear - i);

  // Update form data and trigger draft save + store update
  const updateFormField = <TKey extends keyof CredentialsFormData>(field: TKey, value: CredentialsFormData[TKey]) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Update store with credentials data
    updateCredentials({ [field]: value });
    
    // Update draft
    draftManager.updatePendingData(newFormData);
    
    // Clear field-specific errors
    clearError(field as string);
  };

  // Load existing documents only if user is returning to edit (not on fresh onboarding)
  useEffect(() => {
    const loadExistingDocuments = async () => {
      try {
        // Only load if we have reason to believe documents exist
        // Check if user has completed this step before or has documents in store
        const { documents, completedSteps: storeCompletedSteps } = useEnhancedOnboardingStore.getState();
        
        if (storeCompletedSteps.includes('documents') && documents.length === 0) {
          // User has completed this step before but we don't have documents in store
          // This means they're returning to edit, so we should load from backend
          const response = await api.lawyer.getDocuments();
          
          if (response.success && response.documents.length > 0) {
            const existingFiles: Array<UploadedFile> = response.documents.map((doc: { id: string; originalName?: string; url: string; publicId: string; createdAt: string }) => ({
              id: doc.id,
              name: doc.originalName || 'Document',
              size: 0, // Size not available from backend
              type: 'application/pdf', // Default type
              url: doc.url,
              publicId: doc.publicId,
              uploadedAt: new Date(doc.createdAt),
            }));
            
            setUploadedFiles(existingFiles);
            
            // Also add to store
            response.documents.forEach((doc: { id: string; type: string; originalName?: string; url: string; publicId: string; createdAt: string }) => {
              addDocument({
                id: doc.id,
                type: doc.type,
                originalName: doc.originalName || '',
                url: doc.url,
                publicId: doc.publicId,
                fileSize: 0, // Size not available from backend
                uploadProgress: 100,
                uploadStatus: 'completed',
                uploadedAt: new Date(doc.createdAt),
              });
            });
          }
        }
      } catch (error) {
        console.warn('Failed to load existing documents:', error);
        // Don't show error to user - this is optional loading
      }
    };

    loadExistingDocuments();
  }, [addDocument]); // Add addDocument to dependencies

  // Initialize form from draft on mount
  useEffect(() => {
    const restoredDraft = draftManager.restoreDraft();
    if (restoredDraft && typeof restoredDraft === 'object') {
      const draftData = restoredDraft as CredentialsFormData;
      setFormData(draftData);
      // Also update store with restored data
      updateCredentials(draftData);
    }
  }, [draftManager, updateCredentials]);

  // Set current step on mount and check access
  useEffect(() => {
    setCurrentStep('documents' as OnboardingStep);
    
    // Check if user can access this step
    if (!canAccessStep('documents')) {
      // Redirect to the appropriate step
      if (!completedSteps.includes('practice_info')) {
        router.navigate({ to: "/onboarding/lawyer/basics" });
      }
    }
  }, [setCurrentStep, canAccessStep, completedSteps, router]);

  // Initialize hydration state
  useEffect(() => {
    setIsHydrated(true);
    
    // Check if credentials are already saved (user returning to edit)
    const { credentials: storeCredentials } = useEnhancedOnboardingStore.getState();
    if (storeCredentials.barNumber && storeCredentials.lawSchool) {
      setCredentialsSaved(true);
    }
  }, []);

  // Handle saving credentials (separate from final submission)
  const handleSaveCredentials = async () => {
    try {
      setIsSavingCredentials(true);
      
      // Validate credentials fields only
      const credentialsValidation = credentialsSchema.safeParse(formData);
      if (!credentialsValidation.success) {
        credentialsValidation.error.errors.forEach(error => {
          setError(error.path[0] as string, [error.message]);
        });
        
        toastManager.add({
          title: "Validation failed",
          description: "Please fix the errors before saving.",
          type: "error",
        });
        return;
      }

      // Clear all errors
      clearAllErrors();

      // Get basic info from the store (saved from previous step)
      const { practiceInfo } = useEnhancedOnboardingStore.getState();

      // Prepare practice info data for backend (combines basics + credentials)
      const practiceInfoData = {
        phoneNumber: practiceInfo.phoneNumber,
        country: practiceInfo.country,
        state: practiceInfo.state,
        yearsOfExperience: calculateExperience(formData.admissionYear) || 0,
        barLicenseNumber: formData.barNumber,
        barAssociation: "State Bar", // You might want to make this configurable
        licenseStatus: "active", // You might want to make this configurable
      };

      // Save practice info to backend
      await api.lawyer.savePracticeInfo(practiceInfoData);
      
      // Update store with credentials data
      updateCredentials(formData);
      
      // Mark credentials as saved
      setCredentialsSaved(true);
      
      // Update last saved timestamp
      updateLastSaved();

      toastManager.add({
        title: "Credentials saved",
        description: "Your professional credentials have been saved. You can now upload documents.",
        type: "success",
      });
      
    } catch (error) {
      console.error('Error saving credentials:', error);
      toastManager.add({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save credentials. Please try again.",
        type: "error",
      });
    } finally {
      setIsSavingCredentials(false);
    }
  };

  // Calculate years of experience
  const calculateExperience = (year: number | undefined) => {
    if (!year) return null;
    return currentYear - year;
  };

  // Handle file removal
  const handleFileRemove = useCallback(async (fileId: string) => {
    try {
      // Remove from backend if it's a real uploaded file (has a proper UUID format)
      if (fileId && !fileId.startsWith('file-')) {
        await api.lawyer.deleteDocument(fileId);
      }
      
      // Remove from local state
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
      removeDocument(fileId);
      
      toastManager.add({
        title: "Document removed",
        description: "Document has been successfully removed.",
        type: "success",
      });
    } catch (error) {
      console.error('Failed to remove document:', error);
      toastManager.add({
        title: "Removal failed",
        description: error instanceof Error ? error.message : "Failed to remove document. Please try again.",
        type: "error",
      });
    }
  }, [removeDocument]);

  // Initialize form with TanStack Form
  const form = useAppForm({
    defaultValues: formData,
    validators: {
      onBlur: credentialsSchema,
    },
    onSubmit: async ({ value: _value }) => {
      try {
        // Check if credentials are saved first
        if (!credentialsSaved) {
          toastManager.add({
            title: "Save credentials first",
            description: "Please save your credentials before continuing.",
            type: "error",
          });
          return;
        }
        
        // Check if documents are uploaded
        if (uploadedFiles.length === 0) {
          toastManager.add({
            title: "Upload documents required",
            description: "Please upload at least one document before continuing.",
            type: "error",
          });
          return;
        }

        // Validate using enhanced validation engine
        const validationResult = ValidationEngine.validateStep('documents', useEnhancedOnboardingStore.getState());
        
        if (!validationResult.canProceed) {
          // Set errors in store for display
          validationResult.errors.forEach(error => {
            setError(error.field, [error.message]);
          });
          
          toastManager.add({
            title: "Validation failed",
            description: "Please fix the errors before continuing.",
            type: "error",
          });
          return;
        }

        // Clear all errors
        clearAllErrors();

        // Prepare documents data for backend (if we have real uploaded files)
        const documentsData: Array<DocumentInput> = uploadedFiles
          .filter(file => file.url?.startsWith('http')) // Only real uploaded files
          .map(file => ({
            type: 'bar_license' as const,
            url: file.url || '',
            publicId: file.publicId || file.id,
            originalName: file.name,
          }));

        // Save documents to backend (only if we have real uploaded files)
        if (documentsData.length > 0) {
          await api.lawyer.saveDocuments({ documents: documentsData });
        }
        
        // Mark step as completed
        markStepCompleted('documents' as OnboardingStep);
        
        // Clear draft since step is completed
        draftManager.clearDraft();
        
        // Update last saved timestamp
        updateLastSaved();

        toastManager.add({
          title: "Documents saved",
          description: "Your documents have been saved successfully.",
          type: "success",
        });

        router.navigate({ to: "/onboarding/lawyer/specializations" });
      } catch (error) {
        console.error('Error saving documents:', error);
        toastManager.add({
          title: "Save failed",
          description: error instanceof Error ? error.message : "Failed to save documents. Please try again.",
          type: "error",
        });
      }
    },
  });

  const selectedAdmissionYear = formData.admissionYear;
  const yearsOfExperience = calculateExperience(selectedAdmissionYear);

  const handleBack = () => {
    router.navigate({ to: "/onboarding/lawyer/basics" });
  };

  // Get current step validation for display
  const currentStepValidation = validateStep('documents');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Content */}
        <div className="lg:col-span-2">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Step 2 of 4</span>
              <span className="text-sm text-gray-500">Professional Credentials</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full transition-all duration-300 w-1/2"></div>
            </div>
          </div>

          {/* Draft Status Indicator */}
          {isHydrated && draftIndicator.status !== 'clean' && (
            <Alert className={cn("mb-6", {
              "border-blue-200 bg-blue-50": draftIndicator.status === 'saving',
              "border-green-200 bg-green-50": draftIndicator.status === 'draft',
              "border-orange-200 bg-orange-50": draftIndicator.status === 'unsaved',
              "border-red-200 bg-red-50": draftIndicator.status === 'error',
              "border-amber-200 bg-amber-50": draftIndicator.status === 'offline',
            })}>
              <AlertDescription className={cn("flex items-center gap-2", draftIndicator.color)}>
                <HugeiconsIcon icon={FloppyDiskIcon} className="w-4 h-4" />
                {draftIndicator.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Validation Summary */}
          {isHydrated && !currentStepValidation.isValid && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <HugeiconsIcon icon={AlertCircleIcon} className="w-4 h-4" />
              <AlertDescription>
                <div className="font-medium text-red-800 mb-2">
                  Please fix the following issues:
                </div>
                <ul className="text-sm text-red-700 space-y-1">
                  {currentStepValidation.errors.map((error, index) => (
                    <li key={`error-${error.field}-${index}`} className="flex items-start gap-1">
                      <span className="text-red-500 mt-0.5">•</span>
                      {error.message}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Professional Credentials
            </h2>
            <p className="text-sm text-gray-600">
              Help clients trust your expertise with verified credentials
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div className="space-y-8">
              {/* STEP 1: Professional Credentials Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Step 1: Professional Credentials</h3>
                    <p className="text-sm text-gray-600 mt-1">Enter your bar admission and education details</p>
                  </div>
                  {credentialsSaved && (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <HugeiconsIcon icon={Tick01Icon} className="w-3 h-3 mr-1" />
                      Saved
                    </Badge>
                  )}
                </div>

                {/* Bar Credentials */}
                <div className="bg-gray-50/40 border border-gray-200 rounded-lg p-6 space-y-5">
                  <h4 className="text-md font-semibold text-gray-900">Bar Admission</h4>

                  <FieldGroup className="grid md:grid-cols-2 gap-4">
                    <form.AppField name="barNumber">
                      {(field) => (
                        <EnhancedField 
                          name="barNumber" 
                          label="Bar Association Number" 
                          required 
                          description="We'll verify this with your state bar association"
                        >
                          <Input
                            id="barNumber"
                            placeholder="e.g., 123456"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                              field.handleChange(e.target.value);
                              updateFormField('barNumber', e.target.value);
                            }}
                            disabled={credentialsSaved}
                          />
                        </EnhancedField>
                      )}
                    </form.AppField>

                    <form.AppField name="admissionYear">
                      {(field) => (
                        <EnhancedField name="admissionYear" label="Year of Bar Admission" required>
                          <Select
                            value={field.state.value.toString()}
                            onValueChange={(value: string | null) => {
                              if (value && !credentialsSaved) {
                                const numValue = parseInt(value, 10);
                                field.handleChange(numValue);
                                updateFormField('admissionYear', numValue);
                                field.handleBlur();
                              }
                            }}
                            disabled={credentialsSaved}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {years.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </EnhancedField>
                      )}
                    </form.AppField>
                  </FieldGroup>

                  {/* Years of Experience Display */}
                  {yearsOfExperience !== null && (
                    <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                      <p className="text-sm font-medium text-green-900">
                        Years of Experience: {yearsOfExperience} years
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        Calculated from your admission year
                      </p>
                    </div>
                  )}
                </div>

                {/* Education Section */}
                <div className="bg-gray-50/40 border border-gray-200 rounded-lg p-6 space-y-5">
                  <h4 className="text-md font-semibold text-gray-900">Education</h4>

                  <form.AppField name="lawSchool">
                    {(field) => (
                      <EnhancedField name="lawSchool" label="Law School" required>
                        <Input
                          id="lawSchool"
                          placeholder="e.g., Harvard Law School"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => {
                            field.handleChange(e.target.value);
                            updateFormField('lawSchool', e.target.value);
                          }}
                          disabled={credentialsSaved}
                        />
                      </EnhancedField>
                    )}
                  </form.AppField>

                  <form.AppField name="graduationYear">
                    {(field) => (
                      <EnhancedField name="graduationYear" label="Graduation Year" required>
                        <Select
                          value={field.state.value.toString()}
                          onValueChange={(value: string | null) => {
                            if (value && !credentialsSaved) {
                              const numValue = parseInt(value, 10);
                              field.handleChange(numValue);
                              updateFormField('graduationYear', numValue);
                              field.handleBlur();
                            }
                          }}
                          disabled={credentialsSaved}
                        >
                          <SelectTrigger className="max-w-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </EnhancedField>
                    )}
                  </form.AppField>
                </div>

                {/* Current Practice Section */}
                <div className="bg-gray-50/40 border border-gray-200 rounded-lg p-6 space-y-5">
                  <h4 className="text-md font-semibold text-gray-900">Current Practice</h4>

                  <form.AppField name="currentFirm">
                    {(field) => (
                      <EnhancedField 
                        name="currentFirm" 
                        label="Current Law Firm / Practice" 
                        description="Leave blank if you're a solo practitioner"
                      >
                        <Input
                          id="currentFirm"
                          placeholder="e.g., Smith & Associates LLP"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => {
                            field.handleChange(e.target.value);
                            updateFormField('currentFirm', e.target.value);
                          }}
                          disabled={credentialsSaved}
                        />
                      </EnhancedField>
                    )}
                  </form.AppField>
                </div>

                {/* Save Credentials Button */}
                {!credentialsSaved && (
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <Button
                      type="button"
                      onClick={handleSaveCredentials}
                      disabled={isSavingCredentials}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg"
                    >
                      {isSavingCredentials ? "Saving..." : "Save Credentials"}
                    </Button>
                  </div>
                )}

                {credentialsSaved && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <HugeiconsIcon icon={Tick01Icon} className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-900">
                          Credentials Saved Successfully
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          You can now proceed to upload your documents below.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 2: Document Upload Section */}
              <div className={cn(
                "bg-white border border-gray-200 rounded-lg p-6 space-y-6 transition-all duration-300",
                !credentialsSaved && "opacity-50 pointer-events-none"
              )}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Step 2: Document Upload</h3>
                    <p className="text-sm text-gray-600 mt-1">Upload your professional documents</p>
                  </div>
                  {uploadedFiles.length > 0 && (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                      {uploadedFiles.length} document{uploadedFiles.length !== 1 ? 's' : ''} uploaded
                    </Badge>
                  )}
                </div>

                {!credentialsSaved && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-yellow-800 mb-2">
                      🔒 Complete Step 1 first
                    </p>
                    <p className="text-xs text-yellow-600">
                      You need to save your credentials before uploading documents
                    </p>
                  </div>
                )}

                {credentialsSaved && !completedSteps.includes('practice_info') && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-yellow-800 mb-2">
                      📋 Complete your practice information first
                    </p>
                    <p className="text-xs text-yellow-600">
                      You need to complete the basic information step before uploading documents
                    </p>
                  </div>
                )}

                {credentialsSaved && completedSteps.includes('practice_info') && (
                  <div className="bg-gray-50/40 border border-gray-200 rounded-lg p-6 space-y-5">
                    <Field className="gap-2">
                      <FieldLabel>Bar Certificate Upload</FieldLabel>
                      
                      <FileUploader
                        acceptedTypes={['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']}
                        maxSize={10 * 1024 * 1024} // 10MB
                        maxFiles={5}
                        multiple={true}
                        existingFiles={uploadedFiles}
                        onUploadStart={(files) => {
                          console.log('Upload started for:', files.map(f => f.name));
                        }}
                        onUploadComplete={handleUploadComplete}
                        onUploadError={handleUploadError}
                        onFileRemove={handleFileRemove}
                        uploadFunction={async (file: File, _onProgress: (progress: number) => void): Promise<UploadedFile> => {
                          try {
                            // Use the API client's uploadDocument method
                            const response = await api.lawyer.uploadDocument(file, {
                              documentType: 'bar_certificate',
                              description: 'Bar certificate upload'
                            });

                            if (!response.success) {
                              throw new Error(response.message || 'Upload failed');
                            }

                            const uploadedFile: UploadedFile = {
                              id: response.document.id,
                              name: response.document.originalName,
                              size: file.size, // Use original file size since API doesn't return it
                              type: file.type,
                              url: response.document.url,
                              publicId: response.document.publicId,
                              uploadedAt: new Date(response.document.createdAt),
                            };

                            // Add to local state
                            setUploadedFiles(prev => [...prev, uploadedFile]);
                            
                            return uploadedFile;
                          } catch (error) {
                            console.error('Document upload failed:', error);
                            throw new Error(
                              error instanceof Error 
                                ? error.message 
                                : 'Failed to upload document. Please try again.'
                            );
                          }
                        }}
                        className="mt-2"
                        showPreviews={true}
                        allowRetry={true}
                      />

                      <FieldDescription className="text-xs">
                        Upload copies of your bar certificate, law degree, or other professional credentials. Documents are uploaded immediately and securely stored.
                      </FieldDescription>
                    </Field>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="w-32"
              >
                ← Back
              </Button>
              <Button
                type="submit"
                disabled={form.state.isSubmitting || !credentialsSaved || uploadedFiles.length === 0}
                className={cn(
                  "flex-1 font-medium py-3 px-6 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
                  credentialsSaved && uploadedFiles.length > 0 
                    ? "bg-blue-500 hover:bg-blue-600 text-white" 
                    : "bg-gray-300 text-gray-500"
                )}
              >
                {form.state.isSubmitting ? "Saving..." : 
                 !credentialsSaved ? "Save Credentials First" :
                 uploadedFiles.length === 0 ? "Upload Documents First" :
                 "Continue to Specializations →"}
              </Button>
            </div>

            {/* Progress Info */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 text-xl">ℹ️</span>
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Two-Step Process
                  </p>
                  <ul className="text-xs text-blue-700 mt-1 space-y-1">
                    <li className={cn("flex items-center gap-2", credentialsSaved && "line-through opacity-60")}>
                      {credentialsSaved ? (
                        <HugeiconsIcon icon={Tick01Icon} className="w-3 h-3 text-green-600" />
                      ) : (
                        <span className="w-3 h-3 rounded-full border-2 border-blue-600"></span>
                      )}
                      Step 1: Save your professional credentials
                    </li>
                    <li className={cn("flex items-center gap-2", uploadedFiles.length > 0 && "line-through opacity-60")}>
                      {uploadedFiles.length > 0 ? (
                        <HugeiconsIcon icon={Tick01Icon} className="w-3 h-3 text-green-600" />
                      ) : (
                        <span className="w-3 h-3 rounded-full border-2 border-blue-600"></span>
                      )}
                      Step 2: Upload your documents
                    </li>
                    <li className={cn("flex items-center gap-2", !credentialsSaved || uploadedFiles.length === 0 ? "opacity-50" : "")}>
                      <span className="w-3 h-3 rounded-full border-2 border-blue-600"></span>
                      Step 3: Continue to specializations
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Verification Info */}
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Verified Professional Profile
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Your credentials will be verified by our team before your profile
                    goes live. This helps maintain trust and quality on our platform.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar with Progress Tracker */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <ProgressTracker
              currentStep={currentStep}
              completedSteps={completedSteps}
              variant="compact"
              className="mb-6"
            />
            
            {/* Upload Progress - removed since we're using simple local state */}
            {/* {documentUpload.uploadProgress.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-sm mb-3">Upload Progress</h4>
                <div className="space-y-2">
                  {documentUpload.uploadProgress.map((progress) => (
                    <div key={progress.fileId} className="text-xs">
                      <div className="flex justify-between mb-1">
                        <span className="truncate">{progress.fileName}</span>
                        <span>{progress.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className={cn(
                            "h-1 rounded-full transition-all",
                            progress.status === 'completed' ? "bg-green-500" :
                            progress.status === 'error' ? "bg-red-500" : "bg-blue-500"
                          )}
                          style={{ width: `${progress.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )} */}
            
            {/* Auto-save Settings */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-sm mb-3">Auto-save Settings</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Auto-save enabled</span>
                <Badge variant={draftManager.isAutoSaveEnabled ? "default" : "secondary"}>
                  {draftManager.isAutoSaveEnabled ? "On" : "Off"}
                </Badge>
              </div>
              {draftManager.lastSaved && draftManager.lastSaved instanceof Date && !Number.isNaN(draftManager.lastSaved.getTime()) && (
                <p className="text-xs text-gray-500 mt-2">
                  Last saved: {draftManager.lastSaved.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
