import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getUserFriendlyErrorMessage,
  isRetryableError,
  NINVerificationError,
  verifyNIN,
} from '../nin-verification';

describe('NIN Verification Service', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('verifyNIN', () => {
    it('should throw error for invalid NIN format (empty)', async () => {
      await expect(verifyNIN('')).rejects.toThrow(NINVerificationError);
      await expect(verifyNIN('')).rejects.toThrow('Invalid NIN format');
    });

    it('should throw error for invalid NIN format (wrong length)', async () => {
      await expect(verifyNIN('12345')).rejects.toThrow(NINVerificationError);
      await expect(verifyNIN('123456789012')).rejects.toThrow(NINVerificationError);
    });

    it('should throw error for invalid NIN format (non-numeric)', async () => {
      await expect(verifyNIN('1234567890A')).rejects.toThrow(NINVerificationError);
    });

    it('should successfully verify valid NIN', async () => {
      const mockResponse = {
        success: true,
        data: {
          nin: '12345678901',
          fullName: 'John Doe',
          dateOfBirth: '1990-01-01',
          gender: 'M',
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await verifyNIN('12345678901');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/lawyers/verify-nin'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ nin: '12345678901' }),
        })
      );
    });

    it('should throw non-retryable error for 404 (NIN not found)', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'NIN not found' }),
      });

      try {
        await verifyNIN('12345678901');
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NINVerificationError);
        expect((error as NINVerificationError).code).toBe('NIN_NOT_FOUND');
        expect((error as NINVerificationError).retryable).toBe(false);
      }
    });

    it('should retry on 500 server error with exponential backoff', async () => {
      // Mock Date.now for consistent timing
      const mockNow = vi.spyOn(Date, 'now');
      mockNow.mockReturnValue(0);

      // Mock Math.random for consistent jitter
      const mockRandom = vi.spyOn(Math, 'random');
      mockRandom.mockReturnValue(0.5);

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Server error' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Server error' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              nin: '12345678901',
              fullName: 'John Doe',
              dateOfBirth: '1990-01-01',
              gender: 'M',
            },
          }),
        });

      const result = await verifyNIN('12345678901');

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(3);

      mockNow.mockRestore();
      mockRandom.mockRestore();
    });

    it('should throw after max retries on persistent server error', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      });

      await expect(verifyNIN('12345678901')).rejects.toThrow(NINVerificationError);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should handle network errors with retry', async () => {
      (global.fetch as any)
        .mockRejectedValueOnce(new TypeError('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              nin: '12345678901',
              fullName: 'John Doe',
              dateOfBirth: '1990-01-01',
              gender: 'M',
            },
          }),
        });

      const result = await verifyNIN('12345678901');

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('isRetryableError', () => {
    it('should return true for retryable errors', () => {
      const error = new NINVerificationError('Server error', 'SERVER_ERROR', true);
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return false for non-retryable errors', () => {
      const error = new NINVerificationError('Invalid NIN', 'INVALID_NIN', false);
      expect(isRetryableError(error)).toBe(false);
    });

    it('should return false for non-NINVerificationError', () => {
      const error = new Error('Some error');
      expect(isRetryableError(error)).toBe(false);
    });
  });

  describe('getUserFriendlyErrorMessage', () => {
    it('should return user-friendly message for INVALID_FORMAT', () => {
      const error = new NINVerificationError('Invalid format', 'INVALID_FORMAT', false);
      expect(getUserFriendlyErrorMessage(error)).toBe('Please enter a valid 11-digit NIN.');
    });

    it('should return user-friendly message for NIN_NOT_FOUND', () => {
      const error = new NINVerificationError('Not found', 'NIN_NOT_FOUND', false);
      expect(getUserFriendlyErrorMessage(error)).toBe('NIN not found in the database. Please verify your NIN is correct.');
    });

    it('should return user-friendly message for RATE_LIMIT_EXCEEDED', () => {
      const error = new NINVerificationError('Rate limit', 'RATE_LIMIT_EXCEEDED', true);
      expect(getUserFriendlyErrorMessage(error)).toBe('Too many verification attempts. Please wait a few minutes and try again.');
    });

    it('should return generic message for unknown error', () => {
      const error = new Error('Unknown error');
      expect(getUserFriendlyErrorMessage(error)).toBe('Unknown error');
    });
  });
});
