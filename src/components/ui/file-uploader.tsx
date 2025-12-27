import { 
  Cancel01Icon, 
  File02Icon, 
  FileSyncIcon,
  Loading03Icon, 
  Upload02Icon 
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { responsiveClasses, useBreakpoint, useResponsiveFileUpload, useTouchDevice } from '@/utils/responsive-design';
import { Button } from './button';
import { Progress } from './progress';

export interface FileUploadError {
  code: 'FILE_TOO_LARGE' | 'INVALID_TYPE' | 'UPLOAD_FAILED' | 'NETWORK_ERROR';
  message: string;
  file?: File;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'cancelled';
  error?: FileUploadError;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  publicId?: string;
  uploadedAt: Date;
  preview?: string;
}

export interface FileUploaderProps {
  acceptedTypes?: string[];
  maxSize?: number; // in bytes
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  onUploadStart?: (files: File[]) => void;
  onUploadProgress?: (progress: UploadProgress[]) => void;
  onUploadComplete?: (files: UploadedFile[]) => void;
  onUploadError?: (error: FileUploadError) => void;
  onFileRemove?: (fileId: string) => void;
  onFileReplace?: (oldFileId: string, newFile: File) => void;
  existingFiles?: UploadedFile[];
  uploadFunction?: (file: File, onProgress: (progress: number) => void) => Promise<UploadedFile>;
  showPreviews?: boolean;
  allowRetry?: boolean;
}

const DEFAULT_ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp'
];

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_MAX_FILES = 5;

