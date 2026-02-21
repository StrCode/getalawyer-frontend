import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  FILE_UPLOAD_CONSTRAINTS,
  REGISTRATION_ERROR_MESSAGES,
  REGISTRATION_SUCCESS_MESSAGES,
} from "@/constants/registration";
import { useUploadDocuments } from "@/hooks/use-registration";
import { useToast } from "@/hooks/use-toast";
import type { DocumentUploadFormData } from "@/lib/schemas/registration";
import { documentUploadSchema } from "@/lib/schemas/registration";
import { useRegistrationStore } from "@/stores/registration-store";

/**
 * DocumentUploadForm Component
 *
 * Step 6 of the lawyer registration process.
 * Handles document upload for Call to Bar Certificate, LLB Certificate, and Passport Photo.
 *
 * Features:
 * - File upload inputs for 3 documents
 * - File type and size validation
 * - File preview functionality
 * - Upload progress indicators
 * - Integrates with useUploadDocuments mutation
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10
 */
export function DocumentUploadForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateStep6Data, setRegistrationStatus } = useRegistrationStore();
  const uploadDocumentsMutation = useUploadDocuments();

  // File input refs
  const callToBarInputRef = useRef<HTMLInputElement>(null);
  const llbInputRef = useRef<HTMLInputElement>(null);
  const passportPhotoInputRef = useRef<HTMLInputElement>(null);

  // File preview states
  const [callToBarPreview, setCallToBarPreview] = useState<string | null>(null);
  const [llbPreview, setLlbPreview] = useState<string | null>(null);
  const [passportPhotoPreview, setPassportPhotoPreview] = useState<string | null>(null);

  // Upload progress state
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const {
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<DocumentUploadFormData>({
    resolver: zodResolver(documentUploadSchema),
    mode: "onChange",
  });

  const watchedCallToBar = watch("callToBarCertificate");
  const watchedLlb = watch("llbCertificate");
  const watchedPassportPhoto = watch("passportPhoto");

  // Requirement 6.6: Display file preview
  useEffect(() => {
    if (watchedCallToBar) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCallToBarPreview(reader.result as string);
      };
      reader.readAsDataURL(watchedCallToBar);
    } else {
      setCallToBarPreview(null);
    }
  }, [watchedCallToBar]);

  useEffect(() => {
    if (watchedLlb) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLlbPreview(reader.result as string);
      };
      reader.readAsDataURL(watchedLlb);
    } else {
      setLlbPreview(null);
    }
  }, [watchedLlb]);

  useEffect(() => {
    if (watchedPassportPhoto) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPassportPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(watchedPassportPhoto);
    } else {
      setPassportPhotoPreview(null);
    }
  }, [watchedPassportPhoto]);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof DocumentUploadFormData
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue(fieldName, file, { shouldValidate: true });
    }
  };

  const handleRemoveFile = (fieldName: keyof DocumentUploadFormData) => {
    setValue(fieldName, null as unknown as File, { shouldValidate: true });
    
    // Reset the file input
    if (fieldName === "callToBarCertificate" && callToBarInputRef.current) {
      callToBarInputRef.current.value = "";
    } else if (fieldName === "llbCertificate" && llbInputRef.current) {
      llbInputRef.current.value = "";
    } else if (fieldName === "passportPhoto" && passportPhotoInputRef.current) {
      passportPhotoInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: DocumentUploadFormData) => {
    try {
      // Requirement 6.7: Validate all three documents are uploaded
      if (!data.callToBarCertificate || !data.llbCertificate || !data.passportPhoto) {
        toast({
          title: "Error",
          description: REGISTRATION_ERROR_MESSAGES.MISSING_DOCUMENTS,
          variant: "destructive",
        });
        return;
      }

      // Update local store
      updateStep6Data(data);

      // Requirement 6.8: Create FormData and send to backend
      const formData = new FormData();
      formData.append("callToBarCertificate", data.callToBarCertificate);
      formData.append("llbCertificate", data.llbCertificate);
      formData.append("passportPhoto", data.passportPhoto);

      // Simulate upload progress
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await uploadDocumentsMutation.mutateAsync(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Requirement 6.9: Update registration status
      setRegistrationStatus(response.registration_status);

      toast({
        title: "Success",
        description: REGISTRATION_SUCCESS_MESSAGES.DOCUMENTS_UPLOADED,
      });

      // Requirement 6.10: Navigate to Step 7
      setTimeout(() => {
        navigate({ to: "/register/step7" });
      }, 500);
    } catch (error) {
      setUploadProgress(0);
      const errorMessage =
        error instanceof Error
          ? error.message
          : REGISTRATION_ERROR_MESSAGES.SERVER_ERROR;
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const result = Math.round((bytes / Math.pow(k, i)) * 100) / 100;
    return `${result} ${sizes[i]}`;
  };

  const getFileIcon = (file: File) => {
    if (file.type === "application/pdf") {
      return <FileText className="w-12 h-12 text-red-500" />;
    }
    return null;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <h1 className="font-bold text-gray-900 text-2xl">
            Document Upload
          </h1>
          <p className="mt-2 text-gray-600 text-sm">
            Upload your credentials and passport photo for verification
          </p>
        </div>

        {/* Call to Bar Certificate Upload */}
        <div className="space-y-2">
          <Label htmlFor="callToBarCertificate" className="required">
            Call to Bar Certificate
          </Label>
          <div className="p-6 border-2 border-gray-300 hover:border-gray-400 border-dashed rounded-lg transition-colors">
            {!watchedCallToBar ? (
              <div className="flex flex-col justify-center items-center space-y-2">
                <Upload className="w-10 h-10 text-gray-400" />
                <div className="text-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => callToBarInputRef.current?.click()}
                    className="mb-2"
                  >
                    Choose File
                  </Button>
                  <p className="text-gray-500 text-xs">
                    PDF or Image (JPEG, PNG, WebP) - Max 2MB
                  </p>
                </div>
                <input
                  ref={callToBarInputRef}
                  id="callToBarCertificate"
                  type="file"
                  accept={FILE_UPLOAD_CONSTRAINTS.CERTIFICATE_TYPES.join(",")}
                  onChange={(e) => handleFileChange(e, "callToBarCertificate")}
                  className="hidden"
                  aria-invalid={errors.callToBarCertificate ? "true" : "false"}
                  aria-describedby={
                    errors.callToBarCertificate
                      ? "callToBarCertificate-error callToBarCertificate-help"
                      : "callToBarCertificate-help"
                  }
                  aria-required="true"
                />
              </div>
            ) : (
              <div className="flex items-start space-x-4">
                <div className="shrink-0">
                  {watchedCallToBar.type.startsWith("image/") ? (
                    <img
                      src={callToBarPreview || ""}
                      alt="Call to Bar Certificate"
                      className="rounded w-24 h-24 object-cover"
                    />
                  ) : (
                    getFileIcon(watchedCallToBar)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {watchedCallToBar.name}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {formatFileSize(watchedCallToBar.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile("callToBarCertificate")}
                  aria-label="Remove Call to Bar Certificate"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          <p id="callToBarCertificate-help" className="text-gray-500 text-xs">
            Upload your Call to Bar Certificate from the Nigerian Bar Association
          </p>
          {errors.callToBarCertificate && (
            <p
              id="callToBarCertificate-error"
              className="text-red-600 text-sm"
              role="alert"
            >
              {errors.callToBarCertificate.message}
            </p>
          )}
        </div>

        {/* LLB Certificate Upload */}
        <div className="space-y-2">
          <Label htmlFor="llbCertificate" className="required">
            LLB Certificate
          </Label>
          <div className="p-6 border-2 border-gray-300 hover:border-gray-400 border-dashed rounded-lg transition-colors">
            {!watchedLlb ? (
              <div className="flex flex-col justify-center items-center space-y-2">
                <Upload className="w-10 h-10 text-gray-400" />
                <div className="text-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => llbInputRef.current?.click()}
                    className="mb-2"
                  >
                    Choose File
                  </Button>
                  <p className="text-gray-500 text-xs">
                    PDF or Image (JPEG, PNG, WebP) - Max 2MB
                  </p>
                </div>
                <input
                  ref={llbInputRef}
                  id="llbCertificate"
                  type="file"
                  accept={FILE_UPLOAD_CONSTRAINTS.CERTIFICATE_TYPES.join(",")}
                  onChange={(e) => handleFileChange(e, "llbCertificate")}
                  className="hidden"
                  aria-invalid={errors.llbCertificate ? "true" : "false"}
                  aria-describedby={
                    errors.llbCertificate
                      ? "llbCertificate-error llbCertificate-help"
                      : "llbCertificate-help"
                  }
                  aria-required="true"
                />
              </div>
            ) : (
              <div className="flex items-start space-x-4">
                <div className="shrink-0">
                  {watchedLlb.type.startsWith("image/") ? (
                    <img
                      src={llbPreview || ""}
                      alt="LLB Certificate"
                      className="rounded w-24 h-24 object-cover"
                    />
                  ) : (
                    getFileIcon(watchedLlb)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {watchedLlb.name}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {formatFileSize(watchedLlb.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile("llbCertificate")}
                  aria-label="Remove LLB Certificate"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          <p id="llbCertificate-help" className="text-gray-500 text-xs">
            Upload your Bachelor of Laws (LLB) degree certificate
          </p>
          {errors.llbCertificate && (
            <p
              id="llbCertificate-error"
              className="text-red-600 text-sm"
              role="alert"
            >
              {errors.llbCertificate.message}
            </p>
          )}
        </div>

        {/* Passport Photo Upload */}
        <div className="space-y-2">
          <Label htmlFor="passportPhoto" className="required">
            Passport Photo
          </Label>
          <div className="p-6 border-2 border-gray-300 hover:border-gray-400 border-dashed rounded-lg transition-colors">
            {!watchedPassportPhoto ? (
              <div className="flex flex-col justify-center items-center space-y-2">
                <Upload className="w-10 h-10 text-gray-400" />
                <div className="text-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => passportPhotoInputRef.current?.click()}
                    className="mb-2"
                  >
                    Choose File
                  </Button>
                  <p className="text-gray-500 text-xs">
                    Image only (JPEG, PNG, WebP) - Max 5MB
                  </p>
                </div>
                <input
                  ref={passportPhotoInputRef}
                  id="passportPhoto"
                  type="file"
                  accept={FILE_UPLOAD_CONSTRAINTS.PHOTO_TYPES.join(",")}
                  onChange={(e) => handleFileChange(e, "passportPhoto")}
                  className="hidden"
                  aria-invalid={errors.passportPhoto ? "true" : "false"}
                  aria-describedby={
                    errors.passportPhoto
                      ? "passportPhoto-error passportPhoto-help"
                      : "passportPhoto-help"
                  }
                  aria-required="true"
                />
              </div>
            ) : (
              <div className="flex items-start space-x-4">
                <div className="shrink-0">
                  <img
                    src={passportPhotoPreview || ""}
                    alt="Passport"
                    className="rounded w-24 h-24 object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {watchedPassportPhoto.name}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {formatFileSize(watchedPassportPhoto.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile("passportPhoto")}
                  aria-label="Remove passport photo"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          <p id="passportPhoto-help" className="text-gray-500 text-xs">
            Upload a recent passport-sized photograph
          </p>
          {errors.passportPhoto && (
            <p
              id="passportPhoto-error"
              className="text-red-600 text-sm"
              role="alert"
            >
              {errors.passportPhoto.message}
            </p>
          )}
        </div>

        {/* Upload Progress Indicator */}
        {isSubmitting && uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Uploading documents...</span>
              <span className="font-medium text-gray-900">{uploadProgress}%</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          aria-label="Upload documents and continue to next step"
        >
          {isSubmitting ? (
            <>
              <Loader2
                className="mr-2 w-4 h-4 animate-spin"
                aria-hidden="true"
              />
              Uploading...
            </>
          ) : (
            "Upload & Continue"
          )}
        </Button>
      </div>
    </form>
  );
}
