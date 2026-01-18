import { Cancel01Icon, ImageUpload01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PhotoUploaderProps {
  onPhotoSelect: (file: File) => void;
  onPhotoRemove: () => void;
  currentPhoto?: string | null;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export function PhotoUploader({
  onPhotoSelect,
  onPhotoRemove,
  currentPhoto,
  error,
  disabled = false,
  className
}: PhotoUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentPhoto || null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Please upload a JPEG, PNG, or WebP image';
    }

    // Check file size
    if (file.size > MAX_SIZE) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(1);
      return `Photo must be under 5MB. Current size: ${sizeMB}MB`;
    }

    return null;
  }, []);

  // Generate preview
  const generatePreview = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    if (disabled) return;

    // Validate file
    const error = validateFile(file);
    if (error) {
      setValidationError(error);
      return;
    }

    // Clear any previous errors
    setValidationError(null);

    // Generate preview
    generatePreview(file);

    // Notify parent
    onPhotoSelect(file);
  }, [disabled, validateFile, generatePreview, onPhotoSelect]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input value to allow re-uploading same file
    e.target.value = '';
  }, [handleFileSelect]);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [disabled, handleFileSelect]);

  // Handle click to upload
  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  // Handle remove photo
  const handleRemove = useCallback(() => {
    setPreview(null);
    setValidationError(null);
    onPhotoRemove();
  }, [onPhotoRemove]);

  // Handle replace photo
  const handleReplace = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const displayError = error || validationError;

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
        aria-label="Upload photograph"
      />

      {!preview ? (
        // Upload area
        <button
          type="button"
          className={cn(
            'w-full border-2 border-dashed rounded-lg text-center transition-all duration-200 cursor-pointer p-8',
            isDragOver && !disabled
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400',
            disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
            displayError && 'border-red-300 bg-red-50'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          disabled={disabled}
          aria-label="Upload photograph. Accepted formats: JPEG, PNG, WebP. Maximum size: 5MB"
        >
          <HugeiconsIcon 
            icon={ImageUpload01Icon} 
            className={cn(
              'mx-auto mb-4 h-12 w-12',
              isDragOver ? 'text-blue-500' : 'text-gray-400'
            )}
            aria-hidden="true"
          />
          
          <div className="space-y-2">
            <p className="font-medium text-gray-700 text-sm">
              {isDragOver 
                ? 'Drop photo here' 
                : 'Click to upload or drag and drop'
              }
            </p>
            <p className="text-gray-500 text-xs">
              JPEG, PNG, or WebP (Max 5MB)
            </p>
          </div>
        </button>
      ) : (
        // Preview area
        <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
          <div className="flex items-start gap-4">
            {/* Image preview */}
            <div className="relative shrink-0">
              <img 
                src={preview} 
                alt="Photograph preview"
                className="w-32 h-32 object-cover rounded border border-gray-200"
              />
            </div>

            {/* Actions */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 mb-3">
                Photograph uploaded
              </p>
              
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReplace}
                  disabled={disabled}
                  className="text-xs h-8"
                >
                  Replace
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={disabled}
                  className="text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {displayError && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-red-600 text-sm shrink-0">⚠</span>
          <p className="text-sm text-red-600">{displayError}</p>
        </div>
      )}
    </div>
  );
}