export function FileUploader({
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxSize = DEFAULT_MAX_SIZE,
  maxFiles = DEFAULT_MAX_FILES,
  multiple = true,
  disabled = false,
  className,
  onUploadStart,
  onUploadComplete,
  onUploadError,
  onFileRemove,
  onFileReplace,
  existingFiles = [],
  uploadFunction,
  showPreviews = true,
  allowRetry = true
}: Omit<FileUploaderProps, 'onUploadProgress'>) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(existingFiles);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  
  // Responsive design hooks
  const { isMobile } = useBreakpoint();
  const responsiveUpload = useResponsiveFileUpload();

  // Validate file before upload
  const validateFile = useCallback((file: File): FileUploadError | null => {
    if (!acceptedTypes.includes(file.type)) {
      return {
        code: 'INVALID_TYPE',
        message: `File type ${file.type} is not supported. Please upload: ${acceptedTypes.join(', ')}`,
        file
      };
    }

    if (file.size > maxSize) {
      return {
        code: 'FILE_TOO_LARGE',
        message: `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds maximum ${(maxSize / 1024 / 1024).toFixed(1)}MB`,
        file
      };
    }

    return null;
  }, [acceptedTypes, maxSize]);

  // Generate file preview
  const generatePreview = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve(''); // No preview for non-images
      }
    });
  }, []);

  // Default upload function (mock implementation)
  const defaultUploadFunction = useCallback(async (
    file: File, 
    onProgress: (progress: number) => void
  ): Promise<UploadedFile> => {
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      onProgress(i);
    }

    const preview = await generatePreview(file);
    
    return {
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: preview || URL.createObjectURL(file),
      uploadedAt: new Date(),
      preview
    };
  }, [generatePreview]);

  // Handle file upload
  const handleUpload = useCallback(async (files: File[]) => {
    if (disabled) return;

    // Check total file limit
    const totalFiles = uploadedFiles.length + files.length;
    if (totalFiles > maxFiles) {
      onUploadError?.({
        code: 'FILE_TOO_LARGE',
        message: `Cannot upload more than ${maxFiles} files. Currently have ${uploadedFiles.length} files.`
      });
      return;
    }

    // Validate all files first
    const validationErrors: FileUploadError[] = [];
    const validFiles: File[] = [];

    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(error);
      } else {
        validFiles.push(file);
      }
    }

    // Report validation errors
    for (const error of validationErrors) {
      onUploadError?.(error);
    }

    if (validFiles.length === 0) return;

    // Initialize progress tracking
    const initialProgress: UploadProgress[] = validFiles.map(file => ({
      fileId: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fileName: file.name,
      progress: 0,
      status: 'pending' as const
    }));

    setUploadProgress(prev => [...prev, ...initialProgress]);
    onUploadStart?.(validFiles);

    // Upload files
    const uploadPromises = validFiles.map(async (file, index) => {
      const progressItem = initialProgress[index];
      const abortController = new AbortController();
      abortControllersRef.current.set(progressItem.fileId, abortController);

      try {
        // Update status to uploading
        setUploadProgress(prev => 
          prev.map(p => 
            p.fileId === progressItem.fileId 
              ? { ...p, status: 'uploading' as const }
              : p
          )
        );

        const uploadFn = uploadFunction || defaultUploadFunction;
        
        const uploadedFile = await uploadFn(file, (progress) => {
          setUploadProgress(prev => 
            prev.map(p => 
              p.fileId === progressItem.fileId 
                ? { ...p, progress }
                : p
            )
          );
        });

        // Update status to completed
        setUploadProgress(prev => 
          prev.map(p => 
            p.fileId === progressItem.fileId 
              ? { ...p, status: 'completed' as const, progress: 100 }
              : p
          )
        );

        setUploadedFiles(prev => [...prev, uploadedFile]);
        return uploadedFile;

      } catch (error) {
        const uploadError: FileUploadError = {
          code: 'UPLOAD_FAILED',
          message: error instanceof Error ? error.message : 'Upload failed',
          file
        };

        setUploadProgress(prev => 
          prev.map(p => 
            p.fileId === progressItem.fileId 
              ? { ...p, status: 'error' as const, error: uploadError }
              : p
          )
        );

        onUploadError?.(uploadError);
        return null;
      } finally {
        abortControllersRef.current.delete(progressItem.fileId);
      }
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter((file): file is UploadedFile => file !== null);
    
    if (successfulUploads.length > 0) {
      onUploadComplete?.(successfulUploads);
    }

    // Clean up completed/errored progress after delay
    setTimeout(() => {
      setUploadProgress(prev => 
        prev.filter(p => p.status === 'uploading')
      );
    }, 3000);

  }, [
    disabled, 
    uploadedFiles.length, 
    maxFiles, 
    validateFile, 
    onUploadError, 
    onUploadStart, 
    uploadFunction, 
    defaultUploadFunction, 
    onUploadComplete
  ]);

  // Cancel upload
  const cancelUpload = useCallback((fileId: string) => {
    const controller = abortControllersRef.current.get(fileId);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(fileId);
    }

    setUploadProgress(prev => 
      prev.map(p => 
        p.fileId === fileId 
          ? { ...p, status: 'cancelled' as const }
          : p
      )
    );
  }, []);

  // Remove uploaded file
  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    onFileRemove?.(fileId);
  }, [onFileRemove]);

  // Replace uploaded file
  const replaceFile = useCallback((fileId: string, newFile: File) => {
    // Remove the old file first
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    
    // Upload the new file
    handleUpload([newFile]);
  }, [handleUpload]);

  // Retry failed upload
  const retryUpload = useCallback((fileId: string) => {
    const failedProgress = uploadProgress.find(p => p.fileId === fileId && p.status === 'error');
    if (!failedProgress) return;

    // Find the original file (this would need to be stored in progress)
    // For now, we'll trigger file input to select a new file
    fileInputRef.current?.click();
  }, [uploadProgress]);

  // Drag and drop handlers - only enable on non-touch devices or tablets+
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && responsiveUpload.enableDragDrop) {
      setIsDragOver(true);
    }
  }, [disabled, responsiveUpload.enableDragDrop]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled || !responsiveUpload.enableDragDrop) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleUpload(files);
    }
  }, [disabled, responsiveUpload.enableDragDrop, handleUpload]);

  // File input change handler
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleUpload(files);
    }
    // Reset input value to allow re-uploading same file
    e.target.value = '';
  }, [handleUpload]);

  // Click to upload
  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / (k ** i)).toFixed(1))} ${sizes[i]}`;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return File02Icon;
    if (type === 'application/pdf') return FileSyncIcon;
    return File02Icon;
  };

  return (
    <div className={cn('space-y-4', className)} role="region" aria-labelledby="file-uploader-heading">
      <div className="sr-only" id="file-uploader-heading">File Upload Area</div>
      
      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg text-center transition-all duration-200 cursor-pointer',
          isMobile ? 'p-4' : 'p-6',
          isDragOver && !disabled && responsiveUpload.enableDragDrop
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
          responsiveUpload.touchOptimized && 'active:bg-gray-50'
        )}
        onDragOver={responsiveUpload.enableDragDrop ? handleDragOver : undefined}
        onDragLeave={responsiveUpload.enableDragDrop ? handleDragLeave : undefined}
        onDrop={responsiveUpload.enableDragDrop ? handleDrop : undefined}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={`Upload files. ${multiple ? `Up to ${maxFiles} files` : 'Single file only'}. Accepted formats: ${acceptedTypes.includes('application/pdf') ? 'PDF, ' : ''}${acceptedTypes.some(type => type.startsWith('image/')) ? 'Images ' : ''}(Max ${formatFileSize(maxSize)})`}
        aria-describedby="upload-instructions"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
          aria-describedby="upload-instructions"
        />

        <HugeiconsIcon 
          icon={Upload02Icon} 
          className={cn(
            'mx-auto mb-4',
            isMobile ? 'h-10 w-10' : 'h-12 w-12',
            isDragOver ? 'text-blue-500' : 'text-gray-400'
          )}
          aria-hidden="true"
        />
        
        <div className="space-y-2" id="upload-instructions">
          <p className={cn(
            "font-medium text-gray-700",
            isMobile ? "text-sm" : "text-sm"
          )}>
            {isDragOver 
              ? 'Drop files here' 
              : responsiveUpload.enableDragDrop 
                ? 'Click to upload or drag and drop'
                : 'Tap to upload files'
            }
          </p>
          <p className={cn(
            "text-gray-500",
            isMobile ? "text-xs" : "text-xs"
          )}>
            {acceptedTypes.includes('application/pdf') ? 'PDF, ' : ''}
            {acceptedTypes.some(type => type.startsWith('image/')) ? 'Images ' : ''}
            (Max {formatFileSize(maxSize)})
          </p>
          <p className={cn(
            "text-gray-400",
            isMobile ? "text-xs" : "text-xs"
          )}>
            {multiple ? `Up to ${maxFiles} files` : 'Single file only'}
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="space-y-2" role="region" aria-labelledby="upload-progress-heading">
          <h4 className="text-sm font-medium text-gray-700" id="upload-progress-heading">Upload Progress</h4>
          {uploadProgress.map((progress) => (
            <div key={progress.fileId} className="border border-gray-200 rounded-lg p-3" role="status" aria-live="polite">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {progress.status === 'uploading' ? (
                    <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 text-blue-500 animate-spin" aria-hidden="true" />
                  ) : progress.status === 'completed' ? (
                    <span className="text-green-500 text-sm" aria-hidden="true">✓</span>
                  ) : progress.status === 'error' ? (
                    <span className="text-red-500 text-sm" aria-hidden="true">✗</span>
                  ) : progress.status === 'cancelled' ? (
                    <span className="text-gray-500 text-sm" aria-hidden="true">⊘</span>
                  ) : (
                    <HugeiconsIcon icon={File02Icon} className="h-4 w-4 text-gray-400" aria-hidden="true" />
                  )}
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {progress.fileName}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  {progress.status === 'uploading' && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => cancelUpload(progress.fileId)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                      title="Cancel upload"
                      aria-label={`Cancel upload of ${progress.fileName}`}
                    >
                      <HugeiconsIcon icon={Cancel01Icon} className="h-3 w-3" />
                    </Button>
                  )}
                  
                  {progress.status === 'error' && allowRetry && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => retryUpload(progress.fileId)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-blue-500"
                      title="Retry upload"
                      aria-label={`Retry upload of ${progress.fileName}`}
                    >
                      <HugeiconsIcon icon={FileSyncIcon} className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {progress.status === 'uploading' && (
                <div className="space-y-1">
                  <Progress value={progress.progress} className="h-2" aria-hidden="true" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{progress.progress}% complete</span>
                    <span>{progress.status === 'uploading' ? 'Uploading...' : ''}</span>
                  </div>
                </div>
              )}

              {progress.status === 'error' && progress.error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded" role="alert">
                  <p className="text-xs text-red-600 font-medium">Upload Failed</p>
                  <p className="text-xs text-red-600 mt-1">{progress.error.message}</p>
                  {allowRetry && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => retryUpload(progress.fileId)}
                      className="mt-2 h-6 text-xs"
                      aria-label={`Try uploading ${progress.fileName} again`}
                    >
                      Try Again
                    </Button>
                  )}
                </div>
              )}

              {progress.status === 'cancelled' && (
                <p className="text-xs text-gray-500 mt-1">Upload cancelled</p>
              )}

              {progress.status === 'completed' && (
                <p className="text-xs text-green-600 mt-1">Upload completed successfully</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2" role="region" aria-labelledby="uploaded-files-heading">
          <h4 className={cn(
            "font-medium text-gray-700",
            isMobile ? "text-sm" : "text-sm"
          )} id="uploaded-files-heading">
            Uploaded Files ({uploadedFiles.length}/{maxFiles})
          </h4>
          {uploadedFiles.slice(0, responsiveUpload.maxVisibleFiles).map((file) => (
            <div key={file.id} className={cn(
              "border border-gray-200 rounded-lg bg-white",
              isMobile ? "p-2" : "p-3"
            )}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <HugeiconsIcon 
                    icon={getFileIcon(file.type)} 
                    className={cn(
                      "text-blue-500 shrink-0 mt-0.5",
                      isMobile ? "h-6 w-6" : "h-8 w-8"
                    )}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className={cn(
                      "font-medium text-gray-900 truncate",
                      isMobile ? "text-sm" : "text-sm"
                    )}>
                      {file.name}
                    </p>
                    <p className={cn(
                      "text-gray-500",
                      isMobile ? "text-xs" : "text-xs"
                    )}>
                      {formatFileSize(file.size)} • Uploaded {file.uploadedAt && file.uploadedAt instanceof Date && !isNaN(file.uploadedAt.getTime()) ? file.uploadedAt.toLocaleTimeString() : 'Unknown time'}
                    </p>
                    
                    {/* File Actions */}
                    <div className={cn(
                      "flex items-center gap-2 mt-2",
                      isMobile && "flex-col gap-1"
                    )}>
                      {file.url && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(file.url, '_blank')}
                          className={cn(
                            "text-xs",
                            isMobile ? "h-8 w-full" : "h-6",
                            responsiveUpload.touchOptimized && responsiveClasses.touchTarget
                          )}
                          aria-label={`View ${file.name} in new tab`}
                        >
                          View
                        </Button>
                      )}
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = acceptedTypes.join(',');
                          input.onchange = (e) => {
                            const newFile = (e.target as HTMLInputElement).files?.[0];
                            if (newFile) {
                              replaceFile(file.id, newFile);
                              onFileReplace?.(file.id, newFile);
                            }
                          };
                          input.click();
                        }}
                        className={cn(
                          "text-xs",
                          isMobile ? "h-8 w-full" : "h-6",
                          responsiveUpload.touchOptimized && responsiveClasses.touchTarget
                        )}
                        aria-label={`Replace ${file.name} with a new file`}
                      >
                        Replace
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className={cn(
                    "text-gray-400 hover:text-red-500 shrink-0",
                    isMobile ? "h-8 w-8 p-0" : "h-8 w-8 p-0",
                    responsiveUpload.touchOptimized && responsiveClasses.touchTarget
                  )}
                  title="Remove file"
                  aria-label={`Remove ${file.name}`}
                >
                  <HugeiconsIcon icon={Cancel01Icon} className={cn(
                    isMobile ? "h-5 w-5" : "h-4 w-4"
                  )} />
                </Button>
              </div>

              {/* Image Preview */}
              {showPreviews && file.preview && file.type.startsWith('image/') && (
                <div className="mt-3 border-t pt-3">
                  <button
                    type="button"
                    onClick={() => window.open(file.preview, '_blank')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        window.open(file.preview, '_blank');
                      }
                    }}
                    className={cn(
                      "object-cover rounded border cursor-pointer hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                      isMobile ? "max-w-full h-24" : "max-w-full h-32"
                    )}
                    aria-label={`View full size image of ${file.name}`}
                  >
                    <img 
                      src={file.preview} 
                      alt={`Preview of ${file.name}`}
                      className={cn(
                        "object-cover rounded border",
                        isMobile ? "max-w-full h-24" : "max-w-full h-32"
                      )}
                    />
                  </button>
                </div>
              )}

              {/* PDF Preview Placeholder */}
              {showPreviews && file.type === 'application/pdf' && (
                <div className="mt-3 border-t pt-3">
                  <div className={cn(
                    "flex items-center justify-center bg-gray-50 rounded border border-dashed border-gray-300",
                    isMobile ? "h-16" : "h-20"
                  )} role="img" aria-label="PDF document preview placeholder">
                    <div className="text-center">
                      <HugeiconsIcon icon={FileSyncIcon} className={cn(
                        "text-gray-400 mx-auto mb-1",
                        isMobile ? "h-6 w-6" : "h-8 w-8"
                      )} aria-hidden="true" />
                      <p className={cn(
                        "text-gray-500",
                        isMobile ? "text-xs" : "text-xs"
                      )}>PDF Document</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Show more files indicator on mobile */}
          {uploadedFiles.length > responsiveUpload.maxVisibleFiles && (
            <div className="text-center py-2">
              <p className="text-sm text-gray-500">
                +{uploadedFiles.length - responsiveUpload.maxVisibleFiles} more files
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}