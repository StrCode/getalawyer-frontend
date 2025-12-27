import { useCallback, useRef, useState } from 'react';
import type { FileUploadError, UploadedFile, UploadProgress } from '@/components/ui/file-uploader';

export interface UseFileUploadOptions {
  maxSize?: number;
  acceptedTypes?: string[];
  maxFiles?: number;
  uploadFunction?: (file: File, onProgress: (progress: number) => void) => Promise<UploadedFile>;
  onUploadComplete?: (files: UploadedFile[]) => void;
  onUploadError?: (error: FileUploadError) => void;
}

export interface UseFileUploadReturn {
  uploadedFiles: UploadedFile[];
  uploadProgress: UploadProgress[];
  isUploading: boolean;
  uploadFiles: (files: File[]) => Promise<void>;
  removeFile: (fileId: string) => void;
  replaceFile: (fileId: string, newFile: File) => Promise<void>;
  cancelUpload: (fileId: string) => void;
  clearAll: () => void;
  hasErrors: boolean;
  totalSize: number;
}

export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    acceptedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
    maxFiles = 5,
    uploadFunction,
    onUploadComplete,
    onUploadError
  } = options;

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  // Validate file
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

  // Default upload function
  const defaultUploadFunction = useCallback(async (
    file: File, 
    onProgress: (progress: number) => void
  ): Promise<UploadedFile> => {
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      onProgress(i);
    }

    // Generate preview for images
    let preview = '';
    if (file.type.startsWith('image/')) {
      preview = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
    
    return {
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: preview || URL.createObjectURL(file),
      uploadedAt: new Date(),
      preview
    };
  }, []);

  // Upload files
  const uploadFiles = useCallback(async (files: File[]) => {
    // Check total file limit
    const totalFiles = uploadedFiles.length + files.length;
    if (totalFiles > maxFiles) {
      const error: FileUploadError = {
        code: 'FILE_TOO_LARGE',
        message: `Cannot upload more than ${maxFiles} files. Currently have ${uploadedFiles.length} files.`
      };
      onUploadError?.(error);
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
    validationErrors.forEach(error => onUploadError?.(error));

    if (validFiles.length === 0) return;

    // Initialize progress tracking
    const initialProgress: UploadProgress[] = validFiles.map(file => ({
      fileId: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fileName: file.name,
      progress: 0,
      status: 'pending' as const
    }));

    setUploadProgress(prev => [...prev, ...initialProgress]);

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
    uploadedFiles.length, 
    maxFiles, 
    validateFile, 
    onUploadError, 
    uploadFunction, 
    defaultUploadFunction, 
    onUploadComplete
  ]);

  // Remove file
  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  // Replace file
  const replaceFile = useCallback(async (fileId: string, newFile: File) => {
    // Remove the old file first
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    
    // Upload the new file
    await uploadFiles([newFile]);
  }, [uploadFiles]);

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

  // Clear all files
  const clearAll = useCallback(() => {
    setUploadedFiles([]);
    setUploadProgress([]);
    // Cancel all ongoing uploads
    abortControllersRef.current.forEach(controller => controller.abort());
    abortControllersRef.current.clear();
  }, []);

  // Computed values
  const isUploading = uploadProgress.some(p => p.status === 'uploading');
  const hasErrors = uploadProgress.some(p => p.status === 'error');
  const totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);

  return {
    uploadedFiles,
    uploadProgress,
    isUploading,
    uploadFiles,
    removeFile,
    replaceFile,
    cancelUpload,
    clearAll,
    hasErrors,
    totalSize
  };
}