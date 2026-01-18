/**
 * Photo Upload Service
 * 
 * Handles photograph upload with retry logic and comprehensive error handling.
 */

import { api } from '@/lib/api/client';

/**
 * Photo Upload Error
 */
export class PhotoUploadError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false,
  ) {
    super(message);
    this.name = 'PhotoUploadError';
  }
}

/**
 * Upload photo with retry logic
 * 
 * @param file - The photo file to upload
 * @param onProgress - Optional progress callback
 * @returns Promise resolving to upload response
 * @throws PhotoUploadError for upload failures
 * 
 * Requirements: 4.4, 4.5, 8.3
 */
export async function uploadPhoto(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{
  url: string;
  publicId: string;
  originalName: string;
}> {
  try {
    // Validate file before upload
    if (!file) {
      throw new PhotoUploadError(
        'No file provided',
        'NO_FILE',
        false
      );
    }

    // Validate file type
    const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!acceptedTypes.includes(file.type)) {
      throw new PhotoUploadError(
        'Invalid file type. Please upload a JPEG, PNG, or WebP image.',
        'INVALID_FILE_TYPE',
        false
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(1);
      throw new PhotoUploadError(
        `File too large. Maximum size is 5MB. Your file is ${sizeMB}MB.`,
        'FILE_TOO_LARGE',
        false
      );
    }

    // Report initial progress
    if (onProgress) {
      onProgress(0);
    }

    // Upload using the API client (which has built-in retry logic)
    const metadata = {
      documentType: 'other' as const,
      description: 'Lawyer photograph',
    };

    const response = await api.lawyer.uploadDocument(file, metadata, onProgress);

    // Report completion
    if (onProgress) {
      onProgress(100);
    }

    if (!response.success || !response.document) {
      throw new PhotoUploadError(
        response.message || 'Upload failed',
        'UPLOAD_FAILED',
        true
      );
    }

    return {
      url: response.document.url,
      publicId: response.document.publicId,
      originalName: response.document.originalName,
    };

  } catch (error) {
    // Re-throw PhotoUploadError as-is
    if (error instanceof PhotoUploadError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError) {
      throw new PhotoUploadError(
        'Network error. Please check your connection and try again.',
        'NETWORK_ERROR',
        true
      );
    }

    // Handle API errors
    if (error instanceof Error) {
      // Check if it's a retryable error based on message
      const isRetryable = 
        error.message.includes('network') ||
        error.message.includes('timeout') ||
        error.message.includes('503') ||
        error.message.includes('502');

      throw new PhotoUploadError(
        error.message || 'Upload failed. Please try again.',
        'UPLOAD_ERROR',
        isRetryable
      );
    }

    // Unknown error
    throw new PhotoUploadError(
      'An unexpected error occurred during upload.',
      'UNKNOWN_ERROR',
      true
    );
  }
}

/**
 * Check if an error is retryable
 */
export function isRetryableUploadError(error: unknown): boolean {
  if (error instanceof PhotoUploadError) {
    return error.retryable;
  }
  return false;
}

/**
 * Get user-friendly error message for display
 */
export function getUploadErrorMessage(error: unknown): string {
  if (error instanceof PhotoUploadError) {
    switch (error.code) {
      case 'NO_FILE':
        return 'Please select a photo to upload.';
      case 'INVALID_FILE_TYPE':
        return 'Invalid file type. Please upload a JPEG, PNG, or WebP image.';
      case 'FILE_TOO_LARGE':
        return error.message; // Already has size info
      case 'NETWORK_ERROR':
        return 'Network connection error. Please check your internet and try again.';
      case 'UPLOAD_FAILED':
        return 'Upload failed. Please try again.';
      case 'UPLOAD_ERROR':
        return error.message;
      default:
        return 'An error occurred during upload. Please try again.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}
